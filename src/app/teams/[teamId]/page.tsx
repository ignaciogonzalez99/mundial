import { notFound } from "next/navigation";
import { Activity, Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StrengthChart } from "@/components/charts/strength-chart";
import { MatchCard } from "@/components/matches/match-card";
import { PlayerTable } from "@/components/players/player-table";
import { getTournamentData } from "@/lib/analysis";
import { calculateTeamStrength } from "@/lib/scoring";
import { predictionByMatchId, teamById } from "@/lib/view";

type TeamPageProps = {
  params: Promise<{ teamId: string }>;
};

export async function generateStaticParams() {
  const { teams } = await getTournamentData();
  return teams.map((team) => ({ teamId: team.id }));
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const { teams, players, matches, results, predictions, modelState } =
    await getTournamentData();
  const team = teams.find((candidate) => candidate.id === teamId);
  if (!team) notFound();

  const teamsMap = teamById(teams);
  const predictionsMap = predictionByMatchId(predictions);
  const teamPlayers = players.filter((player) => player.teamId === team.id);
  const teamMatches = matches.filter(
    (match) => match.homeTeamId === team.id || match.awayTeamId === team.id,
  );
  const strength = calculateTeamStrength(
    team,
    teamPlayers,
    matches,
    results,
    modelState,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Grupo ${team.groupId} · ${team.confederation}`}
        title={team.name}
        description={team.notes}
        badge={team.fifaCode}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Rating base" value={team.baseRating} detail="Estimacion inicial" icon={Shield} />
        <StatCard label="Fuerza modelo" value={Math.round(strength.total)} detail="Rating + forma + plantel" icon={Activity} />
        <StatCard label="Jugadores clave" value={teamPlayers.length} detail="Muestra editable" icon={Users} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Perfil táctico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">{team.style}</p>
            <div className="flex flex-wrap gap-2">
              {team.recentForm.map((item, index) => (
                <Badge key={`${item}-${index}`} variant={item === "W" ? "secondary" : "outline"}>
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Desglose de fuerza</CardTitle>
          </CardHeader>
          <CardContent>
            <StrengthChart
              data={[
                {
                  name: team.shortName,
                  rating: Math.round(strength.baseRating),
                  form: Math.round(strength.form),
                  squad: Math.round(strength.squad),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Jugadores</h2>
        <PlayerTable players={teamPlayers} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Partidos de grupo</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teamMatches.map((match) => {
            const homeTeam = teamsMap.get(match.homeTeamId);
            const awayTeam = teamsMap.get(match.awayTeamId);
            if (!homeTeam || !awayTeam) return null;
            return (
              <MatchCard
                key={match.id}
                match={match}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                prediction={predictionsMap.get(match.id)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
