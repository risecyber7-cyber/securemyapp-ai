"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className, children }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  return (
    <TabsContext.Provider
      value={{
        value: currentValue,
        setValue: onValueChange ?? setInternalValue,
      }}
    >
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }) {
  return <div className={cn("inline-flex rounded-2xl bg-stone-100 p-1", className)} {...props} />;
}

export function TabsTrigger({ value, className, children, ...props }) {
  const context = useContext(TabsContext);
  const active = context.value === value;

  return (
    <button
      className={cn(
        "rounded-[1rem] px-4 py-2 text-sm font-medium transition",
        active ? "bg-white text-slate-900 shadow-sm" : "text-muted-foreground hover:text-slate-900",
        className,
      )}
      onClick={() => context.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, ...props }) {
  const context = useContext(TabsContext);
  if (context.value !== value) {
    return null;
  }

  return <div className={cn(className)} {...props} />;
}
