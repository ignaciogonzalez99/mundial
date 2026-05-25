import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/view";
import type { Match, Prediction, Team } from "@/lib/types";
import { ProbabilityBar } from "@/components/predictions/probability-bar";
import { cn } from "@/lib/utils";

type MatchCardProps = {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  prediction?: Prediction;
};

export function MatchCard({ match, homeTeam, awayTeam, prediction }: MatchCardProps) {
  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="secondary">#{match.matchNumber} Grupo {match.groupId}</Badge>
          <Badge variant={match.status === "completed" ? "default" : "outline"}>
            {match.status === "completed" ? "Finalizado" : `Fecha ${match.matchday}`}
          </Badge>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Link
            href={`/teams/${homeTeam.id}`}
            className="min-w-0 truncate text-sm font-semibold text-foreground hover:text-primary"
          >
            {homeTeam.name}
          </Link>
          <div className="metric-mono rounded-md border border-border px-3 py-2 text-center text-sm">
            {match.status === "completed" && match.homeScore !== null && match.awayScore !== null
              ? `${match.homeScore} - ${match.awayScore}`
              : "vs"}
          </div>
          <Link
            href={`/teams/${awayTeam.id}`}
            className="min-w-0 truncate text-right text-sm font-semibold text-foreground hover:text-primary"
          >
            {awayTeam.name}
          </Link>
        </div>
        <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatDate(match.date)}
          </span>
          <span className="flex items-center gap-2 md:justify-end">
            <MapPin className="h-4 w-4" />
            {match.venue}
          </span>
        </div>
        {prediction ? (
          <ProbabilityBar
            home={prediction.homeWin}
            draw={prediction.draw}
            away={prediction.awayWin}
            compact
          />
        ) : null}
        <Link
          href={`/matches/${match.id}`}
          className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
        >
          Analizar partido
        </Link>
      </CardContent>
    </Card>
  );
}
