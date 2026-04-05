"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { LoaderCircle, Radar, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ScanSubmissionCard({ workspace, sites, onCreateScan }) {
  const [repoPath, setRepoPath] = useState("C:\\projects\\demo-app");
  const [baseUrl, setBaseUrl] = useState(sites[0]?.baseUrl || "https://example.com");
  const [type, setType] = useState("full");
  const [frameworkHints, setFrameworkHints] = useState("nextjs");
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="panel-surface border-white/60 shadow-glow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
            <Radar className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="font-display text-2xl">Scan Submission</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Trigger a repo, website, or full scan for {workspace.name}.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scan-type">Scan type</Label>
          <Select id="scan-type" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="full">Full scan</option>
            <option value="repo">Repo scan</option>
            <option value="website">Website scan</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="repo-path">Repository path</Label>
          <Input id="repo-path" value={repoPath} onChange={(event) => setRepoPath(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-url">Target website</Label>
          <Input id="target-url" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="framework-hints">Framework hints</Label>
          <Textarea
            id="framework-hints"
            value={frameworkHints}
            onChange={(event) => setFrameworkHints(event.target.value)}
            className="min-h-[88px]"
          />
        </div>

        <Button
          className="h-12 w-full rounded-2xl"
          onClick={() =>
            startTransition(() => {
              onCreateScan({
                workspaceId: workspace.id,
                type,
                repoPath,
                baseUrl,
                frameworkHints: frameworkHints
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean),
              });
            })
          }
        >
          {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Launch scan
        </Button>
        <Link href="/dashboard/scans/new" className="block">
          <Button variant="outline" className="h-12 w-full rounded-2xl">
            Open guided scan wizard
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
