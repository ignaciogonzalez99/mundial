import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
};

export function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <Card className="rounded-lg">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="metric-mono mt-2 text-3xl font-semibold text-foreground">
            {value}
          </p>
          {detail ? (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-md border border-border bg-secondary p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
