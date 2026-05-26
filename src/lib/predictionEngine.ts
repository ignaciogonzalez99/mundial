import { calculateTeamStrength } from "@/lib/scoring";
import type { Match, ModelState, Player, Prediction, Result, Team } from "@/lib/types";

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

function roundPercentages(home: number, draw: number) {
  const roundedHome = Math.round(home);
  const roundedDraw = Math.round(draw);
  const roundedAway = 100 - roundedHome - roundedDraw;
  return {
    homeWin: clamp(roundedHome),
    draw: clamp(roundedDraw),
    awayWin: clamp(roundedAway),
  };
}

function clampGoalValue(value: number, min = 0.2, max = 4.2) {
  return Math.min(max, Math.max(min, value));
}

function roundGoalValue(value: number) {
  return Math.round(value * 10) / 10;
}

function poisson(lambda: number, goals: number) {
  let factorial = 1;
  for (let i = 2; i <= goals; i += 1) {
    factorial *= i;
  }
  return (Math.exp(-lambda) * lambda ** goals) / factorial;
}

function expectedGoalsFor(
  team: Team,
  opponent: Team,
  teamStrength: { total: number; squad: number; availability: number },
  opponentStrength: { total: number },
) {
  const teamGames = Math.max(team.recentForm.length, 1);
  const opponentGames = Math.max(opponent.recentForm.length, 1);
  const scoringRate = team.goalsForRecent / teamGames;
  const opponentConcedingRate = opponent.goalsAgainstRecent / opponentGames;
  const recentGoalSignal = scoringRate * 0.58 + opponentConcedingRate * 0.32 + 1.35 * 0.1;
  const strengthSignal = (teamStrength.total - opponentStrength.total) * 0.028;
  const squadSignal = (teamStrength.squad - 72) * 0.006;
  const availabilitySignal = (teamStrength.availability - 85) * 0.004;

  return roundGoalValue(
    clampGoalValue(recentGoalSignal + strengthSignal + squadSignal + availabilitySignal),
  );
}

function buildWinningProjection(
  winner: "home" | "away",
  homeExpectedGoals: number,
  awayExpectedGoals: number,
) {
  const maxGoals = 7;
  let eventProbability = 0;
  let eventHomeGoals = 0;
  let eventAwayGoals = 0;
  let topScore = {
    homeScore: winner === "home" ? 1 : 0,
    awayScore: winner === "home" ? 0 : 1,
    probability: 0,
  };

  for (let homeScore = 0; homeScore <= maxGoals; homeScore += 1) {
    for (let awayScore = 0; awayScore <= maxGoals; awayScore += 1) {
      const isWinner =
        winner === "home" ? homeScore > awayScore : awayScore > homeScore;

      if (!isWinner) {
        continue;
      }

      const probability =
        poisson(homeExpectedGoals, homeScore) * poisson(awayExpectedGoals, awayScore);
      eventProbability += probability;
      eventHomeGoals += homeScore * probability;
      eventAwayGoals += awayScore * probability;

      if (probability > topScore.probability) {
        topScore = { homeScore, awayScore, probability };
      }
    }
  }

  const safeEventProbability = eventProbability || 1;
  const goalsFor =
    winner === "home"
      ? eventHomeGoals / safeEventProbability
      : eventAwayGoals / safeEventProbability;
  const goalsAgainst =
    winner === "home"
      ? eventAwayGoals / safeEventProbability
      : eventHomeGoals / safeEventProbability;

  return {
    goalsFor: roundGoalValue(goalsFor),
    goalsAgainst: roundGoalValue(goalsAgainst),
    homeScore: topScore.homeScore,
    awayScore: topScore.awayScore,
    scoreline: `${topScore.homeScore}-${topScore.awayScore}`,
    scorelineProbability: Math.round((topScore.probability / safeEventProbability) * 100),
  };
}

