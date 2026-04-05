import Link from "next/link";
import { FolderKanban, Radar, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectOverviewPanel({ projects, scans, findings }) {
  return (
    <Card className="panel-surface border-white/60 shadow-glow">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Project Overview</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Quick view of all active projects and where scan attention is landing.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project) => {
          const projectScans = scans.filter((scan) => scan.projectId === project.id);
          const scanIds = new Set(projectScans.map((scan) => scan.id));
          const projectFindings = findings.filter((finding) => scanIds.has(finding.scanId));
          return (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block rounded-[1.5rem] border border-stone-200 bg-white/80 p-4 transition hover:border-orange-200 hover:bg-orange-50/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-orange-500" />
                    <p className="font-semibold text-slate-900">{project.name}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{project.description}</p>
                </div>
                <div className="rounded-2xl bg-stone-100 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {projectScans.length} scans
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <InfoPill icon={Radar} label="Recent scans" value={projectScans.length} />
                <InfoPill
                  icon={ShieldCheck}
                  label="Open issues"
                  value={projectFindings.filter((finding) => finding.status !== "fixed").length}
                />
                <InfoPill
                  icon={ShieldCheck}
                  label="Fixed issues"
                  value={projectFindings.filter((finding) => finding.status === "fixed").length}
                />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
