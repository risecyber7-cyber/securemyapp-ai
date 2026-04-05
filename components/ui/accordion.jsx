"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({ items, className }) {
  const [openItem, setOpenItem] = useState(items?.[0]?.id || null);

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        const open = openItem === item.id;
        return (
          <div key={item.id} className="rounded-[1.4rem] border border-input bg-card">
            <button
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              onClick={() => setOpenItem(open ? null : item.id)}
              type="button"
            >
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                {item.subtitle ? <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p> : null}
              </div>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
            </button>
            {open ? <div className="border-t border-input px-5 py-4 text-sm leading-7 text-muted-foreground">{item.content}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
