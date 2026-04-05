import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-2xl border border-input bg-white/80 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
