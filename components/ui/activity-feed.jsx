import { Badge } from "@/components/ui/badge";

export function ActivityFeed({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-[1.3rem] border border-input bg-card px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">{item.action}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.project} · {item.actor}</p>
            </div>
            <Badge variant="outline" className="capitalize">{item.status}</Badge>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.timestamp}</p>
        </div>
      ))}
    </div>
  );
}
