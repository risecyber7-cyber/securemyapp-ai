"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronRight, Sparkle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const severityTone = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
  info: "bg-sky-100 text-sky-700 border-sky-200",
};

export function IssueList({ findings, selectedFindingId, onSelectFinding, loading }) {
  return (
    <Card className="panel-surface border-white/60 shadow-glow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-display text-2xl">Issue List</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Prioritized findings with framework context and AI remediation state.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]">
          {loading ? "Syncing" : `${findings.length} active`}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence initial={false}>
          {findings.map((finding) => (
            <motion.button
              key={finding.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              onClick={() => onSelectFinding(finding.id)}
              className={cn(
                "w-full rounded-[1.4rem] border p-4 text-left transition",
                selectedFindingId === finding.id
                  ? "border-orange-300 bg-orange-50/80 shadow-sm"
                  : "border-stone-200 bg-white/80 hover:border-orange-200 hover:bg-orange-50/40",
              )}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn("border", severityTone[finding.severity] || severityTone.info)}>
                      {finding.severity}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full">
                      {finding.framework}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {finding.source}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{finding.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{finding.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{finding.filePath || finding.url || "runtime observation"}</span>
                    <span>{finding.category}</span>
                    <span>{finding.cweIds?.join(", ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-900 px-3 py-2 text-left text-white">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      <Sparkle className="h-3.5 w-3.5" />
                      Confidence
                    </div>
                    <div className="mt-1 text-sm font-medium capitalize">{finding.confidence}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {findings.length === 0 && (
          <div className="rounded-[1.4rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-stone-500" />
            <p className="mt-3 text-sm text-muted-foreground">No findings yet. Launch a scan to populate this queue.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
