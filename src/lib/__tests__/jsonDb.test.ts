import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createJsonDb } from "@/lib/jsonDb";
import type { Group, Match, ModelState, Player, Team } from "@/lib/types";

const teams: Team[] = [
  {
    id: "home",
    name: "Home",
    shortName: "HOM",
    fifaCode: "HOM",
    groupId: "A",
    confederation: "UEFA",
    baseRating: 80,
    coach: "Coach",
    style: "Control",
    recentForm: ["W", "D", "W"],
    goalsForRecent: 5,
    goalsAgainstRecent: 2,
    notes: "",
  },
  {
    id: "away",
    name: "Away",
    shortName: "AWY",
    fifaCode: "AWY",
    groupId: "A",
    confederation: "CAF",
    baseRating: 70,
    coach: "Coach",
    style: "Transicion",
    recentForm: ["D", "L", "W"],
    goalsForRecent: 3,
    goalsAgainstRecent: 4,
    notes: "",
  },
];

const players: Player[] = teams.map((team) => ({
  id: `${team.id}-p`,
  teamId: team.id,
  name: `${team.name} Player`,
  position: "MF",
  club: "Club",
  age: 26,
  currentForm: 75,
  matchSharpness: 75,
  fitness: 90,
  importance: 80,
  status: "available",
  recentTrajectory: ["Club"],
  nationalTeamTrend: "",
  notes: "",
}));

const groups: Group[] = [{ id: "A", name: "Grupo A", teamIds: ["home", "away", "c", "d"] }];

const matches: Match[] = [
  {
    id: "M001",
    matchNumber: 1,
    groupId: "A",
    stage: "group",
    matchday: 1,
    date: "2026-06-11",
    venue: "Stadium",
    homeTeamId: "home",
    awayTeamId: "away",
    status: "scheduled",
    homeScore: null,
    awayScore: null,
  },
];

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

async function writeJson(dir: string, file: string, value: unknown) {
  await writeFile(path.join(dir, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

describe("jsonDb", () => {
  it("guarda resultado, actualiza partido y regenera predicciones", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "mundial-jsondb-"));
    await Promise.all([
      writeJson(dir, "teams.json", teams),
      writeJson(dir, "players.json", players),
      writeJson(dir, "groups.json", groups),
      writeJson(dir, "matches.json", matches),
      writeJson(dir, "results.json", []),
      writeJson(dir, "predictions.json", []),
      writeJson(dir, "model-state.json", modelState),
      writeJson(dir, "sync-log.json", []),
    ]);

    const db = createJsonDb(dir);
    const result = await db.saveResult({
      matchId: "M001",
      homeScore: 2,
      awayScore: 1,
      notes: "test",
    });

    const [nextMatches, results, predictions] = await Promise.all([
      db.getMatches(),
      db.getResults(),
      db.getPredictions(),
    ]);

    expect(result.id).toBe("res-M001");
    expect(results).toHaveLength(1);
    expect(nextMatches[0]).toMatchObject({
      status: "completed",
      homeScore: 2,
      awayScore: 1,
    });
    expect(predictions).toHaveLength(0);
  });
});
