"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Filter, ShieldAlert } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { HeaderBar } from "@/components/layout/header-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useDashboardData } from "@/lib/use-dashboard-data";
import { cn } from "@/lib/utils";

const severityTone = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
  info: "bg-sky-100 text-sky-700 border-sky-200",
};

export function IssuesPageShell() {
  const { workspace, findings } = useDashboardData();
  const [expandedId, setExpandedId] = useState(null);
  const [filters, setFilters] = useState({
    severity: "all",
    category: "all",
    framework: "all",
    fixReady: "all",
    falsePositive: "all",
    status: "all",
  });

  const categories = unique(findings.map((finding) => finding.category));
  const frameworks = unique(findings.map((finding) => finding.framework));

  const filteredFindings = useMemo(
    () =>
      findings.filter((finding) => {
        if (filters.severity !== "all" && finding.severity !== filters.severity) return false;
        if (filters.category !== "all" && finding.category !== filters.category) return false;
        if (filters.framework !== "all" && finding.framework !== filters.framework) return false;
        if (filters.fixReady !== "all" && String(Boolean(finding.fixAvailable)) !== filters.fixReady) return false;
        if (filters.falsePositive !== "all" && String(Boolean(finding.falsePositive)) !== filters.falsePositive) return false;
        if (filters.status !== "all" && finding.status !== filters.status) return false;
        return true;
      }),
    [findings, filters],
  );

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
                  <ShieldAlert className="h-5 w-5 text-orange-500" />
                  <h1 className="font-display text-4xl tracking-tight text-slate-950">Issue List</h1>
                </div>
                <p className="max-w-3xl text-base leading-8 text-slate-600">
                  Review every finding in one place with filterable columns, fix-readiness signals, and expandable details.
                </p>
              </div>
              <Badge variant="outline" className="rounded-full px-4 py-2 text-xs uppercase tracking-[0.22em]">
                {filteredFindings.length} visible findings
              </Badge>
            </CardContent>
          </Card>

          <Card className="panel-surface border-white/60 shadow-glow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-orange-500" />
                <CardTitle className="font-display text-2xl">Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <FilterSelect label="Severity" value={filters.severity} onChange={(value) => setFilters((current) => ({ ...current, severity: value }))} options={["all", "critical", "high", "medium", "low", "info"]} />
              <FilterSelect label="Category" value={filters.category} onChange={(value) => setFilters((current) => ({ ...current, category: value }))} options={["all", ...categories]} />
              <FilterSelect label="Framework" value={filters.framework} onChange={(value) => setFilters((current) => ({ ...current, framework: value }))} options={["all", ...frameworks]} />
              <FilterSelect label="Fix Ready" value={filters.fixReady} onChange={(value) => setFilters((current) => ({ ...current, fixReady: value }))} options={["all", "true", "false"]} />
              <FilterSelect label="False Positive" value={filters.falsePositive} onChange={(value) => setFilters((current) => ({ ...current, falsePositive: value }))} options={["all", "true", "false"]} />
              <FilterSelect label="Open / Resolved" value={filters.status} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={["all", "open", "fixed", "resolved"]} />
            </CardContent>
          </Card>

          <Card className="panel-surface border-white/60 shadow-glow">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Findings Table</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Columns include issue title, severity, category, location, confidence, fix availability, and status.
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      <th className="pb-4 font-medium">Issue Title</th>
                      <th className="pb-4 font-medium">Severity</th>
                      <th className="pb-4 font-medium">Category</th>
                      <th className="pb-4 font-medium">Location</th>
                      <th className="pb-4 font-medium">Confidence</th>
                      <th className="pb-4 font-medium">Fix Available</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 font-medium text-right">Expand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFindings.map((finding) => {
                      const expanded = expandedId === finding.id;
                      return (
                        <Fragment key={finding.id}>
                          <tr className="border-b border-stone-100 bg-white/60">
                            <td className="py-4 pr-4">
                              <div>
                                <Link href={`/dashboard/issues/${finding.id}`} className="font-medium text-slate-900 hover:text-orange-600">
                                  {finding.title}
                                </Link>
                                <p className="mt-1 text-sm text-slate-500">{finding.framework}</p>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <Badge className={cn("border capitalize", severityTone[finding.severity] || severityTone.info)}>
                                {finding.severity}
                              </Badge>
                            </td>
                            <td className="py-4 pr-4 text-sm text-slate-700">{finding.category}</td>
                            <td className="py-4 pr-4 text-sm text-slate-700">{finding.filePath || finding.url || "runtime observation"}</td>
                            <td className="py-4 pr-4">
                              <Badge variant="outline" className="rounded-full capitalize">
                                {finding.confidence}
                              </Badge>
                            </td>
                            <td className="py-4 pr-4">
                              <Badge className={finding.fixAvailable ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-700"}>
                                {finding.fixAvailable ? "Yes" : "No"}
                              </Badge>
                            </td>
                            <td className="py-4 pr-4">
                              <Badge className={finding.status === "fixed" || finding.status === "resolved" ? "bg-sky-100 text-sky-700" : "bg-orange-100 text-orange-700"}>
                                {finding.status || "open"}
                              </Badge>
                            </td>
                            <td className="py-4 text-right">
                              <button
                                className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 text-sm text-slate-600 hover:bg-stone-50"
                                onClick={() => setExpandedId(expanded ? null : finding.id)}
                              >
                                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                Details
                              </button>
                            </td>
                          </tr>
                          {expanded ? (
                            <tr className="border-b border-stone-100 bg-stone-50/80">
                              <td colSpan={8} className="px-4 py-5">
                                <div className="grid gap-4 lg:grid-cols-2">
                                  <div className="rounded-2xl bg-white p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Description</p>
                                    <p className="mt-3 text-sm leading-7 text-slate-700">{finding.description}</p>
                                  </div>
                                  <div className="rounded-2xl bg-white p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Metadata</p>
                                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                                      <p>CWE: {(finding.cweIds || []).join(", ") || "N/A"}</p>
                                      <p>OWASP: {(finding.owaspTags || []).join(", ") || "N/A"}</p>
                                      <p>False positive: {finding.falsePositive ? "Marked / suspected" : "No"}</p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  );
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
