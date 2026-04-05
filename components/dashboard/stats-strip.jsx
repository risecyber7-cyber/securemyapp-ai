import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const tones = {
  primary: "bg-orange-50 text-orange-600",
  accent: "bg-emerald-50 text-emerald-600",
  secondary: "bg-slate-100 text-slate-700",
  muted: "bg-stone-100 text-stone-700",
};

export function StatsStrip({ cards }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="panel-surface border-white/60 shadow-glow">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
              </div>
              <div className={cn("rounded-2xl p-3", tones[card.tone])}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
