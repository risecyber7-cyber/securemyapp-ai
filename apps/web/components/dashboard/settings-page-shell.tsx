"use client";

import { BellRing, Shield, SwatchBook, Users } from "lucide-react";
import { DashboardFrame } from "@/apps/web/components/layout/dashboard-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    icon: Users,
    title: "Workspace and team",
    body: "Manage members, RBAC, and ownership settings for projects and issues.",
  },
  {
    icon: Shield,
    title: "Scan defaults",
    body: "Configure quick, standard, and deep-safe defaults plus target validation preferences.",
  },
  {
    icon: BellRing,
    title: "Notifications",
    body: "Email verification, scan completed alerts, and future weekly summaries will plug in here.",
  },
  {
    icon: SwatchBook,
    title: "Branding and reports",
    body: "Control client-ready branding, export preferences, and stakeholder summary behavior.",
  },
];

export function SettingsPageShell() {
  return (
    <DashboardFrame>
      <Card className="panel-surface border-white/60">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Settings</CardTitle>
          <p className="text-sm text-muted-foreground">Workspace controls, notification preferences, branding, and scan policy settings.</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-[1.5rem] border border-input bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.body}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </DashboardFrame>
  );
}
