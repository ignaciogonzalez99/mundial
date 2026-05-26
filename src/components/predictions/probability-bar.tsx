type ProbabilityBarProps = {
  home: number;
  draw: number;
  away: number;
  homeLabel?: string;
  awayLabel?: string;
  compact?: boolean;
};

export function ProbabilityBar({
  home,
  draw,
  away,
  homeLabel = "Equipo 1",
  awayLabel = "Equipo 2",
  compact,
}: ProbabilityBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
        <div className="bg-primary" style={{ width: `${home}%` }} />
        <div className="bg-[var(--chart-2)]" style={{ width: `${draw}%` }} />
        <div className="bg-[var(--chart-4)]" style={{ width: `${away}%` }} />
      </div>
      {!compact ? (
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <span className="min-w-0">
            <span className="block truncate">{homeLabel}</span>
            <strong className="metric-mono text-foreground">{home}%</strong>
          </span>
          <span className="text-center">
            <span className="block">Empate</span>
            <strong className="metric-mono text-foreground">{draw}%</strong>
          </span>
          <span className="min-w-0 text-right">
            <span className="block truncate">{awayLabel}</span>
            <strong className="metric-mono text-foreground">{away}%</strong>
          </span>
        </div>
      ) : null}
    </div>
  );
}
