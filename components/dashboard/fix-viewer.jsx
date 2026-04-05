"use client";

import dynamic from "next/dynamic";
import { CheckCircle2, ClipboardList, FileCode2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MonacoDiffEditor = dynamic(
  () => import("@monaco-editor/react").then((module) => module.DiffEditor),
  {
    ssr: false,
    loading: () => <div className="h-[360px] animate-pulse rounded-3xl bg-stone-100" />,
  },
);

export function FixViewer({ finding, remediation }) {
  if (!finding || !remediation) {
    return (
      <Card className="panel-surface border-white/60 shadow-glow">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Fix Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-10 text-center text-muted-foreground">
            Pick a finding to inspect the generated remediation package.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="panel-surface border-white/60 shadow-glow">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">{remediation.framework}</Badge>
          <Badge variant="outline" className="rounded-full capitalize">
            {remediation.confidenceScore} confidence
          </Badge>
          <Badge variant="secondary" className="rounded-full">
            Human review required
          </Badge>
        </div>
        <div>
          <CardTitle className="font-display text-2xl">Fix Viewer</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">{remediation.explanation}</p>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="diff" className="space-y-4">
          <TabsList>
            <TabsTrigger value="diff">Patch Diff</TabsTrigger>
            <TabsTrigger value="snippet">Snippet</TabsTrigger>
            <TabsTrigger value="checklist">Validation</TabsTrigger>
          </TabsList>
          <TabsContent value="diff" className="space-y-4">
            <div className="rounded-[1.6rem] border border-stone-200 bg-[#0f172a] p-2">
              <MonacoDiffEditor
                height="360px"
                theme="vs-dark"
                original=""
                modified={remediation.patchDiff || "// No patch diff available"}
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
          </TabsContent>
          <TabsContent value="snippet">
            <div className="rounded-[1.6rem] bg-slate-950 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-300">
                <FileCode2 className="h-4 w-4" />
                Copy-ready remediation snippet
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-slate-100">
                {remediation.codeSnippet}
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="checklist">
            <div className="rounded-[1.6rem] border border-stone-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                <ClipboardList className="h-4 w-4" />
                Verification steps
              </div>
              <div className="space-y-3">
                {remediation.validationSteps.map((step) => (
                  <div key={step} className="flex items-start gap-3 rounded-2xl bg-stone-50 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <p className="text-sm text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
