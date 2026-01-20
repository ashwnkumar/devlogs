// app/page.tsx
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "DevLogs - Developer Work Logging & Productivity Tracking Platform",
  description:
    "DevLogs is a modern work logging and journaling platform built for software engineers. Track daily tasks, time spent, and productivity evolution across projects with intuitive dashboards and analytics. Start logging free today.",
  openGraph: {
    title: "DevLogs - Track What Actually Matters. Understand How You Grow.",
    description:
      "Log daily work with intention, classify tasks, track time meaningfully, and uncover long-term productivity patterns through beautiful dashboards.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevLogs - Track What Actually Matters. Understand How You Grow.",
    description:
      "Log daily work with intention, classify tasks, track time meaningfully, and uncover long-term productivity patterns.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="w-full flex h-16 items-center justify-around">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="bg-linear-to-br from-primary to-primary/70 text-white flex items-center p-1 rounded">
              <Code2 />
            </div>
            <span>DevLogs</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground hover:bg-muted"
            >
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <Link href="/register">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        <div className="container relative z-10 mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Track what actually matters.
              <br />
              <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Understand how you grow.
              </span>
            </h1>

            <p className="mt-6 text-xl text-muted-foreground md:text-2xl max-w-3xl mx-auto">
              DevLog helps engineers log daily work with intention — classify
              tasks, track time meaningfully, and uncover long-term productivity
              patterns through beautiful dashboards and timelines.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link href="/register">
                  Start Logging Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {/* <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-border text-foreground hover:bg-muted"
                asChild
              >
                <Link href="/login">Log in with GitHub</Link>
              </Button> */}
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required • Free forever for personal use
            </p>
          </div>
        </div>

        {/* Hero mockup / visual */}
        <div className="mt-16 md:mt-20 container max-w-6xl mx-auto px-6">
          <div className="relative rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="p-4 md:p-8">
              {/* Placeholder for dashboard mockup image */}
              <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground text-lg font-medium">
                {/* In real app: <Image src="/dashboard-mockup.png" alt="DevLog Dashboard" fill className="object-cover" /> */}
                {/* Clean analytics dashboard preview (dark mode friendly) */}
                <Image
                  src="/home.jpeg"
                  alt="DevLog Dashboard"
                  fill
                  className=""
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Features Grid */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Built for developers who want clarity
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Structured Daily Logging
              </h3>
              <p className="text-muted-foreground">
                Log tasks across projects, classify them (logic, UI, research,
                debugging, meetings…), and add realistic time spent — all in
                seconds.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Meaningful Analytics
              </h3>
              <p className="text-muted-foreground">
                See where your focus goes over weeks/months. Spot patterns in
                deep work, context switching, and long-term growth through
                timelines and clean charts.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Developer-First Experience
              </h3>
              <p className="text-muted-foreground">
                Fast, keyboard-friendly UI. Built with Next.js, Supabase,
                Tailwind + shadcn/ui — feels like home for engineers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-linear-to-br from-primary/5 to-background text-center">
        <div className="container px-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Start building better habits today
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Join developers who use DevLog to stay intentional and see real
            progress in their craft.
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              className="h-14 px-10 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <Link href="/signup">Create Your Free Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer (minimal) */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} DevLog. Built for developers, by
            developers.
          </p>
        </div>
      </footer>
    </div>
  );
}
