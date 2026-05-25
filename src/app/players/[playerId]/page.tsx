import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, HeartPulse, Shirt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { getTournamentData } from "@/lib/analysis";

type PlayerPageProps = {
  params: Promise<{ playerId: string }>;
};

export async function generateStaticParams() {
  const { players } = await getTournamentData();
  return players.map((player) => ({ playerId: player.id }));
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const { teams, players } = await getTournamentData();
  const player = players.find((candidate) => candidate.id === playerId);
  if (!player) notFound();

  const team = teams.find((candidate) => candidate.id === player.teamId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={team ? `${team.name} · ${player.position}` : player.position}
        title={player.name}
        description={player.notes}
        badge={player.status}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Forma actual" value={player.currentForm} detail="0 a 100" icon={Activity} />
        <StatCard label="Ritmo competitivo" value={player.matchSharpness} detail={player.club} icon={Shirt} />
        <StatCard label="Fitness" value={player.fitness} detail="Disponibilidad fisica" icon={HeartPulse} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Ficha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Seleccion</span>
              {team ? (
                <Link href={`/teams/${team.id}`} className="font-medium hover:text-primary">
                  {team.name}
                </Link>
              ) : (
                <span>{player.teamId}</span>
              )}
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Club</span>
              <span className="font-medium">{player.club}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Edad</span>
              <span className="metric-mono">{player.age}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Importancia</span>
              <span className="metric-mono">{player.importance}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Trayectoria reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {player.recentTrajectory.map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {player.nationalTeamTrend}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
