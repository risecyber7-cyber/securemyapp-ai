"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileCode2, FileSearch, FileText, FolderKanban, Home, Radar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", icon: Home, href: "/dashboard", match: "/dashboard" },
  { label: "Projects", icon: FolderKanban, href: "/dashboard/projects", match: "/dashboard/projects" },
  { label: "Scans", icon: Radar, href: "/dashboard/scans/new", match: "/dashboard/scans" },
  { label: "Issues", icon: FileSearch, href: "/dashboard/issues", match: "/dashboard/issues" },
  { label: "Fix Center", icon: FileCode2, href: "/dashboard/fixes", match: "/dashboard/fixes" },
  { label: "Reports", icon: FileText, href: "/dashboard/reports", match: "/dashboard/reports" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings", match: "/dashboard/settings" },
];

export function DashboardSidebar({ mobile = false }) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "h-full w-full shrink-0 rounded-[2rem] border border-white/10 bg-sidebar/95 p-5 text-[hsl(var(--sidebar-foreground))] shadow-glow",
      mobile ? "flex min-h-full flex-col" : "sticky top-4 hidden h-[calc(100vh-2rem)] w-[284px] xl:flex xl:flex-col",
    )}>
      <div className="mb-8 space-y-4">
        <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/70">
          SecureMyApp AI
        </div>
        <div>
          <h2 className="font-display text-3xl leading-tight">Security workspace</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">Connected scans, findings, fixes, and reporting in one SaaS shell.</p>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.match !== "/dashboard" && pathname?.startsWith(item.match));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-2xl px-4 py-3 transition",
                active ? "bg-white text-slate-950" : "text-white/65 hover:bg-white/8 hover:text-white",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              {active ? <span className="h-2 w-2 rounded-full bg-emerald-500" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-white/70">Live mode</p>
        <p className="mt-2 text-xl font-semibold">Your workspace is wired for scans, remediation, and exports.</p>
      </div>
    </aside>
  );
}
