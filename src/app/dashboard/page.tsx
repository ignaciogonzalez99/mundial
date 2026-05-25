import { Activity, BarChart3, CalendarDays, Database, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StrengthChart } from "@/components/charts/strength-chart";
import { MatchCard } from "@/components/matches/match-card";
import { getTournamentData } from "@/lib/analysis";
import { calculateTeamStrength } from "@/lib/scoring";
import { predictionByMatchId, teamById, upcomingMatches } from "@/lib/view";

export default async function DashboardPage() {
  const { teams, players, groups, matches, results, predictions, modelState, syncLog } =
    await getTournamentData();
  const teamsMap = teamById(teams);
  const predictionsMap = predictionByMatchId(predictions);
  const completed = matches.filter((match) => match.status === "completed").length;
  const strengths = teams
    .map((team) =>
      calculateTeamStrength(
        team,
        players.filter((player) => player.teamId === team.id),
        matches,
        results,
        modelState,
      ),
    )
    .sort((a, b) => b.total - a.total);
  const chartData = strengths.slice(0, 8).map((strength) => {
    const team = teamsMap.get(strength.teamId);
    return {
      name: team?.shortName ?? strength.teamId,
      rating: Math.round(strength.baseRating),
      form: Math.round(strength.form),
      squad: Math.round(strength.squad),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Centro de mando"
        title="Analisis vivo del Mundial 2026"
        description="Lectura modular de selecciones, jugadores, fixture y probabilidades. El modelo se ajusta con cada resultado cargado."
        badge={modelState.version}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Selecciones" value={teams.length} detail={`${groups.length} grupos`} icon={Trophy} />
        <StatCard label="Partidos" value={matches.length} detail={`${completed} resultados cargados`} icon={CalendarDays} />
        <StatCard label="Jugadores clave" value={players.length} detail="Muestra inicial editable" icon={Activity} />
        <StatCard label="Predicciones" value={predictions.length} detail="Calculadas con motor heuristico" icon={BarChart3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Top de fuerza compuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <StrengthChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Estado de datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Database className="h-4 w-4 text-primary" />
                Persistencia JSON local
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                La app lee y escribe en `/data`. Las paginas consumen repositorios,
                asi que una DB futura puede reemplazar esta capa.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Ultima sincronizacion</p>
              <p className="text-sm leading-6 text-muted-foreground">
                {syncLog[0]?.message ?? "Sin sincronizaciones registradas."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Proximos partidos</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcomingMatches(matches, 6).map((match) => {
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
