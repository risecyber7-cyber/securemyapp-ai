import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary/12 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  outline: "border border-input text-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
};

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
