import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { ProbabilityBar } from "@/components/predictions/probability-bar";
import { getTournamentData } from "@/lib/analysis";
import { cn } from "@/lib/utils";
import { formatDate, teamById } from "@/lib/view";

export default async function PredictionsPage() {
  const { teams, matches, predictions, modelState } = await getTournamentData();
  const teamsMap = teamById(teams);
  const matchMap = new Map(matches.map((match) => [match.id, match]));
  const ranked = [...predictions].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Modelo predictivo"
        title="Probabilidades explicables"
        description="Cada partido combina rating, forma, plantel, disponibilidad y aprendizaje por resultados cargados."
        badge={modelState.version}
      />
      <div className="grid gap-4">
        {ranked.map((prediction) => {
          const match = matchMap.get(prediction.matchId);
          if (!match) return null;
          const homeTeam = teamsMap.get(match.homeTeamId);
          const awayTeam = teamsMap.get(match.awayTeamId);
          if (!homeTeam || !awayTeam) return null;

          return (
            <Card key={prediction.id} className="rounded-lg">
              <CardContent className="grid gap-5 p-5 lg:grid-cols-[240px_1fr_140px] lg:items-center">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">#{match.matchNumber}</Badge>
                    <Badge variant="outline">Grupo {match.groupId}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {formatDate(match.date)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{match.venue}</p>
                </div>
                <div className="space-y-3">
                  <Link
                    href={`/matches/${match.id}`}
                    className="text-lg font-semibold hover:text-primary"
                  >
                    {homeTeam.name} vs {awayTeam.name}
                  </Link>
                  <ProbabilityBar
                    home={prediction.homeWin}
                    draw={prediction.draw}
                    away={prediction.awayWin}
                  />
                  <p className="text-sm leading-6 text-muted-foreground">
                    {prediction.explanation}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 lg:block lg:text-right">
                  <p className="text-sm text-muted-foreground">Confianza</p>
                  <p className="metric-mono text-3xl font-semibold">
                    {prediction.confidence}%
                  </p>
                  <Link
                    href={`/matches/${match.id}`}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-3")}
                  >
                    Detalle
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
