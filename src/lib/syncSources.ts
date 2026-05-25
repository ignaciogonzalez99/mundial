import type { SyncLogEntry } from "@/lib/types";

export type SyncRequest = {
  source: string;
  notes?: string;
};

export async function runManualSync(request: SyncRequest): Promise<SyncLogEntry> {
  const startedAt = new Date().toISOString();
  const finishedAt = new Date().toISOString();

  return {
    id: `sync-${Date.now()}`,
    source: request.source,
    status: "skipped",
    startedAt,
    finishedAt,
    changesApplied: 0,
    message:
      request.notes?.trim() ||
      "Sync manual registrado. Los adaptadores externos quedan preparados para conectar fuentes reales.",
  };
}
