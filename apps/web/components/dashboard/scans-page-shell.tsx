"use client";

import Link from "next/link";
import { Radar, TimerReset } from "lucide-react";
import { DashboardFrame } from "@/apps/web/components/layout/dashboard-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline } from "@/components/ui/timeline";
import { useDashboardData } from "@/lib/use-dashboard-data";

type ScanRecord = {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  projectId?: string;
};

export function ScansPageShell() {
  const { scans } = useDashboardData();

  return (
    <DashboardFrame>
      <Card className="panel-surface border-white/60">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-display text-3xl">Scans</CardTitle>
            <p className="text-sm text-muted-foreground">Track recent quick, standard, and deep-safe scans across projects.</p>
          </div>
          <Link href="/dashboard/scans/new">
            <Button className="rounded-2xl">
              <Radar className="mr-2 h-4 w-4" />
              New scan
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Timeline
            items={(scans as ScanRecord[]).map((scan) => ({
              id: scan.id,
              title: `${scan.type} scan · ${scan.status}`,
              meta: scan.startedAt,
              description: `Project ${scan.projectId || "unassigned"} · started ${scan.startedAt}`,
              tone: scan.status === "completed" ? "bg-success" : "bg-warning",
            }))}
          />
          {scans.length === 0 ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <TimerReset className="h-4 w-4" />
              No scans available yet.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </DashboardFrame>
  );
}
