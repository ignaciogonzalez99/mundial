import type { Prediction, Team, WinningGoalProjection } from "@/lib/types";

type GoalProjectionProps = {
  prediction: Prediction;
  homeTeam: Team;
  awayTeam: Team;
  compact?: boolean;
};

type ProjectionItemProps = {
  team: Team;
  projection: WinningGoalProjection;
  compact?: boolean;
};

function ProjectionItem({ team, projection, compact }: ProjectionItemProps) {
  return (
    <div className="rounded-md border border-border bg-secondary/45 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-medium">{team.shortName} gana</p>
        <p className="metric-mono text-lg font-semibold text-foreground">
          {projection.scoreline}
        </p>
      </div>
      {!compact ? (
        <div className="mt-2 grid gap-1 text-xs leading-5 text-muted-foreground">
          <p>
            Promedio al ganar:{" "}
            <strong className="metric-mono text-foreground">
              {projection.goalsFor}
            </strong>{" "}
            goles a favor y{" "}
            <strong className="metric-mono text-foreground">
              {projection.goalsAgainst}
            </strong>{" "}
            recibidos.
          </p>
          <p>
            Ese marcador aparece en{" "}
            <strong className="metric-mono text-foreground">
              {projection.scorelineProbability}%
            </strong>{" "}
            de sus triunfos simulados.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function GoalProjection({
  prediction,
  homeTeam,
  awayTeam,
  compact,
}: GoalProjectionProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <ProjectionItem
        team={homeTeam}
        projection={prediction.goalProjection.homeWin}
        compact={compact}
      />
      <ProjectionItem
        team={awayTeam}
        projection={prediction.goalProjection.awayWin}
        compact={compact}
      />
    </div>
  );
}
