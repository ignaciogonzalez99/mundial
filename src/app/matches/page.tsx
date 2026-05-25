import { PageHeader } from "@/components/common/page-header";
import { MatchExplorer } from "@/components/matches/match-explorer";
import { getTournamentData } from "@/lib/analysis";

export default async function MatchesPage() {
  const { teams, matches, predictions } = await getTournamentData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fixture"
        title="72 partidos de fase de grupos"
        description="Calendario filtrable con probabilidades estimadas y acceso al detalle analitico de cada partido."
      />
      <MatchExplorer teams={teams} matches={matches} predictions={predictions} />
    </div>
  );
}
