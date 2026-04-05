"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CheckCircle2, Download, FolderKanban, Radar, ServerCog, Settings, ShieldCheck, Sparkles } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { HeaderBar } from "@/components/layout/header-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardData } from "@/lib/use-dashboard-data";

export function ProjectDetailsShell({ projectId }) {
  const {
    workspace,
    projects,
    sites,
    scans,
    findings,
    reports,
    loading,
  } = useDashboardData();

  const project = projects.find((entry) => entry.id === projectId) || projects[0];
  const projectScans = scans.filter((scan) => scan.projectId === project?.id);
  const scanIds = new Set(projectScans.map((scan) => scan.id));
  const projectFindings = findings.filter((finding) => scanIds.has(finding.scanId));
  const projectReports = reports.filter((report) => scanIds.has(report.scanId));
  const projectSites = sites.filter((site) => site.projectId === project?.id || (!site.projectId && project?.id === "proj_1"));

  const latestScan = projectScans[0];
  const stackSummary = useMemo(() => {
    const frameworks = [...new Set(projectFindings.map((finding) => finding.framework).filter(Boolean))];
    return frameworks.length ? frameworks.join(", ") : "Next.js, FastAPI, Web";
  }, [projectFindings]);

  const highSeverity = projectFindings.filter((finding) => ["critical", "high"].includes(finding.severity)).length;
  const fixedIssues = projectFindings.filter((finding) => finding.status === "fixed").length;
  const fixCoverage = projectFindings.length ? `${Math.round((fixedIssues / projectFindings.length) * 100)}%` : "0%";

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex max-w-[1700px] gap-6 px-4 py-4 lg:px-6">
          <DashboardSidebar />
          <main className="min-w-0 flex-1 space-y-6">
            <HeaderBar workspace={workspace} />
            <div className="animate-pulse space-y-6">
              <div className="h-40 rounded-[2rem] bg-stone-200/50" />
              <div className="grid gap-6 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-[2rem] bg-stone-200/50 xl:col-span-1" />
                ))}
              </div>
              <div className="h-10 w-full max-w-md rounded-2xl bg-stone-200/50" />
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="h-[400px] rounded-[2rem] bg-stone-200/50" />
                <div className="h-[400px] rounded-[2rem] bg-stone-200/50" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1700px] gap-6 px-4 py-4 lg:px-6">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 space-y-6">
          <HeaderBar workspace={workspace} />

          <Card className="panel-surface border-white/60 shadow-glow">
            <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Link href="/dashboard" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                    Dashboard
                  </Link>
                  <span className="text-sm text-slate-400">/</span>
                  <span className="text-sm text-slate-500">{project?.name || "Project"}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-5 w-5 text-orange-500" />
                    <h1 className="font-display text-4xl tracking-tight text-slate-950">{project?.name || "Project Details"}</h1>
                  </div>
                  <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
                    {project?.description || "Single project overview for scans, findings, fixes, and reports."}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/dashboard/scans/new"><Button className="h-12 rounded-2xl">Run project scan</Button></Link>
                <Button variant="outline" className="h-12 rounded-2xl">
                  Download latest report
                </Button>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-6 xl:grid-cols-6">
            <InfoCard title="Project Info" value={project?.name || "N/A"} meta={project?.description || "No description"} icon={FolderKanban} />
            <InfoCard title="Detected Stack" value={stackSummary} meta="Framework and target inference" icon={ServerCog} />
            <InfoCard title="Latest Scan" value={latestScan?.status || "Not run"} meta={latestScan?.startedAt || "Awaiting first scan"} icon={Radar} />
            <InfoCard title="Issue Summary" value={`${projectFindings.length} findings`} meta={`${highSeverity} high/critical`} icon={ShieldCheck} />
            <InfoCard title="Fix Coverage" value={fixCoverage} meta={`${fixedIssues} issues fixed`} icon={CheckCircle2} />
            <InfoCard title="Reports" value={`${projectReports.length} ready`} meta="Developer and stakeholder exports" icon={Download} />
          </section>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="fixes">Fixes</TabsTrigger>
              <TabsTrigger value="scans">Scans</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="panel-surface border-white/60 shadow-glow">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">Overview</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Full project snapshot covering detected stack, latest scan state, issue summary, and report readiness.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SectionRow label="Tracked sites" value={projectSites.map((site) => site.baseUrl).join(", ") || "No linked sites yet"} />
                    <SectionRow label="Framework signals" value={stackSummary} />
                    <SectionRow label="Latest scan type" value={latestScan?.type || "N/A"} />
                    <SectionRow label="Latest scan timestamp" value={latestScan?.completedAt || latestScan?.startedAt || "N/A"} />
                    <SectionRow label="Report coverage" value={`${projectReports.length} reports available for this project`} />
                  </CardContent>
                </Card>

                <Card className="panel-surface border-white/60 shadow-glow">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ActionTile title="Review latest fix package" subtitle="Open the most recent remediation suggestions for this project." />
                    <ActionTile title="Download report" subtitle="Export the latest stakeholder or developer report artifact." />
                    <ActionTile title="Update target settings" subtitle="Adjust project-linked websites, repositories, and verification scope." />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="issues">
              <ListCard
                title="Project Issues"
                description="All findings associated with this specific app/site."
                items={projectFindings.map((finding) => ({
                  title: finding.title,
                  subtitle: `${finding.severity} • ${finding.category} • ${finding.filePath || finding.url || finding.framework}`,
                  badge: finding.severity,
                }))}
              />
            </TabsContent>

            <TabsContent value="fixes">
              <ListCard
                title="Fix Coverage"
                description="Framework-aware remediation inventory for this project."
                items={projectFindings.map((finding) => ({
                  title: `Fix for ${finding.title}`,
                  subtitle: `Coverage: ${finding.status === "fixed" ? "applied" : "ready"} • framework ${finding.framework}`,
                  badge: finding.status === "fixed" ? "fixed" : "ready",
                }))}
              />
            </TabsContent>

            <TabsContent value="scans">
              <ListCard
                title="Scan History"
                description="Recent scans organized for this project."
                items={projectScans.map((scan) => ({
                  title: `${scan.type} scan`,
                  subtitle: `${scan.status} • ${scan.startedAt}`,
                  badge: scan.status,
                }))}
              />
            </TabsContent>

            <TabsContent value="reports">
              <ListCard
                title="Reports"
                description="Developer and client-facing report outputs for this project."
                items={projectReports.map((report) => ({
                  title: `${report.audience} report`,
                  subtitle: `${report.format} • ${report.summary.headline}`,
                  badge: report.format,
                }))}
              />
            </TabsContent>

            <TabsContent value="settings">
              <Card className="panel-surface border-white/60 shadow-glow">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Settings</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ownership validation, default scan modes, report preferences, and project-level configuration live here.
                  </p>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <SettingBlock title="Ownership validation" body="Enable domain and repository ownership proof before deeper scans." />
                  <SettingBlock title="Scan defaults" body="Choose website, repo, or full scan as the project default execution mode." />
                  <SettingBlock title="Report output" body="Control stakeholder PDF generation and developer report detail levels." />
                  <SettingBlock title="AI fix policy" body="Tune confidence thresholds and review gates before proposed patches are surfaced." />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function InfoCard({ title, value, meta, icon: Icon }) {
  return (
    <Card className="panel-surface border-white/60 shadow-glow xl:col-span-1 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl cursor-default group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground group-hover:text-slate-600 transition-colors">{title}</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{meta}</p>
          </div>
          <div className="rounded-2xl bg-orange-50 p-3 text-orange-600 transition-all duration-300 group-hover:bg-orange-100 group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionRow({ label, value }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-800">{value}</p>
    </div>
  );
}

function ActionTile({ title, subtitle }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-orange-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        <p className="font-medium text-slate-900">{title}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
    </div>
  );
}

function ListCard({ title, description, items }) {
  return (
    <Card className="panel-surface border-white/60 shadow-glow">
      <CardHeader>
        <CardTitle className="font-display text-2xl">{title}</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={`${item.title}-${item.subtitle}`} className="rounded-[1.4rem] border border-white/40 bg-white/50 backdrop-blur-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] cursor-pointer group">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.subtitle}</p>
                </div>
                <Badge variant="outline" className="rounded-full capitalize">
                  {item.badge}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-muted-foreground">
            No records yet for this tab.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SettingBlock({ title, body }) {
  return (
    <div className="rounded-[1.4rem] border border-white/60 bg-white/40 backdrop-blur-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group">
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-orange-500 transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" />
        <p className="font-medium text-slate-900">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </div>
  );
}
