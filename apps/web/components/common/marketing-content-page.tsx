import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Section = {
  title: string;
  body: string;
};

export function MarketingContentPage({
  eyebrow,
  title,
  description,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: Section[];
}) {
  return (
    <div className="min-h-screen px-4 py-8 lg:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <Card className="panel-surface border-white/60">
          <CardContent className="p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl tracking-tight text-foreground">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">{description}</p>
            <div className="mt-6">
              <Link href="/signup">
                <Button className="rounded-2xl">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title} className="panel-surface border-white/60">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl text-foreground">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
