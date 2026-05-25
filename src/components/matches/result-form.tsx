"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Match, Team } from "@/lib/types";

type ResultFormProps = {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
};

export function ResultForm({ match, homeTeam, awayTeam }: ResultFormProps) {
  const router = useRouter();
  const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
  const [homeScore, setHomeScore] = useState(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(match.awayScore ?? 0);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isStaticExport) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    const response = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: match.id,
        homeScore,
        awayScore,
        notes,
      }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("saved");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="homeScore">{homeTeam.shortName}</Label>
          <Input
            id="homeScore"
            type="number"
            min={0}
            max={30}
            value={homeScore}
            onChange={(event) => setHomeScore(Number(event.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="awayScore">{awayTeam.shortName}</Label>
          <Input
            id="awayScore"
            type="number"
            min={0}
            max={30}
            value={awayScore}
            onChange={(event) => setAwayScore(Number(event.target.value))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Contexto del resultado, lesiones, tarjetas o lectura del partido"
        />
      </div>
      <Button
        type="submit"
        disabled={status === "saving" || isStaticExport}
        className="w-full"
      >
        <Save className="h-4 w-4" />
        {status === "saving" ? "Guardando..." : "Guardar resultado"}
      </Button>
      {isStaticExport ? (
        <p className="text-sm text-muted-foreground">
          En GitHub Pages esta accion queda en modo lectura porque no hay servidor
          para escribir JSON.
        </p>
      ) : null}
      {status === "saved" ? (
        <p className="text-sm text-primary">Resultado guardado y modelo actualizado.</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-destructive">No se pudo guardar el resultado.</p>
      ) : null}
    </form>
  );
}
