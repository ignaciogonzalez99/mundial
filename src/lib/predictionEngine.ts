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
