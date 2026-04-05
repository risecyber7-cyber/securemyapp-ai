"use client";

import Link from "next/link";
import { Wand2 } from "lucide-react";
import { DashboardFrame } from "@/apps/web/components/layout/dashboard-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/lib/use-dashboard-data";

type FindingRecord = {
  id: string;
  title: string;
  framework?: string;
  filePath?: string;
  file_path?: string;
  url?: string;
  fixAvailable?: boolean;
  fix_available?: boolean;
};

export function FixesPageShell() {
  const { findings } = useDashboardData();
  const fixReady = findings.filter((finding: FindingRecord) => finding.fixAvailable ?? finding.fix_available);

  return (
    <DashboardFrame>
      <Card className="panel-surface border-white/60">
        <CardHeader className="p-6">
          <CardTitle className="font-display text-3xl">Fixes</CardTitle>
          <p className="text-sm text-muted-foreground">Review remediation-ready findings and jump directly into exact fix packages.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {fixReady.map((finding: FindingRecord) => (
            <Link key={finding.id} href={`/dashboard/issues/${finding.id}`}>
              <div className="rounded-[1.4rem] border border-input bg-card p-5 transition hover:border-primary/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-primary" />
                      <p className="font-medium text-foreground">{finding.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {finding.framework} · {finding.filePath || finding.file_path || finding.url || "runtime target"}
                    </p>
                  </div>
                  <Badge variant="success" className="rounded-full text-xs uppercase tracking-[0.2em]">
                    Fix available
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </DashboardFrame>
  );
}
