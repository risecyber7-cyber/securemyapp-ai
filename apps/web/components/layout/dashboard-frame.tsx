"use client";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { HeaderBar } from "@/components/layout/header-bar";
import { useDashboardData } from "@/lib/use-dashboard-data";

export function DashboardFrame({ children }: { children: React.ReactNode }) {
  const { workspace } = useDashboardData();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1700px] gap-6 px-4 py-4 lg:px-6">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 space-y-6">
          <HeaderBar workspace={workspace} />
          {children}
        </main>
      </div>
    </div>
  );
}
