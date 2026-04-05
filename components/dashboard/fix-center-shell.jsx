"use client";

import { useMemo, useState } from "react";
import { Code2, Copy, RefreshCcw, Sparkles } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { HeaderBar } from "@/components/layout/header-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CodeBlock } from "@/components/ui/code-block";
import { useDashboardData } from "@/lib/use-dashboard-data";

export function FixCenterShell() {
  const { workspace, fixes, findings, regenerateFix, regeneratingFix } = useDashboardData();
  const [copiedId, setCopiedId] = useState(null);

  const fixCards = useMemo(
    () =>
      fixes.map((fix) => {
        const finding = findings.find((entry) => entry.id === fix.findingId);
        return { ...fix, finding };
      }),
    [fixes, findings],
  );

  async function copy(text, id) {
    await navigator.clipboard.writeText(text || "");
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
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
                  <Code2 className="h-5 w-5 text-orange-500" />
                  <h1 className="font-display text-4xl tracking-tight text-slate-950">Fix Center</h1>
                </div>
                <p className="max-w-3xl text-base leading-8 text-slate-600">
                  Review generated remediation packages, copy exact code guidance, and regenerate fixes when context changes.
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white/80 px-5 py-4 text-sm text-slate-600">
                {fixCards.length} generated fixes available for review.
              </div>
            </CardContent>
          </Card>

          {fixCards.length ? (
            <div className="grid gap-6">
              {fixCards.map((fix) => (
                <Card key={fix.id} className="panel-surface border-white/60 shadow-glow">
                  <CardHeader>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <CardTitle className="font-display text-2xl">{fix.title}</CardTitle>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{fix.finding?.title || fix.explanation}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-full">{fix.finding?.framework || "generic"}</Badge>
                        <Badge className="rounded-full bg-amber-100 text-amber-800">confidence {fix.confidenceScore}</Badge>
                        {fix.reviewRequired ? <Badge className="rounded-full bg-slate-100 text-slate-700">review required</Badge> : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                      <CodeBlock code={fix.afterCode || fix.codeSnippet || "// No code snippet available"} language="typescript" title="Suggested fix" />
                      <div className="space-y-4">
                        <div className="rounded-2xl bg-stone-50 p-4 text-sm leading-7 text-slate-700">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Why this fix</p>
                          <p className="mt-3">{fix.explanation}</p>
                        </div>
                        <div className="space-y-3">
                          <Button className="w-full rounded-2xl" onClick={() => copy(fix.afterCode || fix.codeSnippet, fix.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            {copiedId === fix.id ? "Copied" : "Copy fix"}
                          </Button>
                          <Button variant="outline" className="w-full rounded-2xl" disabled={regeneratingFix} onClick={() => regenerateFix(fix.findingId)}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            {regeneratingFix ? "Regenerating..." : "Regenerate AI fix"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="No fixes yet" description="Run a scan first so SecureMyApp AI can generate remediation guidance." />
          )}
        </main>
      </div>
    </div>
  );
}
