"use client";

import { useTransition } from "react";
import { Download, FileOutput, FileStack, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportDownloads({ reports, onGenerateReport }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="panel-surface border-white/60 shadow-glow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-display text-2xl">Report Download</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Developer and stakeholder outputs from the latest scan data.</p>
        </div>
        <Button variant="secondary" className="rounded-2xl" onClick={() => startTransition(() => onGenerateReport({ audience: "stakeholder", format: "json" }))}>
          {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <FileOutput className="mr-2 h-4 w-4" />}
          Generate
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="flex items-center justify-between rounded-[1.4rem] border border-stone-200 bg-white/80 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white"><FileStack className="h-4 w-4" /></div>
              <div>
                <p className="font-medium capitalize">{report.audience} report</p>
                <p className="text-sm text-muted-foreground">{report.summary.headline}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full uppercase">{report.format}</Badge>
              <a href={report.artifactUrl || "#"} target="_blank" rel="noreferrer">
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
