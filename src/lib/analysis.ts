import { jsonDb } from "@/lib/jsonDb";
import { generatePredictions } from "@/lib/predictionEngine";
import { calculateGroupStandings } from "@/lib/standings";
import type { Group, Match } from "@/lib/types";

export async function getTournamentData() {
  const [teams, players, groups, matches, results, storedPredictions, modelState, syncLog] =
    await Promise.all([
      jsonDb.getTeams(),
      jsonDb.getPlayers(),
      jsonDb.getGroups(),
      jsonDb.getMatches(),
      jsonDb.getResults(),
      jsonDb.getPredictions(),
      jsonDb.getModelState(),
      jsonDb.getSyncLog(),
    ]);

  const predictions =
    storedPredictions.length > 0
      ? storedPredictions
      : generatePredictions(teams, players, matches, results, modelState);

  return {
    teams,
    players,
    groups,
    matches,
    results,
    predictions,
    modelState,
    syncLog,
  };
}

export function groupTables(groups: Group[], matches: Match[]) {
  return groups.map((group) => ({
    group,
    table: calculateGroupStandings(group, matches),
  }));
}
