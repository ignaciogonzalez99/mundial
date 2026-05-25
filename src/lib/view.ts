import type { Match, Prediction, Team } from "@/lib/types";

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function teamById(teams: Team[]) {
  return new Map(teams.map((team) => [team.id, team]));
}

export function predictionByMatchId(predictions: Prediction[]) {
  return new Map(predictions.map((prediction) => [prediction.matchId, prediction]));
}

export function upcomingMatches(matches: Match[], limit = 6) {
  return matches
    .filter((match) => match.status === "scheduled")
    .sort((a, b) => a.matchNumber - b.matchNumber)
    .slice(0, limit);
}

export function completedMatches(matches: Match[]) {
  return matches.filter((match) => match.status === "completed");
}
