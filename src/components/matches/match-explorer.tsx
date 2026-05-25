"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MatchCard } from "@/components/matches/match-card";
import { predictionByMatchId, teamById } from "@/lib/view";
import type { Match, Prediction, Team } from "@/lib/types";

type MatchExplorerProps = {
  matches: Match[];
  teams: Team[];
  predictions: Prediction[];
};

export function MatchExplorer({ matches, teams, predictions }: MatchExplorerProps) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const teamsMap = useMemo(() => teamById(teams), [teams]);
  const predictionsMap = useMemo(() => predictionByMatchId(predictions), [predictions]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return matches
      .filter((match) => group === "all" || match.groupId === group)
      .filter((match) => {
        if (!normalized) return true;
        const home = teamsMap.get(match.homeTeamId)?.name ?? "";
        const away = teamsMap.get(match.awayTeamId)?.name ?? "";
        return `${home} ${away} ${match.venue} ${match.groupId}`
          .toLowerCase()
          .includes(normalized);
      });
  }, [group, matches, query, teamsMap]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar seleccion, estadio o grupo"
            className="pl-9"
          />
        </div>
        <select
          value={group}
          onChange={(event) => setGroup(event.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">Todos</option>
          {"ABCDEFGHIJKL".split("").map((item) => (
            <option key={item} value={item}>
              Grupo {item}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((match) => {
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
    </div>
  );
}
