"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FolderKanban, Globe, Plus, Radar, ShieldAlert, Sparkles } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { HeaderBar } from "@/components/layout/header-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardData } from "@/lib/use-dashboard-data";

export function ProjectsPageShell() {
  const { workspace, projects, scans, findings, sites, createProject, creatingProject } = useDashboardData();
  const [form, setForm] = useState({ name: "", description: "" });

  const projectCards = useMemo(
    () =>
      projects.map((project) => {
        const projectScans = scans.filter((scan) => scan.projectId === project.id);
        const scanIds = new Set(projectScans.map((scan) => scan.id));
        const projectFindings = findings.filter((finding) => scanIds.has(finding.scanId));
        const projectSites = sites.filter((site) => site.projectId === project.id);
        return {
          ...project,
          scanCount: projectScans.length,
          openIssues: projectFindings.filter((finding) => !["resolved", "fixed"].includes(finding.status)).length,
          highSeverity: projectFindings.filter((finding) => ["critical", "high"].includes(finding.severity)).length,
          latestStatus: projectScans[0]?.status || "idle",
          sites: projectSites,
        };
      }),
    [projects, scans, findings, sites],
  );

  async function handleCreateProject(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    await createProject({ workspaceId: workspace.id, name: form.name.trim(), description: form.description.trim() || null });
    setForm({ name: "", description: "" });
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1700px] gap-6 px-4 py-4 lg:px-6">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 space-y-6">
          <HeaderBar workspace={workspace} />

          <Card className="panel-surface border-white/60 shadow-glow">
            <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FolderKanban className="h-5 w-5 text-orange-500" />
                  <h1 className="font-display text-4xl tracking-tight text-slate-950">Projects</h1>
                </div>
                <p className="max-w-3xl text-base leading-8 text-slate-600">
                  Organize scan targets by app, review current risk posture, and jump directly into issue or report flows.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryStat label="Projects" value={projects.length} />
                <SummaryStat label="Total scans" value={scans.length} />
                <SummaryStat label="Open issues" value={findings.filter((finding) => !["resolved", "fixed"].includes(finding.status)).length} />
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6 lg:grid-cols-2">
              {projectCards.length ? (
                projectCards.map((project) => (
                  <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                    <Card className="panel-surface h-full border-white/60 shadow-glow transition hover:-translate-y-1 hover:border-orange-200">
                      <CardContent className="space-y-5 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Project</p>
                            <h2 className="mt-2 font-display text-2xl text-slate-950">{project.name}</h2>
                            <p className="mt-2 text-sm leading-7 text-slate-600">{project.description || "No description added yet."}</p>
                          </div>
                          <div className="rounded-full border border-stone-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                            {project.latestStatus}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <ProjectMetric icon={Radar} label="Scans" value={project.scanCount} />
                          <ProjectMetric icon={ShieldAlert} label="High severity" value={project.highSeverity} />
                          <ProjectMetric icon={Sparkles} label="Open issues" value={project.openIssues} />
                          <ProjectMetric icon={Globe} label="Targets" value={project.sites.length} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="lg:col-span-2">
                  <EmptyState
                    title="No projects yet"
                    description="Create your first project to connect a site, launch a scan, and start generating reports."
                  />
                </div>
              )}
            </div>

            <Card className="panel-surface border-white/60 shadow-glow">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Create project</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Add a new app or service workspace without leaving the dashboard.</p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateProject}>
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project name</Label>
                    <Input id="project-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Main web app" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea id="project-description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Production app, staging admin panel, API service, or client portal." className="min-h-[130px]" />
                  </div>
                  <Button className="w-full rounded-2xl" disabled={creatingProject || !workspace?.id}>
                    <Plus className="mr-2 h-4 w-4" />
                    {creatingProject ? "Creating..." : "Create project"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ProjectMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
