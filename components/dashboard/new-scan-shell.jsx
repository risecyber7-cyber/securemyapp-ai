"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, LockKeyhole, Radar, Shield } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { HeaderBar } from "@/components/layout/header-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardData } from "@/lib/use-dashboard-data";

const modes = [
  { id: "quick", title: "Quick Scan", description: "Fast passive review for obvious headers, config exposure, and surface-level issues." },
  { id: "standard", title: "Standard Scan", description: "Balanced coverage across site checks, issue normalization, and remediation output." },
  { id: "deep-safe", title: "Deep Safe Scan", description: "Expanded safe checks with more coverage, still non-invasive and production-conscious." },
];

export function NewScanShell() {
  const router = useRouter();
  const { workspace, projects, createScan, creatingScan } = useDashboardData();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    projectId: projects[0]?.id || "",
    websiteUrl: "https://example.com",
    authPagesKnown: "unknown",
    authNotes: "",
    frameworkKnown: "nextjs",
    scanMode: "standard",
    includeJsAnalysis: "yes",
    repoPlan: "connect-later",
  });

  const validation = useMemo(() => {
    const websiteValid = /^https?:\/\//.test(form.websiteUrl);
    return {
      step1: websiteValid && Boolean(form.projectId),
      step2: Boolean(form.frameworkKnown),
      step3: Boolean(form.scanMode),
      websiteValid,
    };
  }, [form]);

  const submit = () => {
    startTransition(async () => {
      const scan = await createScan({
        workspaceId: workspace.id,
        projectId: form.projectId,
        scanType: form.includeJsAnalysis === "yes" ? "full" : "website",
        baseUrl: form.websiteUrl,
        frameworkHints: [form.frameworkKnown],
      });
      router.push(`/dashboard/projects/${form.projectId || scan.projectId || projects[0]?.id}`);
    });
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1700px] gap-6 px-4 py-4 lg:px-6">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 space-y-6">
          <HeaderBar workspace={workspace} />

          <Card className="panel-surface border-white/60 shadow-glow">
            <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Link href="/dashboard" className="font-medium text-orange-600 hover:text-orange-500">Dashboard</Link>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-500">New Scan</span>
                </div>
                <div className="flex items-center gap-3">
                  <Radar className="h-5 w-5 text-orange-500" />
                  <h1 className="font-display text-4xl tracking-tight text-slate-950">New Scan</h1>
                </div>
                <p className="max-w-3xl text-base leading-8 text-slate-600">Submit a target with guided validation, choose a safe scan mode, and launch a live connected scan.</p>
              </div>
              <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-7 text-emerald-800">
                <div className="flex items-center gap-2 font-medium"><Shield className="h-4 w-4" />Safe scan disclaimer</div>
                Deep Safe Scan remains non-invasive and avoids exploit execution or harmful target interaction.
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="panel-surface border-white/60 shadow-glow">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Wizard</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Step-by-step target submission with validation states.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <StepRail step={step} validation={validation} />
                {step === 1 ? (
                  <div className="space-y-4">
                    <Field><Label htmlFor="project">Project</Label><Select id="project" value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select></Field>
                    <Field><Label htmlFor="website-url">Website URL</Label><Input id="website-url" value={form.websiteUrl} onChange={(event) => setForm((current) => ({ ...current, websiteUrl: event.target.value }))} placeholder="https://app.company.com" /><ValidationHint valid={validation.websiteValid} text="Valid target URL required" /></Field>
                    <Field><Label htmlFor="repo-plan">Repo upload/connect</Label><Select id="repo-plan" value={form.repoPlan} onChange={(event) => setForm((current) => ({ ...current, repoPlan: event.target.value }))}><option value="connect-later">Connect later</option><option value="upload-later">Upload later</option><option value="website-only">Website only for now</option></Select></Field>
                  </div>
                ) : null}
                {step === 2 ? (
                  <div className="space-y-4">
                    <Field><Label htmlFor="auth-pages-known">Auth pages known?</Label><Select id="auth-pages-known" value={form.authPagesKnown} onChange={(event) => setForm((current) => ({ ...current, authPagesKnown: event.target.value }))}><option value="unknown">Unknown</option><option value="yes">Yes</option><option value="none">No auth pages</option></Select></Field>
                    <Field><Label htmlFor="auth-notes">Auth notes</Label><Textarea id="auth-notes" value={form.authNotes} onChange={(event) => setForm((current) => ({ ...current, authNotes: event.target.value }))} placeholder="Known login paths, reset password route, protected areas, etc." className="min-h-[120px]" /></Field>
                    <Field><Label htmlFor="framework-known">Framework known?</Label><Select id="framework-known" value={form.frameworkKnown} onChange={(event) => setForm((current) => ({ ...current, frameworkKnown: event.target.value }))}><option value="nextjs">Next.js</option><option value="react">React</option><option value="express">Express</option><option value="nestjs">NestJS</option><option value="fastapi">FastAPI</option><option value="unknown">Unknown</option></Select></Field>
                  </div>
                ) : null}
                {step === 3 ? (
                  <div className="space-y-4">
                    <Field><Label htmlFor="scan-mode">Scan mode</Label><Select id="scan-mode" value={form.scanMode} onChange={(event) => setForm((current) => ({ ...current, scanMode: event.target.value }))}>{modes.map((mode) => <option key={mode.id} value={mode.id}>{mode.title}</option>)}</Select></Field>
                    <div className="grid gap-3">{modes.map((mode) => <div key={mode.id} className={`rounded-[1.4rem] border p-4 ${form.scanMode === mode.id ? "border-orange-300 bg-orange-50/80" : "border-stone-200 bg-white/80"}`}><p className="font-medium text-slate-900">{mode.title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{mode.description}</p></div>)}</div>
                    <Field><Label htmlFor="include-js-analysis">Include JS analysis?</Label><Select id="include-js-analysis" value={form.includeJsAnalysis} onChange={(event) => setForm((current) => ({ ...current, includeJsAnalysis: event.target.value }))}><option value="yes">Yes, include JS analysis</option><option value="no">No, website checks only</option></Select></Field>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <Button variant="outline" className="rounded-2xl" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1}><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>
                  {step < 3 ? (
                    <Button className="rounded-2xl" onClick={() => setStep((current) => Math.min(3, current + 1))} disabled={(step === 1 && !validation.step1) || (step === 2 && !validation.step2)}>Next<ChevronRight className="ml-2 h-4 w-4" /></Button>
                  ) : (
                    <Button className="rounded-2xl" onClick={submit} disabled={!validation.step3 || isPending || creatingScan}>{isPending || creatingScan ? "Submitting..." : "Launch scan"}</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="panel-surface border-white/60 shadow-glow"><CardHeader><CardTitle className="font-display text-2xl">Validation State</CardTitle></CardHeader><CardContent className="space-y-3"><StateRow label="Project selected" valid={Boolean(form.projectId)} /><StateRow label="Website URL valid" valid={validation.websiteValid} /><StateRow label="Framework context provided" valid={validation.step2} /><StateRow label="Scan mode selected" valid={validation.step3} /></CardContent></Card>
              <Card className="panel-surface border-white/60 shadow-glow"><CardHeader><CardTitle className="font-display text-2xl">Submission Preview</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-7 text-slate-700"><PreviewRow label="Target URL" value={form.websiteUrl} /><PreviewRow label="Framework" value={form.frameworkKnown} /><PreviewRow label="Auth pages known" value={form.authPagesKnown} /><PreviewRow label="Scan mode" value={form.scanMode} /><PreviewRow label="Include JS analysis" value={form.includeJsAnalysis} /><PreviewRow label="Repo plan" value={form.repoPlan} /></CardContent></Card>
              <Card className="border-amber-200 bg-amber-50/90 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 font-display text-xl text-amber-900"><LockKeyhole className="h-5 w-5" />Safe Scan Disclaimer</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-7 text-amber-900"><p>Quick, Standard, and Deep Safe scans are designed for safe observation and non-destructive analysis.</p><p>No exploit execution, brute-force attempts, or invasive target interaction is included in this flow.</p><p>Repository upload/connect remains intentionally separate from this guided website flow.</p></CardContent></Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StepRail({ step, validation }) { const items = [{ index: 1, label: "Target", ready: validation.step1 }, { index: 2, label: "Context", ready: validation.step2 }, { index: 3, label: "Mode", ready: validation.step3 }]; return <div className="grid gap-3 sm:grid-cols-3">{items.map((item) => <div key={item.label} className={`rounded-[1.4rem] border p-4 ${step === item.index ? "border-orange-300 bg-orange-50/80" : item.ready ? "border-emerald-200 bg-emerald-50/70" : "border-stone-200 bg-white/70"}`}><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step {item.index}</p><p className="mt-2 font-medium text-slate-900">{item.label}</p></div>)}</div>; }
function Field({ children }) { return <div className="space-y-2">{children}</div>; }
function ValidationHint({ valid, text }) { return <div className={`flex items-center gap-2 text-xs ${valid ? "text-emerald-700" : "text-amber-700"}`}>{valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}{text}</div>; }
function StateRow({ label, valid }) { return <div className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3"><span className="text-sm text-slate-700">{label}</span><Badge className={valid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>{valid ? "ready" : "pending"}</Badge></div>; }
function PreviewRow({ label, value }) { return <div className="rounded-2xl bg-stone-50 px-4 py-3"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p><p className="mt-1 text-sm text-slate-800">{value}</p></div>; }
