import type { Match, ModelState, Player, Result, Team, TeamStrength } from "@/lib/types";

const HOST_TEAMS = new Set(["mexico", "canada", "united-states"]);

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function formScore(team: Team) {
  const points = team.recentForm.reduce((total, item) => {
    if (item === "W") return total + 3;
    if (item === "D") return total + 1;
    return total;
  }, 0);
  const max = team.recentForm.length * 3;
  const resultScore = max > 0 ? (points / max) * 100 : 50;
  const goalBalance = team.goalsForRecent - team.goalsAgainstRecent;
  return clamp(resultScore + goalBalance * 1.4);
}

function squadScore(players: Player[]) {
  if (players.length === 0) return 50;

  const weighted = players.reduce((total, player) => {
    const availabilityMultiplier =
      player.status === "available"
        ? 1
        : player.status === "doubtful"
          ? 0.75
          : 0.35;
    const playerScore =
      player.currentForm * 0.4 +
      player.matchSharpness * 0.25 +
      player.fitness * 0.2 +
      player.importance * 0.15;
    return total + playerScore * availabilityMultiplier;
  }, 0);

  return clamp(weighted / players.length);
}

function availabilityScore(players: Player[]) {
  if (players.length === 0) return 70;

  const total = players.reduce((sum, player) => {
    if (player.status === "available") return sum + 100;
    if (player.status === "doubtful") return sum + 65;
    if (player.status === "suspended") return sum + 30;
    return sum + 25;
  }, 0);

  return clamp(total / players.length);
}

function tournamentResultScore(teamId: string, matches: Match[], results: Result[]) {
  if (results.length === 0) return 50;

  const completed = results
    .map((result) => {
      const match = matches.find((candidate) => candidate.id === result.matchId);
      if (!match || (match.homeTeamId !== teamId && match.awayTeamId !== teamId)) {
        return null;
      }

      const isHome = match.homeTeamId === teamId;
      const goalsFor = isHome ? result.homeScore : result.awayScore;
      const goalsAgainst = isHome ? result.awayScore : result.homeScore;
      const points = goalsFor > goalsAgainst ? 3 : goalsFor === goalsAgainst ? 1 : 0;
      return { points, goalsFor, goalsAgainst };
    })
    .filter(Boolean) as Array<{
    points: number;
    goalsFor: number;
    goalsAgainst: number;
  }>;

  if (completed.length === 0) return 50;

  const points = completed.reduce((sum, item) => sum + item.points, 0);
  const goalDiff = completed.reduce(
    (sum, item) => sum + item.goalsFor - item.goalsAgainst,
    0,
  );

  return clamp((points / (completed.length * 3)) * 100 + goalDiff * 4);
}

function modelAdjustment(teamId: string, modelState: ModelState) {
  return (
    modelState.teamAdjustments.find((adjustment) => adjustment.teamId === teamId)
      ?.delta ?? 0
  );
}

export function calculateTeamStrength(
  team: Team,
  players: Player[],
  matches: Match[],
  results: Result[],
  modelState: ModelState,
): TeamStrength {
  const weights = modelState.weights;
  const baseRating = clamp(team.baseRating);
  const form = formScore(team);
  const squad = squadScore(players);
  const availability = availabilityScore(players);
  const tournamentResults = tournamentResultScore(team.id, matches, results);
  const hostContext = HOST_TEAMS.has(team.id) ? 82 : 50;
  const adjustment = modelAdjustment(team.id, modelState);

  const total =
    baseRating * weights.baseRating +
    form * weights.form +
    squad * weights.squad +
    tournamentResults * weights.tournamentResults +
    availability * weights.availability +
    hostContext * weights.hostContext +
    adjustment;

  return {
    teamId: team.id,
    total: clamp(total),
    baseRating,
    form,
    squad,
    tournamentResults,
    availability,
    hostContext,
    adjustment,
  };
}

export function learnFromResult(
  match: Match,
  result: Result,
  modelState: ModelState,
): ModelState {
  const homeDelta =
    result.homeScore > result.awayScore
      ? 1.2
      : result.homeScore === result.awayScore
        ? 0.2
        : -1.0;
  const awayDelta =
    result.awayScore > result.homeScore
      ? 1.2
      : result.homeScore === result.awayScore
        ? 0.2
        : -1.0;
  const now = new Date().toISOString();

  const upsertAdjustment = (teamId: string, delta: number) => {
    const current = modelState.teamAdjustments.find(
      (adjustment) => adjustment.teamId === teamId,
    );
    const nextDelta = clamp((current?.delta ?? 0) * 0.7 + delta, -8, 8);
    return {
      teamId,
      delta: nextDelta,
      lastUpdated: now,
      reason: `Aprendizaje por resultado ${match.id}`,
    };
  };

  const others = modelState.teamAdjustments.filter(
    (adjustment) =>
      adjustment.teamId !== match.homeTeamId && adjustment.teamId !== match.awayTeamId,
  );

  return {
    ...modelState,
    lastUpdated: now,
    teamAdjustments: [
      ...others,
      upsertAdjustment(match.homeTeamId, homeDelta),
      upsertAdjustment(match.awayTeamId, awayDelta),
    ],
  };
}
