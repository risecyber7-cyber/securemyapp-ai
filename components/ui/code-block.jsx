import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CodeBlock({ code, language = "txt", title = "Code sample", onCopy }) {
  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-input">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3 text-slate-200">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{language}</p>
        </div>
        <Button variant="ghost" className="text-slate-200 hover:bg-white/10 hover:text-white" onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
      <pre className="code-surface overflow-x-auto px-4 py-4 font-mono text-sm leading-7">{code}</pre>
    </div>
  );
}
