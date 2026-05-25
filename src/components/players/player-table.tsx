import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Player } from "@/lib/types";

type PlayerTableProps = {
  players: Player[];
  showTeam?: boolean;
  teamNameById?: Map<string, string>;
};

export function PlayerTable({ players, showTeam, teamNameById }: PlayerTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jugador</TableHead>
            {showTeam ? <TableHead>Seleccion</TableHead> : null}
            <TableHead>Pos.</TableHead>
            <TableHead>Club</TableHead>
            <TableHead className="text-right">Forma</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell>
                <Link
                  href={`/players/${player.id}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {player.name}
                </Link>
              </TableCell>
              {showTeam ? (
                <TableCell>{teamNameById?.get(player.teamId) ?? player.teamId}</TableCell>
              ) : null}
              <TableCell className="metric-mono">{player.position}</TableCell>
              <TableCell className="max-w-[180px] truncate text-muted-foreground">
                {player.club}
              </TableCell>
              <TableCell className="metric-mono text-right">{player.currentForm}</TableCell>
              <TableCell>
                <Badge
                  variant={player.status === "available" ? "secondary" : "outline"}
                >
                  {player.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
