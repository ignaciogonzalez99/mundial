import { promises as fs } from "node:fs";
import path from "node:path";
import { generatePredictions } from "@/lib/predictionEngine";
import { learnFromResult } from "@/lib/scoring";
import type {
  Group,
  Match,
  ModelState,
  Player,
  Prediction,
  Result,
  SyncLogEntry,
  Team,
} from "@/lib/types";
import {
  groupsSchema,
  matchesSchema,
  modelStateSchema,
  playersSchema,
  predictionsSchema,
  resultsSchema,
  syncLogSchema,
  teamsSchema,
} from "@/lib/validators";
import type { z } from "zod";

type DataFile =
  | "teams"
  | "players"
  | "groups"
  | "matches"
  | "results"
  | "predictions"
  | "model-state"
  | "sync-log";

const schemaByFile = {
  teams: teamsSchema,
  players: playersSchema,
  groups: groupsSchema,
  matches: matchesSchema,
  results: resultsSchema,
  predictions: predictionsSchema,
  "model-state": modelStateSchema,
  "sync-log": syncLogSchema,
} satisfies Record<DataFile, z.ZodType>;

type FilePayload = {
  teams: Team[];
  players: Player[];
  groups: Group[];
  matches: Match[];
  results: Result[];
  predictions: Prediction[];
  "model-state": ModelState;
  "sync-log": SyncLogEntry[];
};

function fileName(file: DataFile) {
  return `${file}.json`;
}

async function ensureDir(dataDir: string) {
  await fs.mkdir(dataDir, { recursive: true });
}

export function createJsonDb(dataDir = path.join(process.cwd(), "data")) {
  async function read<K extends DataFile>(file: K): Promise<FilePayload[K]> {
    const fullPath = path.join(dataDir, fileName(file));
    const raw = await fs.readFile(fullPath, "utf8");
    const parsed = JSON.parse(raw);
    return schemaByFile[file].parse(parsed) as FilePayload[K];
  }

  async function write<K extends DataFile>(file: K, payload: FilePayload[K]) {
    await ensureDir(dataDir);
    const fullPath = path.join(dataDir, fileName(file));
    schemaByFile[file].parse(payload);
    const tempPath = `${fullPath}.${Date.now()}.tmp`;
    await fs.writeFile(tempPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    await fs.rename(tempPath, fullPath);
  }

  async function upsertById<K extends "teams" | "players" | "matches">(
    file: K,
    payload: FilePayload[K][number],
  ) {
    const items = await read(file);
    const index = items.findIndex((item) => item.id === payload.id);
    const next =
      index >= 0
        ? items.map((item) => (item.id === payload.id ? payload : item))
        : [...items, payload];
    await write(file, next as FilePayload[K]);
    return payload;
  }

  async function patchById<K extends "teams" | "players" | "matches">(
    file: K,
    patch: Partial<FilePayload[K][number]> & { id: string },
  ) {
    const items = await read(file);
    const index = items.findIndex((item) => item.id === patch.id);

    if (index < 0) {
      throw new Error(`No existe ${patch.id} en ${file}.json`);
    }

    const nextItem = { ...items[index], ...patch } as FilePayload[K][number];
    const next = items.map((item) => (item.id === patch.id ? nextItem : item));
    await write(file, next as FilePayload[K]);
    return nextItem;
  }

  async function regeneratePredictions() {
    const [teams, players, matches, results, modelState] = await Promise.all([
      read("teams"),
      read("players"),
      read("matches"),
      read("results"),
      read("model-state"),
    ]);
    const predictions = generatePredictions(
      teams,
      players,
      matches,
      results,
      modelState,
    );
    await write("predictions", predictions);
    return predictions;
  }

  async function saveResult(input: Omit<Result, "id" | "recordedAt"> & { notes?: string }) {
    const [matches, results, modelState] = await Promise.all([
      read("matches"),
      read("results"),
      read("model-state"),
    ]);
    const match = matches.find((candidate) => candidate.id === input.matchId);

    if (!match) {
      throw new Error(`No existe el partido ${input.matchId}`);
    }

    const recordedAt = new Date().toISOString();
    const result: Result = {
      id: `res-${input.matchId}`,
      matchId: input.matchId,
      homeScore: input.homeScore,
      awayScore: input.awayScore,
      recordedAt,
      notes: input.notes,
    };
    const nextResults = [
      ...results.filter((candidate) => candidate.matchId !== input.matchId),
      result,
    ];
    const nextMatches = matches.map((candidate) =>
      candidate.id === input.matchId
        ? {
            ...candidate,
            status: "completed" as const,
            homeScore: input.homeScore,
            awayScore: input.awayScore,
          }
        : candidate,
    );
    const nextModelState = learnFromResult(match, result, modelState);

    await write("results", nextResults);
    await write("matches", nextMatches);
    await write("model-state", nextModelState);
    await regeneratePredictions();
    return result;
  }

  async function appendSyncLog(entry: SyncLogEntry) {
    const current = await read("sync-log");
    const next = [entry, ...current].slice(0, 100);
    await write("sync-log", next);
    return entry;
  }

  return {
    read,
    write,
    getTeams: () => read("teams"),
    getPlayers: () => read("players"),
    getGroups: () => read("groups"),
    getMatches: () => read("matches"),
    getResults: () => read("results"),
    getPredictions: () => read("predictions"),
    getModelState: () => read("model-state"),
    getSyncLog: () => read("sync-log"),
    saveTeam: (team: Team) => upsertById("teams", team),
    savePlayer: (player: Player) => upsertById("players", player),
    saveMatch: (match: Match) => upsertById("matches", match),
    patchTeam: (patch: Partial<Team> & { id: string }) => patchById("teams", patch),
    patchPlayer: (patch: Partial<Player> & { id: string }) =>
      patchById("players", patch),
    patchMatch: (patch: Partial<Match> & { id: string }) =>
      patchById("matches", patch),
    saveResult,
    savePrediction: async (prediction: Prediction) => {
      const predictions = await read("predictions");
      const next = [
        ...predictions.filter((candidate) => candidate.id !== prediction.id),
        prediction,
      ];
      await write("predictions", next);
      return prediction;
    },
    regeneratePredictions,
    appendSyncLog,
  };
}

export const jsonDb = createJsonDb();
