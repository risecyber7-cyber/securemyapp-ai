"use client";

import { useState } from "react";
import { Activity, Bell, Code2, Layers3, PanelRightOpen, Search } from "lucide-react";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { EmptyState } from "@/components/ui/empty-state";
import { HeaderBar } from "@/components/layout/header-bar";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { Timeline } from "@/components/ui/timeline";
import { useDashboardData } from "@/lib/use-dashboard-data";

export function DesignSystemShell() {
  const { workspace, recentActivity } = useDashboardData();
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1700px] gap-6 px-4 py-4 lg:px-6">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 space-y-6">
          <HeaderBar workspace={workspace} />

          <Card className="panel-surface border-white/60">
            <CardContent className="dev-grid rounded-[1.75rem] p-8">
              <Badge variant="info" className="rounded-full">Design System</Badge>
              <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground">Professional, readable, code-first UI language</h1>
              <p className="mt-3 max-w-3xl text-base leading-8 text-muted-foreground">
                Slate and zinc surfaces, high-contrast typography, dark and light support, and reusable primitives for security-focused workflows.
              </p>
            </CardContent>
          </Card>

          <section className="grid gap-6 xl:grid-cols-3">
            <Card className="panel-surface border-white/60">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Color Semantics</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Badge variant="info">Info</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">High severity</Badge>
                <Badge variant="success">Resolved</Badge>
                <Badge variant="outline">Neutral</Badge>
              </CardContent>
            </Card>

            <Card className="panel-surface border-white/60">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </CardContent>
            </Card>

            <Card className="panel-surface border-white/60">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Search / Nav</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-input bg-card px-4 py-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Search findings, projects, reports...</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Layers3 className="h-4 w-4" />
                  Dev-tool sidebar + command bar pattern
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="panel-surface border-white/60">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Code Surfaces</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  title="Secure config example"
                  language="env"
                  code={`CSP_REPORT_ONLY=false\nCORS_ALLOWED_ORIGINS=https://app.acme.dev\nSESSION_COOKIE_SECURE=true`}
                />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setModalOpen(true)}>
                    <Bell className="mr-2 h-4 w-4" />
                    Open modal
                  </Button>
                  <Button variant="outline" onClick={() => setSheetOpen(true)}>
                    <PanelRightOpen className="mr-2 h-4 w-4" />
                    Open drawer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="panel-surface border-white/60">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Workflow Blocks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Stepper
                  currentStep={1}
                  steps={[
                    { id: "target", title: "Target Submitted", description: "URL and repo context captured." },
                    { id: "scan", title: "Scan Running", description: "Passive checks and code analysis in progress." },
                    { id: "fix", title: "Fix Review", description: "Developer validates generated remediation." },
                  ]}
                />
                <Timeline
                  items={[
                    { id: "1", title: "Scan queued", meta: "08:30 UTC", description: "Website and repo scan were scheduled.", tone: "bg-info" },
                    { id: "2", title: "Findings normalized", meta: "08:34 UTC", description: "Security headers and validation issues mapped.", tone: "bg-warning" },
                    { id: "3", title: "Fix package ready", meta: "08:37 UTC", description: "AI remediation and diff output are available.", tone: "bg-success" },
                  ]}
                />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="panel-surface border-white/60">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Information Blocks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion
                  items={[
                    {
                      id: "readability",
                      title: "High readability",
                      subtitle: "Dense data without visual fatigue",
                      content: "Typography, spacing, and muted contrast were tuned for long sessions reviewing issues, diffs, and remediation notes.",
                    },
                    {
                      id: "code-focus",
                      title: "Code-focused UI",
                      subtitle: "Interfaces should support engineers first",
                      content: "Panels, badges, timelines, and code blocks are designed to keep technical context visible while remaining stakeholder-presentable.",
                    },
                  ]}
                />
                <EmptyState
                  title="No scans in this environment"
                  description="Empty states stay informative and actionable instead of looking like broken dashboards."
                  action={<Button size="sm">Start a scan</Button>}
                />
              </CardContent>
            </Card>

            <Card className="panel-surface border-white/60">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Loading and Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Skeleton className="h-24 rounded-[1.4rem]" />
                  <Skeleton className="h-24 rounded-[1.4rem]" />
                </div>
                <ActivityFeed items={recentActivity.slice(0, 3)} />
              </CardContent>
            </Card>
          </section>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Modal Preview"
            description="Use for report previews, issue evidence, and approval flows."
          >
            <div className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Modals are meant for focused review tasks where the user should not lose surrounding workspace context.
              </p>
              <Select defaultValue="developer">
                <option value="developer">Developer report</option>
                <option value="stakeholder">Stakeholder summary</option>
              </Select>
            </div>
          </Modal>

          <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Drawer Preview">
            <div className="space-y-4">
              <div className="rounded-[1.3rem] border border-input bg-muted/40 p-4">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-info" />
                  <p className="font-medium text-foreground">Context drawer</p>
                </div>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Drawers work well for filters, quick actions, and activity details without fully interrupting the current workflow.
                </p>
              </div>
              <div className="rounded-[1.3rem] border border-input bg-card p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-success" />
                  <p className="font-medium text-foreground">Reusable pattern</p>
                </div>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  This keeps the design system practical for scans, reports, and issue triage.
                </p>
              </div>
            </div>
          </Sheet>
        </main>
      </div>
    </div>
  );
}
