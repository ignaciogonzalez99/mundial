import { PageHeader } from "@/components/common/page-header";
import { TeamExplorer } from "@/components/teams/team-explorer";
import { getTournamentData } from "@/lib/analysis";

export default async function TeamsPage() {
  const { teams, players } = await getTournamentData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Selecciones"
        title="48 equipos clasificados"
        description="Explora grupo, rating base, estilo de juego y jugadores clave de cada seleccion."
      />
      <TeamExplorer teams={teams} players={players} />
    </div>
  );
}
