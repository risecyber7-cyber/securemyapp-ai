"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sheet({ open, onClose, title, children, side = "right" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50">
      <div
        className={cn(
          "absolute top-0 h-full w-full max-w-lg border-input bg-card shadow-2xl",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
        )}
      >
        <div className="flex items-center justify-between border-b border-input px-6 py-5">
          <h2 className="font-display text-2xl text-foreground">{title}</h2>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-[calc(100%-77px)] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
