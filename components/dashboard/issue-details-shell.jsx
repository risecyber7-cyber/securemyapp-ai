"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileCode2,
  Lightbulb,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { HeaderBar } from "@/components/layout/header-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getRemediation } from "@/lib/api";
import { useDashboardData } from "@/lib/use-dashboard-data";
import { cn } from "@/lib/utils";

const MonacoDiffEditor = dynamic(
  () => import("@monaco-editor/react").then((module) => module.DiffEditor),
  {
    ssr: false,
    loading: () => <div className="h-[340px] animate-pulse rounded-3xl bg-stone-100" />,
  },
);

const severityTone = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
  info: "bg-sky-100 text-sky-700 border-sky-200",
};

export function IssueDetailsShell({ issueId }) {
  const { workspace, findings, updateFindingStatus, updatingFinding } = useDashboardData();
  const [copied, setCopied] = useState(false);

  const finding = findings.find((entry) => entry.id === issueId) || findings[0];
  const assignee = finding?.assignedToUserId || finding?.assigned_to_user_id || "";
  const remediationQuery = useQuery({
    queryKey: ["issue-remediation", finding?.id],
    queryFn: () => getRemediation(finding.id),
    enabled: Boolean(finding?.id),
  });

  const remediation = remediationQuery.data;
  const businessImpact = useMemo(() => {
    if (!finding) return "No finding selected.";
    if (remediation?.structured_explanation?.safe_business_impact) return remediation.structured_explanation.safe_business_impact;
    if (finding.businessImpact) return finding.businessImpact;
    if (finding.severity === "critical") return "Potential compromise risk that can affect credentials, trust, or production exposure.";
    if (finding.severity === "high") return "Meaningful security weakness with realistic abuse potential.";
    if (finding.severity === "medium") return "Operational and security risk that should be remediated in the current cycle.";
    return "Lower-risk issue that should still be tracked and cleaned up.";
  }, [finding, remediation]);
  const isResolved = finding?.status === "fixed" || finding?.status === "resolved";
  const isFalsePositive = Boolean(finding?.falsePositive || finding?.false_positive);

  async function copySnippet() {
    if (!remediation?.codeSnippet) return;
    try {
      await navigator.clipboard.writeText(remediation.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function markResolved() {
    if (!finding?.id) return;
    await updateFindingStatus({
      findingId: finding.id,
      payload: { status: "resolved" },
      successMessage: "Issue marked as resolved.",
      successDescription: "The issue status was updated and the activity was saved.",
      errorMessage: "Could not resolve the issue.",
      errorDescription: "The previous state has been restored.",
    });
  }

  async function reopenIssue() {
    if (!finding?.id) return;
    await updateFindingStatus({
      findingId: finding.id,
      payload: { status: "open" },
      successMessage: "Issue reopened.",
      successDescription: "The finding is back in the active queue.",
      errorMessage: "Could not reopen the issue.",
      errorDescription: "The previous state has been restored.",
    });
  }

  async function toggleFalsePositive() {
    if (!finding?.id) return;
    await updateFindingStatus({
      findingId: finding.id,
      payload: { false_positive: !isFalsePositive },
      successMessage: isFalsePositive ? "False positive removed." : "Marked as false positive.",
      successDescription: isFalsePositive
        ? "The finding is back in the normal remediation queue."
        : "The finding remains visible but flagged for analyst review.",
      errorMessage: "Could not update false-positive state.",
      errorDescription: "The previous state has been restored.",
    });
  }

  async function assignOwner(userId) {
    await updateFindingStatus({
      findingId: finding.id,
      payload: { assigned_to_user_id: userId || null },
      successMessage: userId ? "Owner assigned." : "Owner removed.",
      successDescription: userId
        ? "The finding now has a clear remediation owner."
        : "The finding is now unassigned.",
      errorMessage: "Could not update the owner.",
      errorDescription: "The previous assignee has been restored.",
    });
  }

  if (!finding) {
    return null;
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
                <div className="flex items-center gap-3 text-sm">
                  <Link href="/dashboard/issues" className="font-medium text-orange-600 hover:text-orange-500">
                    Issues
                  </Link>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-500">{finding.title}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn("border capitalize", severityTone[finding.severity] || severityTone.info)}>
                      {finding.severity}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full">
                      {finding.framework}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {isResolved ? "resolved" : finding.status || "open"}
                    </Badge>
                    {isFalsePositive ? (
                      <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-700">
                        false positive
                      </Badge>
                    ) : null}
                  </div>
                  <h1 className="font-display text-4xl tracking-tight text-slate-950">{finding.title}</h1>
                  <p className="max-w-3xl text-base leading-8 text-slate-600">{finding.description}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button className="h-12 rounded-2xl" onClick={markResolved} disabled={updatingFinding || isResolved}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isResolved ? "Resolved" : "Mark resolved"}
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl" onClick={copySnippet}>
                  {copied ? <ClipboardCheck className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "Snippet copied" : "Copy snippet"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
            <div className="space-y-6">
              <DetailCard title="Issue Summary" icon={ShieldAlert}>
                <p className="text-sm leading-7 text-slate-700">
                  {remediation?.structured_explanation?.summary || finding.description}
                </p>
              </DetailCard>

              <DetailCard title="Why It Matters" icon={AlertTriangle}>
                <p className="text-sm leading-7 text-slate-700">
                  {remediation?.structured_explanation?.why_it_matters || "This issue becomes risky because the current implementation allows security-sensitive behavior without enough guardrails, validation, or hardening for the framework and execution path involved."}
                </p>
              </DetailCard>

              {remediation?.structured_explanation && (
                <DetailCard title="Safe Explanation" icon={Sparkles}>
                  <div className="space-y-4 text-sm leading-7 text-slate-700">
                    <div>
                      <h4 className="font-semibold text-slate-900">Technical Details</h4>
                      <p>{remediation.structured_explanation.technical_explanation}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Likely Causes</h4>
                      <p>{remediation.structured_explanation.likely_causes}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Remediation Overview</h4>
                      <p>{remediation.structured_explanation.remediation_overview}</p>
                    </div>
                  </div>
                </DetailCard>
              )}

              <DetailCard title="Affected Endpoint / File" icon={FileCode2}>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><span className="font-medium">Location:</span> {finding.filePath || finding.url || "runtime observation"}</p>
                  <p><span className="font-medium">Category:</span> {finding.category}</p>
                  <p><span className="font-medium">Confidence:</span> {finding.confidence}</p>
                </div>
              </DetailCard>

              <DetailCard title="Evidence" icon={Sparkles}>
                <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Evidence card</p>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {JSON.stringify(
                      {
                        detector: finding.evidence?.detector,
                        location: finding.filePath || finding.url,
                        cwe: finding.cweIds,
                        owasp: finding.owaspTags,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </DetailCard>

              <DetailCard title="Exact Fix" icon={ClipboardCheck}>
                <div className="rounded-[1.6rem] border border-stone-200 bg-[#0f172a] p-2">
                  <MonacoDiffEditor
                    height="340px"
                    theme="vs-dark"
                    original={remediation?.before_code || ""}
                    modified={remediation?.after_code || remediation?.patchDiff || remediation?.codeSnippet || "// Fix not available yet"}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      renderSideBySide: false,
                      lineNumbersMinChars: 3,
                      fontFamily: "IBM Plex Mono, Consolas, monospace",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-7 text-slate-700">
                  Apply this fix manually by updating the affected file or endpoint, then rerun the scan to confirm closure.
                </div>
              </DetailCard>

              <DetailCard title="Framework-Specific Implementation" icon={Lightbulb}>
                <div className="space-y-3 text-sm leading-7 text-slate-700">
                  <p>{remediation?.explanation || "Framework-specific implementation guidance will appear here."}</p>
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Secure config example</p>
                    <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{remediation?.secure_config_example || "// No config example available"}</pre>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Middleware example</p>
                    <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{remediation?.middleware_example || "// No middleware example available"}</pre>
                  </div>
                </div>
              </DetailCard>
            </div>

            <div className="space-y-6">
              <DetailCard title="Business Impact" icon={ShieldAlert}>
                <p className="text-sm leading-7 text-slate-700">{businessImpact}</p>
              </DetailCard>

              <DetailCard title="Issue Actions" icon={ClipboardCheck}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assign owner</Label>
                    <Select
                      id="assignee"
                      value={assignee}
                      onChange={(event) => assignOwner(event.target.value)}
                      disabled={updatingFinding}
                    >
                      <option value="">Unassigned</option>
                      {workspace.members.map((member) => (
                        <option key={member.id || member.email} value={member.id || member.email}>
                          {member.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button variant="outline" className="rounded-2xl" onClick={toggleFalsePositive} disabled={updatingFinding}>
                      {isFalsePositive ? "Unmark false positive" : "Mark false positive"}
                    </Button>
                    <Button variant="outline" className="rounded-2xl" onClick={reopenIssue} disabled={updatingFinding || !isResolved}>
                      Reopen issue
                    </Button>
                  </div>
                </div>
              </DetailCard>

              <DetailCard title="Validation Checklist" icon={CheckCircle2}>
                <div className="space-y-3">
                  {(remediation?.validationSteps || ["Review patch manually before applying."]).map((step) => (
                    <div key={step} className="flex items-start gap-3 rounded-2xl bg-stone-50 p-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                      <p className="text-sm text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </DetailCard>

              <DetailCard title="AI Notes" icon={Sparkles}>
                <div className="space-y-3 text-sm leading-7 text-slate-700">
                  <p>AI-generated guidance is meant to accelerate manual remediation review, not bypass it.</p>
                  <p>Confidence score: <span className="font-medium">{remediation?.confidence_score ?? "N/A"}</span></p>
                  <p>Framework context: <span className="font-medium">{finding.framework}</span></p>
                  <p>{finding.aiNotes || finding.ai_notes || "Model guidance is based on the current finding metadata and remediation template."}</p>
                </div>
              </DetailCard>

              <DetailCard title="Apply Manually Instructions" icon={FileCode2}>
                <div className="space-y-3 text-sm leading-7 text-slate-700">
                  <p>1. Create a feature branch and copy the suggested snippet or patch into the affected file.</p>
                  <p>2. Add or update tests around the vulnerable route, config, or endpoint before merge.</p>
                  <p>3. Re-run the scan and confirm the issue moves from open to resolved.</p>
                </div>
              </DetailCard>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function DetailCard({ title, icon: Icon, children }) {
  return (
    <Card className="panel-surface border-white/60 shadow-glow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-orange-500" />
          <CardTitle className="font-display text-2xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
