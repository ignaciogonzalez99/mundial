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
import type { GroupStanding, Team } from "@/lib/types";

type GroupStandingsProps = {
  groupName: string;
  standings: GroupStanding[];
  teams: Map<string, Team>;
};

export function GroupStandings({ groupName, standings, teams }: GroupStandingsProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-semibold text-foreground">{groupName}</h2>
        <Badge variant="secondary">Top 2 directo</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipo</TableHead>
            <TableHead className="text-right">PJ</TableHead>
            <TableHead className="text-right">DG</TableHead>
            <TableHead className="text-right">Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((standing, index) => {
            const team = teams.get(standing.teamId);
            return (
              <TableRow key={standing.teamId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="metric-mono text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                    <Link
                      href={`/teams/${standing.teamId}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {team?.shortName ?? standing.teamId}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="metric-mono text-right">{standing.played}</TableCell>
                <TableCell className="metric-mono text-right">
                  {standing.goalDifference}
                </TableCell>
                <TableCell className="metric-mono text-right font-semibold">
                  {standing.points}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
