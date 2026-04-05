import { cn } from "@/lib/utils";

export function Timeline({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id || `${item.title}-${index}`} className="flex gap-4">
          <div className="flex w-6 flex-col items-center">
            <div className={cn("h-3 w-3 rounded-full", item.tone || "bg-primary")} />
            {index < items.length - 1 ? <div className="mt-1 h-full w-px bg-border" /> : null}
          </div>
          <div className="flex-1 rounded-[1.25rem] border border-input bg-card px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-foreground">{item.title}</p>
              {item.meta ? <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.meta}</span> : null}
            </div>
            {item.description ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