function buildGoalProjection(
  homeTeam: Team,
  awayTeam: Team,
  homeStrength: { total: number; squad: number; availability: number },
  awayStrength: { total: number; squad: number; availability: number },
) {
  const homeExpectedGoals = expectedGoalsFor(
    homeTeam,
    awayTeam,
    homeStrength,
    awayStrength,
  );
  const awayExpectedGoals = expectedGoalsFor(
    awayTeam,
    homeTeam,
    awayStrength,
    homeStrength,
  );

  return {
    homeExpectedGoals,
    awayExpectedGoals,
    homeWin: buildWinningProjection("home", homeExpectedGoals, awayExpectedGoals),
    awayWin: buildWinningProjection("away", homeExpectedGoals, awayExpectedGoals),
  };
}

export function generatePrediction(
  match: Match,
  teams: Team[],
  players: Player[],
  matches: Match[],
  results: Result[],
  modelState: ModelState,
  generatedAt = new Date().toISOString(),
): Prediction {
  const homeTeam = teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = teams.find((team) => team.id === match.awayTeamId);

  if (!homeTeam || !awayTeam) {
    throw new Error(`No se encontraron equipos para el partido ${match.id}`);
  }

  const homePlayers = players.filter((player) => player.teamId === homeTeam.id);
  const awayPlayers = players.filter((player) => player.teamId === awayTeam.id);
  const homeStrength = calculateTeamStrength(
    homeTeam,
    homePlayers,
    matches,
    results,
    modelState,
  );
  const awayStrength = calculateTeamStrength(
    awayTeam,
    awayPlayers,
    matches,
    results,
    modelState,
  );

  const diff = homeStrength.total - awayStrength.total;
  const decisiveBias = sigmoid(Math.abs(diff) / 13) - 0.5;
  const drawRaw = clamp(31 - Math.abs(diff) * 0.55, 16, 33);
  const nonDraw = 100 - drawRaw;
  const homeRaw = diff >= 0 ? nonDraw * (0.5 + decisiveBias) : nonDraw * (0.5 - decisiveBias);
  const percentages = roundPercentages(homeRaw, drawRaw);
  const confidence = clamp(48 + Math.abs(diff) * 1.25 + (100 - drawRaw) * 0.12, 35, 88);
  const goalProjection = buildGoalProjection(
    homeTeam,
    awayTeam,
    homeStrength,
    awayStrength,
  );

  const factors = [
    {
      label: "Rating base",
      homeImpact: homeStrength.baseRating,
      awayImpact: awayStrength.baseRating,
      note: "Nivel estructural estimado antes del torneo.",
    },
    {
      label: "Forma reciente",
      homeImpact: homeStrength.form,
      awayImpact: awayStrength.form,
      note: "Resultados y balance de goles previos.",
    },
    {
      label: "Plantel",
      homeImpact: homeStrength.squad,
      awayImpact: awayStrength.squad,
      note: "Momento, ritmo, fitness e importancia de jugadores clave.",
    },
    {
      label: "Disponibilidad",
      homeImpact: homeStrength.availability,
      awayImpact: awayStrength.availability,
      note: "Penaliza dudas, lesiones o suspensiones.",
    },
    {
      label: "Aprendizaje torneo",
      homeImpact: homeStrength.tournamentResults,
      awayImpact: awayStrength.tournamentResults,
      note: "Se mueve con resultados ya cargados en la app.",
    },
  ];

  const favorite =
    percentages.homeWin === percentages.awayWin
      ? "partido equilibrado"
      : percentages.homeWin > percentages.awayWin
        ? `${homeTeam.name} llega con ventaja`
        : `${awayTeam.name} llega con ventaja`;

  return {
    id: `pred-${match.id}`,
    matchId: match.id,
    generatedAt,
    modelVersion: modelState.version,
    homeWin: percentages.homeWin,
    draw: percentages.draw,
    awayWin: percentages.awayWin,
    confidence: Math.round(confidence),
    homeStrength: Math.round(homeStrength.total),
    awayStrength: Math.round(awayStrength.total),
    goalProjection,
    factors,
    explanation: `${favorite}: el modelo combina rating, forma, plantel, disponibilidad y aprendizaje de resultados cargados.`,
  };
}

export function generatePredictions(
  teams: Team[],
  players: Player[],
  matches: Match[],
  results: Result[],
  modelState: ModelState,
) {
  const generatedAt = new Date().toISOString();
  return matches
    .filter((match) => match.status === "scheduled")
    .map((match) =>
      generatePrediction(match, teams, players, matches, results, modelState, generatedAt),
    );
}
