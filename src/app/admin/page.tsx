import { PageHeader } from "@/components/common/page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { getTournamentData } from "@/lib/analysis";

export default async function AdminPage() {
  const { matches, teams, syncLog } = await getTournamentData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administracion local"
        title="Resultados, sync y modelo"
        description="Carga resultados reales, registra sincronizaciones manuales y recalcula probabilidades. V1 no incluye autenticacion."
      />
      <AdminPanel matches={matches} teams={teams} syncLog={syncLog} />
    </div>
  );
}
