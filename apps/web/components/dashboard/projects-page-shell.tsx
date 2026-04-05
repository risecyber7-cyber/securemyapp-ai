"use client";

import Link from "next/link";
import { FolderKanban, ShieldCheck } from "lucide-react";
import { DashboardFrame } from "@/apps/web/components/layout/dashboard-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/lib/use-dashboard-data";

type ProjectRecord = {
  id: string;
  name: string;
  description?: string;
};

type ScanRecord = {
  id: string;
  projectId?: string;
};

type FindingRecord = {
  scanId?: string;
};

export function ProjectsPageShell() {
  const { projects, scans, findings } = useDashboardData();

  return (
    <DashboardFrame>
      <Card className="panel-surface border-white/60">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Projects</CardTitle>
          <p className="text-sm text-muted-foreground">Organize scans, issues, reports, and ownership by application or site.</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project: ProjectRecord) => {
            const typedScans = scans as ScanRecord[];
            const typedFindings = findings as FindingRecord[];
            const projectScans = typedScans.filter((scan) => scan.projectId === project.id).length;
            const projectFindings = typedFindings.filter(
              (finding) => typedScans.find((scan: ScanRecord) => scan.id === finding.scanId)?.projectId === project.id,
            ).length;
            return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <div className="rounded-[1.5rem] border border-input bg-card p-5 shadow-glow transition hover:border-primary/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <Badge variant="outline">{projectScans} scans</Badge>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">{project.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{project.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-info" />
                    {projectFindings} linked findings
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </DashboardFrame>
  );
}
