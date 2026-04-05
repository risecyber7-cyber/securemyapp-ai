import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const toneMap = {
  queued: "bg-orange-100 text-orange-700",
  running: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
  resolved: "bg-emerald-100 text-emerald-700",
  review: "bg-amber-100 text-amber-700",
  ready: "bg-sky-100 text-sky-700",
};

export function RecentActivityTable({ recentActivity }) {
  return (
    <Card className="panel-surface border-white/60 shadow-glow">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Recent Activity</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">The latest scan events and remediation progress across projects.</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-stone-200 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Activity</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity) => (
                <tr key={activity.id} className="border-b border-stone-100">
                  <td className="py-4 font-medium capitalize text-slate-800">{activity.type}</td>
                  <td className="py-4 text-slate-600">{activity.title}</td>
                  <td className="py-4">
                    <Badge className={toneMap[activity.status] || "bg-stone-100 text-stone-700"}>{activity.status}</Badge>
                  </td>
                  <td className="py-4 text-slate-500">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : "Just now"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
