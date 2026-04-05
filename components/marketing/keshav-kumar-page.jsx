import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const skills = [
  "Ethical Hacking",
  "Kali Linux",
  "Penetration Testing",
  "Bug Bounty",
  "Web Application Security",
  "OSINT",
  "Security Research",
];

export function KeshavKumarPage() {
  return (
    <div className="relative overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.60),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-16 h-80 bg-[radial-gradient(circle,rgba(59,130,246,0.35),transparent_55%)] blur-3xl" />

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pt-20 md:px-8 lg:pt-24">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Mission />
        <Cta />
      </main>
    </div>
  );
}

function SectionHeading({ label, title, description }) {
  return (
    <div className="space-y-3">
      <Badge variant="outline" className="rounded-full border-slate-500/40 text-slate-300">
        {label}
      </Badge>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
      {description && <p className="max-w-3xl text-base leading-7 text-slate-200">{description}</p>}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative rounded-[2.2rem] border border-white/10 bg-slate-950/80 p-10 shadow-glow backdrop-blur">
      <div className="space-y-6">
        <Badge className="rounded-full bg-emerald-500/10 text-emerald-200">Cybersecurity Researcher</Badge>
        <div className="space-y-4">
          <h1 className="font-display text-5xl font-semibold text-white md:text-6xl">Keshav Kumar</h1>
          <p className="text-lg leading-7 text-slate-200">
            Ethical Hacker, Cybersecurity Researcher, and Founder building bold defenses at{" "}
            <span className="text-emerald-300">devhkehv.monster</span>. I shepherd Kali Linux-led research,
            bug bounty programs, and web security labs that keep high-risk digital ecosystems resilient.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="rounded-full bg-emerald-500/90 px-6 text-base font-semibold text-slate-950 hover:bg-emerald-400/90">
            Resume focus
          </Button>
          <Link
            href="#mission"
            className="px-6 py-3 text-base font-semibold text-emerald-200 underline decoration-dashed decoration-emerald-400/60"
          >
            Learn the mission
          </Link>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/70 to-slate-900/40 p-8 shadow-[0_20px_80px_rgba(14,23,34,0.55)] lg:grid-cols-2">
      <div>
        <SectionHeading
          label="About"
          title="Cybersecurity practice rooted in research + action"
          description="Keshav Kumar partners with devhkehv.monster to document, test, and harden the most demanding modern stacks."
        />
      </div>
      <p className="text-base leading-7 text-slate-200">
        I lead ethical hacking engagements, Kali Linux explorations, and layered bug bounty programs that force enterprise
        attack surfaces to keep leveling up. That practical cybersecurity learning keeps every audit and red team run
        grounded in real code, real apps, and real-world web security incident response. From penetration testing
        playbooks to OSINT-driven research, every output ties back to the mission at{" "}
        <span className="font-semibold text-white">devhkehv.monster</span>, where the platform surfaces workflows,
        insights, and tooling across the whole stack.
      </p>
    </section>
  );
}

function Skills() {
  return (
    <section className="space-y-6">
      <SectionHeading
        label="Skills"
        title="Precision skills for modern defenders"
        description="These domains form the core of my work—from infrastructure hunting to web security research."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <Card key={skill} className="border border-white/10 bg-slate-950/70">
            <CardHeader className="px-5 py-4">
              <CardTitle className="text-lg text-white">{skill}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-slate-300">
              <p>
                Applied expertise across Kali Linux labs, bug bounty reports, and web application security engagements
                that anchor every idea at <span className="font-semibold text-white">devhkehv.monster</span>.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section className="space-y-6">
      <SectionHeading
        label="Projects / Platform"
        title="devhkehv.monster as the home base"
        description="The platform showcases applied threat models, tooling, and learning programs curated by Keshav."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-emerald-400/50 bg-slate-950/70">
          <CardHeader className="px-6 py-5">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Platform</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">devhkehv.monster</h3>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-slate-200">
            <p>
              A cybersecurity-focused platform and learning portfolio where practical security workflows, Kali Linux
              labs, and bug bounty stories converge. Every chapter, write-up, and toolset is tuned for rapid adoption by
              defenders who want clarity, not jargon.
            </p>
            <p className="mt-4 text-emerald-200">Real-time research updates · Tool-driven automation · Proof-of-concept demos</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 bg-slate-900/70">
          <CardHeader className="px-6 py-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Research Workflows</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Security research & toolchain</h3>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-slate-200">
            <p>
              I design Kali Linux scripts, walkthroughs, and capture-the-flag experiments, then post reproducible
              write-ups back to devhkehv.monster. The result is a living portfolio of both offensive and defensive
              thinking, with focus on web security, OSINT, and ethical hacker community contributions.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section
      id="mission"
      className="grid gap-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-glow lg:grid-cols-[1.3fr_0.7fr]"
    >
      <div className="space-y-4">
        <SectionHeading
          label="Personal Brand"
          title="Building a practical cybersecurity voice"
          description="The identity balances research with real-world, tactical delivery."
        />
        <p className="text-base leading-7 text-slate-200">
          Keshav Kumar builds devhkehv.monster to help curious operators cut through theory and get to reproducible web
          security practices. The mission: highlight the craft of ethical hacking, the discipline of Kali Linux
          experimentation, and the discipline required to run effective bug bounty pipelines while mentoring the next
          generation of cybersecurity researchers.
        </p>
      </div>
      <div className="rounded-[1.6rem] border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-slate-900 p-6 text-slate-100">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Why it matters</p>
        <p className="mt-4 text-lg leading-7">
          Practitioners need both the pulse of current threats and a trusted home base for tooling — devhkehv.monster is
          that home for everything Keshav crafts.
        </p>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="rounded-[2rem] border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950/30 p-8 text-center shadow-[0_25px_60px_rgba(4,5,14,0.65)]">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Connect</p>
      <h2 className="mt-4 font-display text-4xl font-semibold text-white">Schedule time or keep exploring the work</h2>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full border border-emerald-500/30 px-6 py-3 text-base font-semibold text-emerald-200 transition hover:bg-emerald-500/10"
        >
          Visit Homepage
        </Link>
        <a
          href="https://devhkehv.monster"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-emerald-500/90 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-400/90"
        >
          Explore Platform
        </a>
        <a
          href="mailto:risecyber7@gmail.com"
          className="rounded-full border border-emerald-400/60 bg-transparent px-6 py-3 text-base font-semibold text-emerald-200 transition hover:bg-emerald-500/10"
        >
          Contact / Connect
        </a>
      </div>
    </section>
  );
}
