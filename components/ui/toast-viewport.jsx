"use client";

import { useEffect } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { useUiStore } from "@/lib/store/ui-store";

const toneMap = {
  success: {
    icon: CircleCheck,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  error: {
    icon: CircleAlert,
    className: "border-red-200 bg-red-50 text-red-800",
  },
  info: {
    icon: Info,
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
};

export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        removeToast(toast.id);
      }, 2400),
    );

    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const tone = toneMap[toast.tone];
        const Icon = tone.icon;
        return (
          <div key={toast.id} className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg ${tone.className}`}>
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.description ? <p className="text-xs opacity-80">{toast.description}</p> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
