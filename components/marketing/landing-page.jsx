"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Bug,
  ChevronDown,
  Code2,
  FileText,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Detect",
    description: "Scan websites and codebases for security headers, auth issues, risky configs, and validation gaps.",
    icon: ScanSearch,
  },
  {
    title: "Explain",
    description: "Get framework-aware issue explanations your team can act on without wasting time in vague reports.",
    icon: Bot,
  },
  {
    title: "Fix",
    description: "Review exact patches, secure config examples, and copy-paste snippets before shipping the remediation.",
    icon: Wrench,
  },
];

const frameworks = ["Next.js", "React", "Node.js", "Express", "NestJS", "FastAPI"];

const faqs = [
  {
    question: "Is SecureMyApp AI just another scanner?",
    answer:
      "No. The product is designed as detection plus remediation. Findings come with context, fix guidance, and developer-ready examples.",
  },
  {
    question: "Does it support framework-specific fixes?",
    answer:
      "Yes. The platform is being shaped around framework-aware patterns so fixes feel native to the stack instead of generic advice.",
  },
  {
    question: "Can agencies use it for client reporting?",
    answer:
      "Yes. The reporting model supports both developer-focused output and stakeholder or client-ready summaries.",
  },
];

const screenshots = [
  {
    title: "Issue Queue",
    body: "Severity-ranked findings with confidence, file paths, OWASP/CWE tags, and framework metadata.",
    icon: Bug,
  },
  {
    title: "Fix Viewer",
    body: "Before/after code, patch diff previews, secure config examples, and validation checklists.",
    icon: Code2,
  },
  {
    title: "Reports",
    body: "Developer reports for action and polished summaries for clients, leadership, or security reviews.",
    icon: FileText,
  },
];

export function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.06),transparent_30%)]" />
      <MarketingNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <DetectFixSection />
        <FrameworkSection />
        <ScreenshotsSection />
        <PricingSection />
        <FaqSection />
      </main>
    </div>
  );
}

