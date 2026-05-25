"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TeamCard } from "@/components/teams/team-card";
import type { Player, Team } from "@/lib/types";

type TeamExplorerProps = {
  teams: Team[];
  players: Player[];
};

export function TeamExplorer({ teams, players }: TeamExplorerProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return teams;
    return teams.filter((team) =>
      [team.name, team.shortName, team.groupId, team.confederation, team.fifaCode]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, teams]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por seleccion, grupo o confederacion"
          className="pl-9"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            playerCount={players.filter((player) => player.teamId === team.id).length}
          />
        ))}
      </div>
    </div>
  );
}
