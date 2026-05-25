"use client";

import { useSyncExternalStore } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type PredictionDonutProps = {
  home: number;
  draw: number;
  away: number;
};

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)"];
const emptySubscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function PredictionDonut({ home, draw, away }: PredictionDonutProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const data = [
    { name: "Local", value: home },
    { name: "Empate", value: draw },
    { name: "Visita", value: away },
  ];

  if (!mounted) {
    return <div className="h-[240px] w-full rounded-md bg-secondary/60" />;
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={58}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--popover-foreground)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
