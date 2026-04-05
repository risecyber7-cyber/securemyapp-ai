import { Inbox } from "lucide-react";

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-input bg-muted/35 px-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-muted-foreground">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-2xl text-foreground">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
