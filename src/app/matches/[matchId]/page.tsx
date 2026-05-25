import { notFound } from "next/navigation";
import { BarChart3, CalendarDays, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { PredictionDonut } from "@/components/charts/prediction-donut";
import { ResultForm } from "@/components/matches/result-form";
import { ProbabilityBar } from "@/components/predictions/probability-bar";
import { getTournamentData } from "@/lib/analysis";
import { formatDate, predictionByMatchId } from "@/lib/view";

type MatchPageProps = {
  params: Promise<{ matchId: string }>;
};

export async function generateStaticParams() {
  const { matches } = await getTournamentData();
  return matches.map((match) => ({ matchId: match.id }));
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { matchId } = await params;
  const { teams, matches, predictions } = await getTournamentData();
  const match = matches.find((candidate) => candidate.id === matchId);
  if (!match) notFound();

  const homeTeam = teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = teams.find((team) => team.id === match.awayTeamId);
  if (!homeTeam || !awayTeam) notFound();

  const prediction = predictionByMatchId(predictions).get(match.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Partido #${match.matchNumber} · Grupo ${match.groupId}`}
        title={`${homeTeam.name} vs ${awayTeam.name}`}
        description={`${formatDate(match.date)} · ${match.venue}`}
        badge={match.status === "completed" ? "Finalizado" : "Programado"}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Fuerza local" value={prediction?.homeStrength ?? "-"} detail={homeTeam.name} icon={Gauge} />
        <StatCard label="Fuerza visita" value={prediction?.awayStrength ?? "-"} detail={awayTeam.name} icon={Gauge} />
        <StatCard label="Confianza" value={prediction ? `${prediction.confidence}%` : "-"} detail="Lectura del modelo" icon={BarChart3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Probabilidades estimadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {prediction ? (
              <>
                <PredictionDonut
                  home={prediction.homeWin}
                  draw={prediction.draw}
                  away={prediction.awayWin}
                />
                <ProbabilityBar
                  home={prediction.homeWin}
                  draw={prediction.draw}
                  away={prediction.awayWin}
                />
                <p className="text-sm leading-6 text-muted-foreground">
                  {prediction.explanation}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {prediction.factors.map((factor) => (
                    <div key={factor.label} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{factor.label}</p>
                        <Badge variant="secondary">
                          {Math.round(factor.homeImpact)} · {Math.round(factor.awayImpact)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {factor.note}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay prediccion disponible para este partido.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Marcador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <span className="text-sm font-medium">{homeTeam.shortName}</span>
                <span className="metric-mono rounded-md border border-border px-4 py-3 text-lg">
                  {match.status === "completed" && match.homeScore !== null && match.awayScore !== null
                    ? `${match.homeScore} - ${match.awayScore}`
                    : "vs"}
                </span>
                <span className="text-right text-sm font-medium">{awayTeam.shortName}</span>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {formatDate(match.date)}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Cargar resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultForm match={match} homeTeam={homeTeam} awayTeam={awayTeam} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
