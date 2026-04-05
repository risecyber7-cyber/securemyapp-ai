"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, MoonStar, Search, SunMedium } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { logout } from "@/lib/api";
import { useUiStore } from "@/lib/store/ui-store";

const crumbs = {
  "/dashboard": ["Dashboard"],
  "/dashboard/projects": ["Projects"],
  "/dashboard/scans/new": ["Scans", "New Scan"],
  "/dashboard/issues": ["Issues"],
  "/dashboard/fixes": ["Fix Center"],
  "/dashboard/reports": ["Reports"],
  "/dashboard/settings": ["Settings"],
};

export function HeaderBar({ workspace }) {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const trail = crumbs[pathname] || ["Workspace"];
  const owner = workspace?.owner || { name: "Workspace Owner", email: "owner@securemyapp.ai" };

  return (
    <>
      <header className="space-y-4 rounded-[1.8rem] border border-white/60 bg-card/70 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {trail.map((item, index) => (
                <span key={`${item}-${index}`} className="flex items-center gap-2">
                  {index > 0 ? <span className="text-slate-400">/</span> : null}
                  <span>{item}</span>
                </span>
              ))}
            </div>
            <h1 className="font-display text-3xl">Welcome back, {owner.name}</h1>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => setMenuOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="w-full pl-11" placeholder="Search issues, projects, reports, or fixes..." />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="icon" className="rounded-full" onClick={toggleTheme}>
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </Button>
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-input bg-card/80">
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 rounded-full border border-input bg-card/80 px-3 py-2">
              <Avatar>
                <AvatarFallback>{owner.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{owner.name}</p>
                <p className="text-muted-foreground">{owner.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Navigation" side="left">
        <DashboardSidebar mobile />
        <div className="mt-6 space-y-3">
          <Link href="/dashboard" className="block text-sm text-slate-600" onClick={() => setMenuOpen(false)}>
            Back to dashboard
          </Link>
        </div>
      </Sheet>
    </>
  );
}
