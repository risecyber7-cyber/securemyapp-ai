"use client";

import { Bot, ScanSearch, Settings, ShieldCheck, UserRound } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { HeaderBar } from "@/components/layout/header-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useDashboardData } from "@/lib/use-dashboard-data";

export function SettingsPageShell() {
  const { workspace, settings } = useDashboardData();

  if (!settings) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex max-w-[1700px] gap-6 px-4 py-4 lg:px-6">
          <DashboardSidebar />
          <main className="min-w-0 flex-1 space-y-6">
            <HeaderBar workspace={workspace} />
            <EmptyState title="Settings unavailable" description="This workspace does not expose settings for the current role yet." />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1700px] gap-6 px-4 py-4 lg:px-6">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 space-y-6">
          <HeaderBar workspace={workspace} />

          <Card className="panel-surface border-white/60 shadow-glow">
            <CardContent className="flex items-center gap-3 p-8">
              <Settings className="h-5 w-5 text-orange-500" />
              <div>
                <h1 className="font-display text-4xl tracking-tight text-slate-950">Settings</h1>
                <p className="mt-2 max-w-3xl text-base leading-8 text-slate-600">
                  Workspace profile, scan defaults, notification preferences, and AI configuration surface in one place.
                </p>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-6 xl:grid-cols-2">
            <SettingsCard icon={UserRound} title="Profile">
              <SettingRow label="Full name" value={settings.profile?.fullName || workspace.owner.name} />
              <SettingRow label="Email" value={settings.profile?.email || workspace.owner.email} />
              <SettingRow label="Role" value={settings.profile?.role || "owner"} />
            </SettingsCard>

            <SettingsCard icon={ShieldCheck} title="Notifications">
              <SettingRow label="Email verification" value={String(settings.notifications?.emailVerification)} />
              <SettingRow label="Scan complete" value={String(settings.notifications?.scanComplete)} />
              <SettingRow label="Weekly summary" value={settings.notifications?.weeklySummary?.headline || "Enabled"} />
            </SettingsCard>

            <SettingsCard icon={ScanSearch} title="Scan defaults">
              <SettingRow label="Modes" value={(settings.scans?.modes || []).join(", ")} />
              <SettingRow label="Safe scan only" value={String(settings.scans?.safeScanOnly)} />
            </SettingsCard>

            <SettingsCard icon={Bot} title="AI configuration">
              <SettingRow label="Provider" value={settings.ai?.provider || "openrouter"} />
              <SettingRow label="Server-side only" value={String(settings.ai?.serverSideOnly)} />
              <SettingRow label="Report formats" value={(settings.reporting?.formats || []).join(", ")} />
            </SettingsCard>
          </section>
        </main>
      </div>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, children }) {
  return (
    <Card className="panel-surface border-white/60 shadow-glow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-orange-500" />
          <CardTitle className="font-display text-2xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function SettingRow({ label, value }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-800">{value}</p>
    </div>
  );
}
