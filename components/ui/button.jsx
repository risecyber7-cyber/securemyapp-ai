import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary text-primary-foreground shadow-sm hover:opacity-95",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  outline: "border border-input bg-card hover:bg-muted/70",
  ghost: "hover:bg-muted/80",
  danger: "bg-destructive text-destructive-foreground hover:opacity-95",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-xl px-3",
  lg: "h-11 rounded-2xl px-8",
  icon: "h-10 w-10",
};

export function Button({ className, variant = "default", size = "default", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
