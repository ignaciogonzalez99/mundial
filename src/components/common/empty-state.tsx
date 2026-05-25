import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
};

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="rounded-lg border-dashed">
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        {Icon ? (
          <div className="mb-4 rounded-md border border-border bg-secondary p-3 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
