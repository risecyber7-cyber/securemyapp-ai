import { Github, Globe, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OAuthPlaceholder() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-200" />
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">OAuth Ready</p>
        <div className="h-px flex-1 bg-stone-200" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="outline" className="h-11 rounded-2xl justify-start px-4">
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
        <Button type="button" variant="outline" className="h-11 rounded-2xl justify-start px-4">
          <Globe className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
      </div>
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-xs leading-5 text-muted-foreground">
        <LockKeyhole className="mb-2 h-4 w-4 text-slate-500" />
        OAuth buttons are placeholder-ready for provider wiring in the next auth integration layer.
      </div>
    </div>
  );
}
