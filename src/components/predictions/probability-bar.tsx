type ProbabilityBarProps = {
  home: number;
  draw: number;
  away: number;
  compact?: boolean;
};

export function ProbabilityBar({ home, draw, away, compact }: ProbabilityBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
        <div className="bg-primary" style={{ width: `${home}%` }} />
        <div className="bg-[var(--chart-2)]" style={{ width: `${draw}%` }} />
        <div className="bg-[var(--chart-4)]" style={{ width: `${away}%` }} />
      </div>
      {!compact ? (
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <span>
            Local <strong className="metric-mono text-foreground">{home}%</strong>
          </span>
          <span className="text-center">
            Empate <strong className="metric-mono text-foreground">{draw}%</strong>
          </span>
          <span className="text-right">
            Visita <strong className="metric-mono text-foreground">{away}%</strong>
          </span>
        </div>
      ) : null}
    </div>
  );
}
