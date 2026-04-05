import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-2xl border border-input bg-white/80 px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
