"use client";

import { motion } from "framer-motion";
import { FolderKanban, Radar, ShieldAlert, Sparkles, Wrench } from "lucide-react";
import { FixViewer } from "@/components/dashboard/fix-viewer";
import { IssueList } from "@/components/dashboard/issue-list";
import { ProjectOverviewPanel } from "@/components/dashboard/project-overview-panel";
import { RecentActivityTable } from "@/components/dashboard/recent-activity-table";
import { ReportDownloads } from "@/components/dashboard/report-downloads";
import { ScanSubmissionCard } from "@/components/dashboard/scan-submission-card";
import { StatsStrip } from "@/components/dashboard/stats-strip";
import { TeamWorkspacePanel } from "@/components/dashboard/team-workspace-panel";
import { VulnerabilityTrendGraph } from "@/components/dashboard/vulnerability-trend-graph";
import { WorkspaceHero } from "@/components/dashboard/workspace-hero";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { HeaderBar } from "@/components/layout/header-bar";
import { useDashboardData } from "@/lib/use-dashboard-data";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function DashboardShell() {
  const {
    workspace,
    projects,
    sites,
    scans,
    findings,
    recentActivity,
    trendData,
    selectedFinding,
    selectedRemediation,
    reports,
    loading,
    setSelectedFindingId,
    createScan,
    createReport,
  } = useDashboardData();

  const highSeverityIssues = findings.filter((finding) => ["critical", "high"].includes(finding.severity)).length;
  const fixedIssues = findings.filter((finding) => finding.status === "fixed").length;
  const remediationCoverage = findings.length
    ? `${Math.round(((fixedIssues + (selectedRemediation ? 1 : 0)) / findings.length) * 100)}%`
    : "0%";

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1700px] gap-6 px-4 py-4 lg:px-6">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 space-y-6">
          <HeaderBar workspace={workspace} />
          <WorkspaceHero workspace={workspace} scans={scans} />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <StatsStrip
              cards={[
                {
                  title: "Total Projects",
                  value: projects.length,
                  icon: FolderKanban,
                  tone: "primary",
                },
                {
                  title: "Total Scans",
                  value: scans.length,
                  icon: Radar,
                  tone: "accent",
                },
                {
                  title: "High Severity Issues",
                  value: highSeverityIssues,
                  icon: ShieldAlert,
                  tone: "secondary",
                },
                {
                  title: "Fixed Issues",
                  value: fixedIssues,
                  icon: Wrench,
                  tone: "muted",
                },
                {
                  title: "Remediation Coverage",
                  value: remediationCoverage,
                  icon: Sparkles,
                  tone: "primary",
                },
              ]}
            />
          </motion.div>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="space-y-6"
            >
              <VulnerabilityTrendGraph trendData={trendData} />
              <RecentActivityTable recentActivity={recentActivity} />
              <ProjectOverviewPanel projects={projects} scans={scans} findings={findings} />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="space-y-6"
            >
              <ScanSubmissionCard workspace={workspace} sites={sites} onCreateScan={createScan} />
              <ReportDownloads reports={reports} onGenerateReport={createReport} />
              <TeamWorkspacePanel workspace={workspace} sites={sites} scans={scans} />
            </motion.div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="space-y-6"
            >
              <IssueList
                findings={findings}
                selectedFindingId={selectedFinding?.id}
                onSelectFinding={setSelectedFindingId}
                loading={loading}
              />
              <FixViewer finding={selectedFinding} remediation={selectedRemediation} />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.45, delay: 0.25 }}
              className="space-y-6"
            >
              <div className="rounded-[1.8rem] border border-dashed border-stone-300 bg-stone-50 p-6">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Home snapshot</p>
                <p className="mt-3 text-lg leading-8 text-slate-700">
                  This dashboard home gives the team a quick view of all projects, recent scans, issue trends, and
                  remediation progress before diving into the detailed issue queue.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latest remediation</p>
                    <p className="mt-2 font-medium text-slate-900">{selectedRemediation?.title || "Awaiting selection"}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reports available</p>
                    <p className="mt-2 font-medium text-slate-900">{reports.length} generated outputs</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </main>
      </div>
    </div>
  );
}
