import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCard({ title, subtitle, footer, children }) {
  return (
    <Card className="panel-surface border-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
      <CardHeader className="space-y-4 pb-4 text-center">
        <Link href="/" className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-slate-950 text-white">
          <ShieldCheck className="h-6 w-6" />
        </Link>
        <div className="space-y-2">
          <CardTitle className="font-display text-3xl tracking-tight">{title}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
        {footer ? <div className="border-t border-stone-200 pt-5 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
