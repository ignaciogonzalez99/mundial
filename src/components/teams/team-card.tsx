import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Team } from "@/lib/types";

type TeamCardProps = {
  team: Team;
  playerCount: number;
};

export function TeamCard({ team, playerCount }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.id}`} className="group block">
      <Card className="h-full rounded-lg transition-colors group-hover:border-primary/60">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="metric-mono text-xs text-muted-foreground">{team.fifaCode}</p>
              <h2 className="mt-1 truncate text-lg font-semibold text-foreground">
                {team.name}
              </h2>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {team.style}
          </p>
          <div className="mt-auto flex flex-wrap gap-2">
            <Badge variant="secondary">Grupo {team.groupId}</Badge>
            <Badge variant="outline">{team.confederation}</Badge>
            <Badge variant="outline">{playerCount} jugadores</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
