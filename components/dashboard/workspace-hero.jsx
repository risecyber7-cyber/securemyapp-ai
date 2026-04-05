"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function WorkspaceHero({ workspace, scans }) {
  const lastScan = scans[0];

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden border-0 bg-slate-900 text-white shadow-glow">
        <CardContent className="relative p-8">
          <div className="absolute inset-0 bg-grid-fade bg-[size:28px_28px] opacity-10" />
          <div className="absolute -right-10 top-0 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute left-10 top-16 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className="bg-white/10 text-white hover:bg-white/10">Presentation Layer Live</Badge>
              <div className="space-y-3">
                <h1 className="font-display text-4xl tracking-tight md:text-5xl">
                  {workspace.name} security cockpit built for scan-to-fix flow.
                </h1>
                <p className="max-w-2xl text-base text-slate-300 md:text-lg">
                  Submit scans, review issues, inspect AI-generated remediations, and download client-ready reports
                  from a single workspace surface.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Latest status
                </div>
                <p className="text-xl font-semibold">{lastScan ? lastScan.status : "Waiting for first scan"}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <Workflow className="h-4 w-4 text-orange-300" />
                  Active plan
                </div>
                <p className="text-xl font-semibold capitalize">{workspace.plan}</p>
              </div>
              <Button className="h-12 rounded-2xl bg-orange-500 text-base text-white hover:bg-orange-400">
                Launch full scan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                className="h-12 rounded-2xl border border-white/10 bg-white/5 text-base text-white hover:bg-white/10"
              >
                Review remediation queue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
