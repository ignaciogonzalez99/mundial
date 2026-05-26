import { z } from "zod";

const teamFormSchema = z.enum(["W", "D", "L"]);
const confederationSchema = z.enum([
  "AFC",
  "CAF",
  "CONCACAF",
  "CONMEBOL",
  "OFC",
  "UEFA",
]);

export const teamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  fifaCode: z.string().min(2).max(4),
  groupId: z.string().min(1),
  confederation: confederationSchema,
  baseRating: z.number().min(0).max(100),
  coach: z.string().min(1),
  style: z.string().min(1),
  recentForm: z.array(teamFormSchema).min(1).max(10),
  goalsForRecent: z.number().min(0),
  goalsAgainstRecent: z.number().min(0),
  notes: z.string(),
});

export const playerSchema = z.object({
  id: z.string().min(1),
  teamId: z.string().min(1),
  name: z.string().min(1),
  position: z.enum(["GK", "DF", "MF", "FW"]),
  club: z.string().min(1),
  age: z.number().min(15).max(50),
  currentForm: z.number().min(0).max(100),
  matchSharpness: z.number().min(0).max(100),
  fitness: z.number().min(0).max(100),
  importance: z.number().min(0).max(100),
  status: z.enum(["available", "doubtful", "injured", "suspended"]),
  recentTrajectory: z.array(z.string()).default([]),
  nationalTeamTrend: z.string(),
  notes: z.string(),
});

export const groupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  teamIds: z.array(z.string()).length(4),
});

export const matchSchema = z.object({
  id: z.string().min(1),
  matchNumber: z.number().int().positive(),
  groupId: z.string().min(1),
  stage: z.literal("group"),
  matchday: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  date: z.string().min(1),
  venue: z.string().min(1),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  status: z.enum(["scheduled", "completed", "postponed"]),
  homeScore: z.number().int().min(0).nullable(),
  awayScore: z.number().int().min(0).nullable(),
});

export const resultSchema = z.object({
  id: z.string().min(1),
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0).max(30),
  awayScore: z.number().int().min(0).max(30),
  recordedAt: z.string().min(1),
  notes: z.string().optional(),
});

export const resultInputSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.coerce.number().int().min(0).max(30),
  awayScore: z.coerce.number().int().min(0).max(30),
  notes: z.string().optional(),
});

const predictionFactorSchema = z.object({
  label: z.string(),
  homeImpact: z.number(),
  awayImpact: z.number(),
  note: z.string(),
});

const winningGoalProjectionSchema = z.object({
  goalsFor: z.number().min(0),
  goalsAgainst: z.number().min(0),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  scoreline: z.string().min(1),
  scorelineProbability: z.number().min(0).max(100),
});

const goalProjectionSchema = z.object({
  homeExpectedGoals: z.number().min(0),
  awayExpectedGoals: z.number().min(0),
  homeWin: winningGoalProjectionSchema,
  awayWin: winningGoalProjectionSchema,
});

export const predictionSchema = z.object({
  id: z.string().min(1),
  matchId: z.string().min(1),
  generatedAt: z.string().min(1),
  modelVersion: z.string().min(1),
  homeWin: z.number().min(0).max(100),
  draw: z.number().min(0).max(100),
  awayWin: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  homeStrength: z.number().min(0).max(100),
  awayStrength: z.number().min(0).max(100),
  goalProjection: goalProjectionSchema,
  factors: z.array(predictionFactorSchema),
  explanation: z.string(),
});

export const modelStateSchema = z.object({
  version: z.string().min(1),
  lastUpdated: z.string().min(1),
  weights: z.object({
    baseRating: z.number(),
    form: z.number(),
    squad: z.number(),
    tournamentResults: z.number(),
    availability: z.number(),
    hostContext: z.number(),
  }),
  teamAdjustments: z.array(
    z.object({
      teamId: z.string(),
      delta: z.number(),
      lastUpdated: z.string(),
      reason: z.string(),
    }),
  ),
});

export const syncLogEntrySchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  status: z.enum(["success", "error", "skipped"]),
  startedAt: z.string().min(1),
  finishedAt: z.string().min(1),
  changesApplied: z.number().int().min(0),
  message: z.string(),
});

export const syncInputSchema = z.object({
  source: z.string().min(1).default("manual"),
  notes: z.string().optional(),
});

export const teamInputSchema = teamSchema;
export const teamPatchSchema = teamSchema.partial().extend({
  id: z.string().min(1),
});
export const playerInputSchema = playerSchema;
export const playerPatchSchema = playerSchema.partial().extend({
  id: z.string().min(1),
});
export const matchInputSchema = matchSchema;
export const matchPatchSchema = matchSchema.partial().extend({
  id: z.string().min(1),
});

export const teamsSchema = z.array(teamSchema);
export const playersSchema = z.array(playerSchema);
export const groupsSchema = z.array(groupSchema);
export const matchesSchema = z.array(matchSchema);
export const resultsSchema = z.array(resultSchema);
export const predictionsSchema = z.array(predictionSchema);
export const syncLogSchema = z.array(syncLogEntrySchema);
