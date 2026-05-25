import { describe, expect, it } from "vitest";
import { generatePrediction } from "@/lib/predictionEngine";
import type { Match, ModelState, Player, Team } from "@/lib/types";

const teams: Team[] = [
  {
    id: "elite",
    name: "Elite",
    shortName: "ELI",
    fifaCode: "ELI",
    groupId: "A",
    confederation: "UEFA",
    baseRating: 90,
    coach: "Coach A",
    style: "Alta presion",
    recentForm: ["W", "W", "W", "D", "W"],
    goalsForRecent: 12,
    goalsAgainstRecent: 3,
    notes: "",
  },
  {
    id: "outsider",
    name: "Outsider",
    shortName: "OUT",
    fifaCode: "OUT",
    groupId: "A",
    confederation: "CAF",
    baseRating: 62,
    coach: "Coach B",
    style: "Bloque bajo",
    recentForm: ["L", "D", "L", "W", "L"],
    goalsForRecent: 4,
    goalsAgainstRecent: 9,
    notes: "",
  },
];

const players: Player[] = teams.flatMap((team) => [
  {
    id: `${team.id}-player`,
    teamId: team.id,
    name: `${team.name} Player`,
    position: "FW",
    club: "Club",
    age: 27,
    currentForm: team.id === "elite" ? 90 : 62,
    matchSharpness: 80,
    fitness: 90,
    importance: 90,
    status: "available",
    recentTrajectory: ["Club"],
    nationalTeamTrend: "",
    notes: "",
  },
]);

const match: Match = {
  id: "M001",
  matchNumber: 1,
  groupId: "A",
  stage: "group",
  matchday: 1,
  date: "2026-06-11",
  venue: "Test Stadium",
  homeTeamId: "elite",
  awayTeamId: "outsider",
  status: "scheduled",
  homeScore: null,
  awayScore: null,
};

const modelState: ModelState = {
  version: "test",
  lastUpdated: "2026-01-01T00:00:00.000Z",
  weights: {
    baseRating: 0.38,
    form: 0.18,
    squad: 0.22,
    tournamentResults: 0.1,
    availability: 0.08,
    hostContext: 0.04,
  },
  teamAdjustments: [],
};

describe("predictionEngine", () => {
  it("genera porcentajes validos y favorece al equipo mas fuerte", () => {
    const prediction = generatePrediction(match, teams, players, [match], [], modelState);

    expect(prediction.homeWin + prediction.draw + prediction.awayWin).toBe(100);
    expect(prediction.homeWin).toBeGreaterThan(prediction.awayWin);
    expect(prediction.confidence).toBeGreaterThan(50);
    expect(prediction.factors).toHaveLength(5);
  });
});