function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-[#fff8ef]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          SecureMyApp AI
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <a href="#product">Product</a>
          <a href="#frameworks">Frameworks</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <Link href="/keshav-kumar" className="text-sm font-semibold text-slate-900 underline decoration-dashed decoration-orange-400/60">
            Keshav Kumar
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" className="rounded-full px-4">
              Live demo
            </Button>
          </Link>
          <Button className="rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800">Start free scan</Button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 lg:px-6 lg:pb-24 lg:pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal duration={0.5} className="space-y-8">
          <div className="space-y-4">
            <Badge className="rounded-full bg-slate-950 px-4 py-1 text-white hover:bg-slate-950">
              Security detection + remediation assistant
            </Badge>
            <h1 className="font-display text-5xl leading-none tracking-tight text-slate-950 md:text-7xl">
              Find the issue.
              <span className="block text-orange-600">Ship the exact fix.</span>
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              SecureMyApp AI analyzes your website and codebase, surfaces actionable security issues, and generates
              framework-aware fixes your developers can actually use.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="h-14 rounded-full bg-orange-500 px-7 text-base text-white hover:bg-orange-400">
              Start free scan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="h-14 rounded-full px-7 text-base">
                View product UI
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Web + Codebase analysis", ShieldCheck],
              ["Framework-based remediation", Sparkles],
              ["Client-ready reporting", FileText],
            ].map(([label, Icon]) => (
              <div key={label} className="rounded-[1.6rem] border border-stone-200 bg-white/70 p-4 shadow-sm">
                <Icon className="h-5 w-5 text-orange-500" />
                <p className="mt-3 text-sm font-medium text-slate-700">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal duration={0.6} delay={0.1} className="space-y-5">
          <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-2xl">Sample Fix Demo</CardTitle>
                <Badge className="bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15">91 confidence</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="rounded-[1.4rem] bg-[#111827] p-4 font-mono text-sm text-slate-200">
                <p className="text-red-300">- const secret = "hardcoded";</p>
                <p className="text-emerald-300">+ const secret = process.env.APP_SECRET;</p>
                <p className="mt-3 text-slate-400">+ if (!secret) {"{"}</p>
                <p className="pl-4 text-slate-400">throw new Error("APP_SECRET is required");</p>
                <p className="text-slate-400">{"}"}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.4rem] bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Issue</p>
                  <p className="mt-2 text-sm text-slate-200">Hardcoded credential detected in `src/config/auth.ts`.</p>
                </div>
                <div className="rounded-[1.4rem] bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fix</p>
                  <p className="mt-2 text-sm text-slate-200">
                    Move secrets to env-backed storage and fail closed if configuration is missing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-[1.8rem] border border-stone-200 bg-white/80 p-5">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Why teams switch</p>
            <p className="mt-3 text-lg font-medium leading-8 text-slate-700">
              Most tools stop at "here's the vulnerability." SecureMyApp AI keeps going until the team can understand,
              verify, and apply the fix.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-12">
      <StaggerContainer className="grid gap-4 lg:grid-cols-3">
        {[
          "Security tools overwhelm developers with noise and generic advice.",
          "Agencies and consultants need outputs that are usable by both engineers and clients.",
          "Teams lose momentum when the gap between issue detection and code remediation stays manual.",
        ].map((statement) => (
          <StaggerItem key={statement} className="rounded-[1.8rem] border border-stone-200 bg-white/80 p-6 shadow-sm">
            <p className="text-lg leading-8 text-slate-700">{statement}</p>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}

function DetectFixSection() {
  return (
    <section id="product" className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
      <Reveal className="mb-10 max-w-2xl">
        <Badge variant="outline" className="rounded-full border-orange-200 bg-orange-50 px-4 py-1 text-orange-700">
          Detect + Fix
        </Badge>
        <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950 md:text-5xl">
          From issue discovery to verified remediation.
        </h2>
      </Reveal>
      <StaggerContainer className="grid gap-5 md:grid-cols-3">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <StaggerItem key={section.title}>
              <Card className="panel-surface h-full border-white/60 shadow-glow">
                <CardContent className="p-6">
                  <div className="inline-flex rounded-2xl bg-slate-950 p-3 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold">{section.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{section.description}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <StaggerContainer preset="staggerFast" className="mt-10 grid gap-5 lg:grid-cols-4">
        {[
          ["Scan website or repo", ScanSearch],
          ["Normalize findings", LockKeyhole],
          ["Generate framework fix", Sparkles],
          ["Export report", FileText],
        ].map(([label, Icon]) => (
          <StaggerItem key={label} className="rounded-[1.8rem] border border-dashed border-stone-300 bg-stone-50 p-5">
            <Icon className="h-5 w-5 text-orange-500" />
            <p className="mt-4 text-base font-medium text-slate-800">{label}</p>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}

function FrameworkSection() {
  return (
    <section id="frameworks" className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <Reveal className="rounded-[2rem] bg-slate-950 px-6 py-10 text-white lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Framework Support</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">
              Fixes should match the stack your team already ships.
            </h2>
          </div>
          <div className="max-w-xl text-slate-300">
            SecureMyApp AI is built to explain findings and propose remediations in the language of your framework,
            not as one-size-fits-all checklists.
          </div>
        </div>
        <StaggerContainer preset="staggerSoft" className="mt-8 flex flex-wrap gap-3">
          {frameworks.map((framework) => (
            <StaggerItem key={framework} preset="fadeIn" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
              {framework}
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Reveal>
    </section>
  );
}

function ScreenshotsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <Reveal className="mb-8 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Screenshots</p>
        <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950">Designed for both engineers and stakeholders.</h2>
      </Reveal>
      <StaggerContainer preset="staggerSoft" className="grid gap-5 lg:grid-cols-3">
        {screenshots.map((shot) => {
          const Icon = shot.icon;
          return (
            <StaggerItem key={shot.title}>
              <Card className="panel-surface h-full overflow-hidden border-white/60 shadow-glow">
                <CardContent className="p-0">
                  <div className="flex h-56 items-center justify-center bg-[linear-gradient(135deg,#111827,#1f2937)]">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-white/10 text-white">
                      <Icon className="h-9 w-9" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold">{shot.title}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{shot.body}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <Reveal className="rounded-[2rem] border border-stone-200 bg-white/80 p-8 shadow-sm lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Pricing</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950">Simple pricing placeholder for launch planning.</h2>
          </div>
          <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 px-4 py-1 text-emerald-700">
            Launch placeholder
          </Badge>
        </div>
        <StaggerContainer preset="staggerSoft" className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Starter", "$49/mo", "Small teams validating websites and repos."],
            ["Growth", "$199/mo", "Developer teams that need recurring scans and reports."],
            ["Enterprise", "Custom", "White-glove setup, policy controls, and private environments."],
          ].map(([name, price, copy]) => (
            <StaggerItem key={name} className="rounded-[1.6rem] border border-stone-200 bg-stone-50 p-6">
              <p className="text-lg font-semibold">{name}</p>
              <p className="mt-3 font-display text-4xl">{price}</p>
              <p className="mt-4 leading-7 text-slate-600">{copy}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Reveal>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-5xl px-4 py-16 lg:px-6 lg:pb-24">
      <Reveal className="text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">FAQ</p>
        <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950">Questions teams usually ask first.</h2>
      </Reveal>
      <StaggerContainer preset="staggerFast" className="mt-10 space-y-4">
        {faqs.map((faq) => (
          <StaggerItem key={faq.question} as="details" className="group rounded-[1.6rem] border border-stone-200 bg-white/80 p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium text-slate-900">
              {faq.question}
              <ChevronDown className="h-5 w-5 text-slate-500 transition group-open:rotate-180" />
            </summary>
            <p className="mt-4 leading-7 text-slate-600">{faq.answer}</p>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <Reveal preset="scaleIn" className="mt-12 rounded-[1.8rem] bg-slate-950 p-8 text-center text-white">
        <BadgeCheck className="mx-auto h-8 w-8 text-emerald-300" />
        <h3 className="mt-4 font-display text-3xl">Security findings are only useful when the fix is obvious.</h3>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          SecureMyApp AI is built around that principle from the first screen to the final report.
        </p>
        <Button className="mt-6 rounded-full bg-orange-500 px-6 text-white hover:bg-orange-400">Join waitlist</Button>
      </Reveal>
    </section>
  );
}
