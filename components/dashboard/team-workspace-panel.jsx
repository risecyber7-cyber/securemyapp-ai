import { Globe2, Shield, UsersRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TeamWorkspacePanel({ workspace, sites, scans }) {
  return (
    <Card className="panel-surface border-white/60 shadow-glow">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Team & Workspace</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Workspace membership, monitored assets, and run activity in one place.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <UsersRound className="h-4 w-4 text-orange-500" />
            Team members
          </div>
          <div className="space-y-3">
            {workspace.members.map((member) => (
              <div key={member.email} className="flex items-center justify-between rounded-2xl bg-white/80 p-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Globe2 className="h-4 w-4 text-emerald-600" />
            Monitored assets
          </div>
          <div className="space-y-2">
            {sites.map((site) => (
              <div key={site.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <p className="font-medium">{site.baseUrl}</p>
                <p className="text-sm text-muted-foreground">Verification: {site.verificationState}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.6rem] bg-slate-900 p-4 text-white">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Shield className="h-4 w-4 text-orange-300" />
            Workspace summary
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-semibold">{workspace.plan}</p>
              <p className="text-sm text-slate-400">Plan tier</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{scans.length}</p>
              <p className="text-sm text-slate-400">Recorded scans</p>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
