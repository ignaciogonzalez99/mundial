import type { Group, GroupStanding, Match, Team } from "@/lib/types";

export function calculateGroupStandings(
  group: Group,
  matches: Match[],
): GroupStanding[] {
  const table = new Map<string, GroupStanding>();

  for (const teamId of group.teamIds) {
    table.set(teamId, {
      teamId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (
      match.groupId !== group.id ||
      match.status !== "completed" ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      continue;
    }

    const home = table.get(match.homeTeamId);
    const away = table.get(match.awayTeamId);

    if (!home || !away) {
      continue;
    }

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (match.homeScore < match.awayScore) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const standing of table.values()) {
    standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
  }

  return [...table.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId.localeCompare(b.teamId);
  });
}

export function getQualifiedSnapshot(
  groups: Group[],
  teams: Team[],
  matches: Match[],
) {
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  return groups.map((group) => ({
    group,
    table: calculateGroupStandings(group, matches).map((standing, index) => ({
      ...standing,
      rank: index + 1,
      team: teamMap.get(standing.teamId),
      qualificationZone: index < 2 ? "direct" : index === 2 ? "third" : "out",
    })),
  }));
}
