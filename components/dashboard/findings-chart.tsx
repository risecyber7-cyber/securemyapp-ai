"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const colors = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#d97706",
  low: "#475569",
  info: "#0f766e",
};

export function FindingsChart({ findings }: { findings: Array<{ severity: string }> }) {
  const counts = findings.reduce<Record<string, number>>((accumulator, finding) => {
    accumulator[finding.severity] = (accumulator[finding.severity] || 0) + 1;
    return accumulator;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <Card className="panel-surface border-white/60 shadow-glow">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Severity Mix</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Live chart powered by Recharts for dashboard summaries.</p>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={colors[entry.name as keyof typeof colors] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
