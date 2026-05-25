import { PageHeader } from "@/components/common/page-header";
import { GroupStandings } from "@/components/groups/group-standings";
import { getTournamentData } from "@/lib/analysis";
import { calculateGroupStandings } from "@/lib/standings";
import { teamById } from "@/lib/view";

export default async function GroupsPage() {
  const { teams, groups, matches } = await getTournamentData();
  const teamsMap = teamById(teams);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fase de grupos"
        title="Tablas y evolución"
        description="Las tablas se recalculan desde los resultados cargados. Antes del inicio todos aparecen con cero puntos."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => (
          <GroupStandings
            key={group.id}
            groupName={group.name}
            standings={calculateGroupStandings(group, matches)}
            teams={teamsMap}
          />
        ))}
      </div>
    </div>
  );
}
