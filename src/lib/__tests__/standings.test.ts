import { describe, expect, it } from "vitest";
import { calculateGroupStandings } from "@/lib/standings";
import type { Group, Match } from "@/lib/types";

const group: Group = {
  id: "A",
  name: "Grupo A",
  teamIds: ["a", "b", "c", "d"],
};

const matches: Match[] = [
  {
    id: "M001",
    matchNumber: 1,
    groupId: "A",
    stage: "group",
    matchday: 1,
    date: "2026-06-11",
    venue: "Stadium",
    homeTeamId: "a",
    awayTeamId: "b",
    status: "completed",
    homeScore: 2,
    awayScore: 0,
  },
  {
    id: "M002",
    matchNumber: 2,
    groupId: "A",
    stage: "group",
    matchday: 1,
    date: "2026-06-11",
    venue: "Stadium",
    homeTeamId: "c",
    awayTeamId: "d",
    status: "completed",
    homeScore: 1,
    awayScore: 1,
  },
];

describe("standings", () => {
  it("calcula puntos, diferencia de gol y orden de grupo", () => {
    const table = calculateGroupStandings(group, matches);

    expect(table[0]).toMatchObject({
      teamId: "a",
      played: 1,
      won: 1,
      points: 3,
      goalDifference: 2,
    });
    expect(table.find((row) => row.teamId === "c")?.points).toBe(1);
    expect(table.find((row) => row.teamId === "d")?.points).toBe(1);
  });
});
