export type TeamForm = "W" | "D" | "L";

export type Confederation =
  | "AFC"
  | "CAF"
  | "CONCACAF"
  | "CONMEBOL"
  | "OFC"
  | "UEFA";

export type Team = {
  id: string;
  name: string;
  shortName: string;
  fifaCode: string;
  groupId: string;
  confederation: Confederation;
  baseRating: number;
  coach: string;
  style: string;
  recentForm: TeamForm[];
  goalsForRecent: number;
  goalsAgainstRecent: number;
  notes: string;
};

export type PlayerStatus = "available" | "doubtful" | "injured" | "suspended";

export type Player = {
  id: string;
  teamId: string;
  name: string;
  position: "GK" | "DF" | "MF" | "FW";
  club: string;
  age: number;
  currentForm: number;
  matchSharpness: number;
  fitness: number;
  importance: number;
  status: PlayerStatus;
  recentTrajectory: string[];
  nationalTeamTrend: string;
  notes: string;
};

export type Group = {
  id: string;
  name: string;
  teamIds: string[];
};

export type MatchStatus = "scheduled" | "completed" | "postponed";

export type Match = {
  id: string;
  matchNumber: number;
  groupId: string;
  stage: "group";
  matchday: 1 | 2 | 3;
  date: string;
  venue: string;
  homeTeamId: string;
  awayTeamId: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
};

export type Result = {
  id: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  recordedAt: string;
  notes?: string;
};

export type TeamAdjustment = {
  teamId: string;
  delta: number;
  lastUpdated: string;
  reason: string;
};

export type ModelState = {
  version: string;
  lastUpdated: string;
  weights: {
    baseRating: number;
    form: number;
    squad: number;
    tournamentResults: number;
    availability: number;
    hostContext: number;
  };
  teamAdjustments: TeamAdjustment[];
};

export type PredictionFactor = {
  label: string;
  homeImpact: number;
  awayImpact: number;
  note: string;
};

export type Prediction = {
  id: string;
  matchId: string;
  generatedAt: string;
  modelVersion: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  confidence: number;
  homeStrength: number;
  awayStrength: number;
  factors: PredictionFactor[];
  explanation: string;
};

export type SyncLogEntry = {
  id: string;
  source: string;
  status: "success" | "error" | "skipped";
  startedAt: string;
  finishedAt: string;
  changesApplied: number;
  message: string;
};

export type GroupStanding = {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type TeamStrength = {
  teamId: string;
  total: number;
  baseRating: number;
  form: number;
  squad: number;
  tournamentResults: number;
  availability: number;
  hostContext: number;
  adjustment: number;
};
