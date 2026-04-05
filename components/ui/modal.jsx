"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Modal({ open, onClose, title, description, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-2xl rounded-[1.75rem] border border-input bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-input px-6 py-5">
          <div>
            <h2 className="font-display text-2xl text-foreground">{title}</h2>
            {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
