"use client";

import { useState } from "react";
import { Download, Eye, FileBadge2, FileCheck2, FileJson2, FileText, LoaderCircle, Sparkles } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { HeaderBar } from "@/components/layout/header-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { previewReport } from "@/lib/api";
import { useDashboardData } from "@/lib/use-dashboard-data";

const reportTemplates = [
  { id: "developer", title: "Developer Report", audience: "developer", format: "json", description: "Full technical findings and remediation guidance.", icon: FileJson2 },
  { id: "stakeholder", title: "Management Summary", audience: "stakeholder", format: "html", description: "High-level risk posture and open remediation priorities.", icon: FileText },
  { id: "client-pdf", title: "Client PDF", audience: "stakeholder", format: "pdf", description: "Presentation-ready export for customer or stakeholder review.", icon: FileBadge2 },
  { id: "checklist", title: "Remediation Checklist", audience: "developer", format: "md", description: "Action-oriented checklist for engineering follow-through.", icon: FileCheck2 },
];

export function ReportsPageShell() {
  const { workspace, reports, scans, createReportAsync, generatingReport } = useDashboardData();
  const [preview, setPreview] = useState(null);
  const latestScan = scans[0];

  async function handleGenerate(template) {
    await createReportAsync({ audience: template.audience, format: template.format });
  }

  async function handlePreview(reportId) {
    const payload = await previewReport(reportId);
    setPreview(payload);
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
                <Badge variant="secondary" className="rounded-full px-3 py-1">Reports Library</Badge>
                <div>
                  <h1 className="font-display text-4xl tracking-tight text-slate-950">Generate and ship security reports</h1>
                  <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">Build developer reports, management summaries, and export artifacts from live scan data.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryChip label="Latest Scan" value={latestScan?.status || "Not available"} />
                <SummaryChip label="Report Inventory" value={`${reports.length} artifacts`} />
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6 md:grid-cols-2">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <Card key={template.id} className="panel-surface border-white/60 shadow-glow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-orange-50 p-3 text-orange-600"><Icon className="h-5 w-5" /></div>
                        <div>
                          <CardTitle className="font-display text-2xl">{template.title}</CardTitle>
                          <p className="mt-1 text-sm text-slate-500">{template.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl bg-stone-50 p-4 text-sm leading-7 text-slate-700">
                        <p><span className="font-medium">Audience:</span> {template.audience}</p>
                        <p><span className="font-medium">Format:</span> {template.format}</p>
                      </div>
                      <Button className="w-full rounded-2xl" onClick={() => handleGenerate(template)} disabled={generatingReport || !latestScan}>
                        {generatingReport ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="panel-surface border-white/60 shadow-glow">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Generated reports</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Preview and open every report created from your current workspace scans.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {reports.length ? reports.map((report) => (
                  <div key={report.id} className="rounded-2xl border border-stone-200 bg-white/80 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-medium capitalize text-slate-900">{report.audience} report</p>
                        <p className="mt-1 text-sm text-slate-600">{report.summary?.headline || "Generated report artifact."}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-full uppercase">{report.format}</Badge>
                        <Button variant="outline" className="rounded-full" onClick={() => handlePreview(report.id)}><Eye className="mr-2 h-4 w-4" />Preview</Button>
                        <a href={report.artifactUrl || "#"} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="rounded-full"><Download className="mr-2 h-4 w-4" />Open artifact</Button>
                        </a>
                      </div>
                    </div>
                  </div>
                )) : <EmptyState title="No reports yet" description="Run a scan and generate your first report artifact." />}
              </CardContent>
            </Card>
          </section>

          {preview ? <PreviewModal preview={preview} onClose={() => setPreview(null)} /> : null}
        </main>
      </div>
    </div>
  );
}

function SummaryChip({ label, value }) { return <div className="rounded-2xl border border-stone-200 bg-white/80 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p><p className="mt-2 text-lg font-semibold text-slate-900">{value}</p></div>; }

function PreviewModal({ preview, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="w-full max-w-3xl rounded-[2rem] border border-white/60 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Report preview</p>
            <h2 className="mt-2 font-display text-3xl text-slate-950">{preview.id}</h2>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={onClose}>Close</Button>
        </div>
        <div className="space-y-4 px-6 py-6">
          <div className="rounded-[1.6rem] bg-stone-50 p-5 text-sm leading-7 text-slate-700">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Markdown</p>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap">{preview.markdown}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
