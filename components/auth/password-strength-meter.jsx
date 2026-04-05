"use client";

import { cn } from "@/lib/utils";

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
  if (score === 2) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
  if (score === 3) return { label: "Good", color: "bg-sky-500", width: "w-3/4" };
  return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
}

export function PasswordStrengthMeter({ password }) {
  const strength = getStrength(password || "");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="uppercase tracking-[0.2em] text-muted-foreground">Password strength</span>
        <span className="font-medium text-slate-700">{password ? strength.label : "Add a password"}</span>
      </div>
      <div className="h-2 rounded-full bg-stone-200">
        <div className={cn("h-2 rounded-full transition-all", strength.color, strength.width)} />
      </div>
    </div>
  );
}
