"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { teamById } from "@/lib/view";
import type { Match, SyncLogEntry, Team } from "@/lib/types";

type AdminPanelProps = {
  matches: Match[];
  teams: Team[];
  syncLog: SyncLogEntry[];
};

export function AdminPanel({ matches, teams, syncLog }: AdminPanelProps) {
  const router = useRouter();
  const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
  const teamsMap = useMemo(() => teamById(teams), [teams]);
  const [matchId, setMatchId] = useState(matches[0]?.id ?? "");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [notes, setNotes] = useState("");
  const [syncSource, setSyncSource] = useState("manual-review");
  const [syncNotes, setSyncNotes] = useState("");
  const [message, setMessage] = useState("");

  const selectedMatch = matches.find((match) => match.id === matchId);

  async function saveResult() {
    if (isStaticExport) {
      setMessage("GitHub Pages esta en modo lectura; no puede escribir JSON.");
      return;
    }
    setMessage("Guardando resultado...");
    const response = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore, awayScore, notes }),
    });
    setMessage(response.ok ? "Resultado guardado y predicciones recalculadas." : "Error al guardar resultado.");
    router.refresh();
  }

  async function recalculate() {
    if (isStaticExport) {
      setMessage("GitHub Pages esta en modo lectura; no puede recalcular en servidor.");
      return;
    }
    setMessage("Recalculando predicciones...");
    const response = await fetch("/api/predictions", { method: "POST" });
    setMessage(response.ok ? "Predicciones recalculadas." : "No se pudo recalcular.");
    router.refresh();
  }

  async function sync() {
    if (isStaticExport) {
      setMessage("GitHub Pages esta en modo lectura; el sync requiere servidor.");
      return;
    }
    setMessage("Registrando sincronizacion...");
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: syncSource, notes: syncNotes }),
    });
    setMessage(response.ok ? "Sync registrado." : "No se pudo registrar sync.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Cargar resultado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isStaticExport ? (
            <div className="rounded-md border border-border bg-secondary p-3 text-sm text-muted-foreground">
              Deploy estatico en modo lectura. Las acciones de escritura funcionan
              localmente con `npm run dev`.
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Partido</Label>
            <select
              value={matchId}
              onChange={(event) => setMatchId(event.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {matches.map((match) => {
                const home = teamsMap.get(match.homeTeamId);
                const away = teamsMap.get(match.awayTeamId);
                return (
                  <option key={match.id} value={match.id}>
                    #{match.matchNumber} {home?.shortName} vs {away?.shortName}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{teamsMap.get(selectedMatch?.homeTeamId ?? "")?.shortName ?? "Equipo 1"}</Label>
              <Input type="number" min={0} max={30} value={homeScore} onChange={(event) => setHomeScore(Number(event.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>{teamsMap.get(selectedMatch?.awayTeamId ?? "")?.shortName ?? "Equipo 2"}</Label>
              <Input type="number" min={0} max={30} value={awayScore} onChange={(event) => setAwayScore(Number(event.target.value))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
          <Button onClick={saveResult} disabled={isStaticExport} className="w-full">
            <Save className="h-4 w-4" />
            Guardar resultado
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Sincronizacion manual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Input value={syncSource} onChange={(event) => setSyncSource(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={syncNotes} onChange={(event) => setSyncNotes(event.target.value)} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={sync} disabled={isStaticExport} variant="secondary">
                <RefreshCw className="h-4 w-4" />
                Registrar sync
              </Button>
              <Button onClick={recalculate} disabled={isStaticExport} variant="outline">
                <RefreshCw className="h-4 w-4" />
                Recalcular
              </Button>
            </div>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Bitacora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {syncLog.slice(0, 5).map((entry) => (
              <div key={entry.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-medium">{entry.source}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{entry.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
