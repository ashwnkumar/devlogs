// app/not-found.tsx
import { Button } from "@/components/ui/button";
import { ArrowLeft, Terminal } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col">
      {/* Main 404 content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Visual + glitchy effect container */}
          <div className="relative inline-block">
            <div className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-[var(--color-muted)]/30 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Terminal className="h-24 w-24 md:h-32 md:w-32 text-[var(--color-primary)]/80 animate-pulse" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Page not found
          </h1>

          <p className="text-xl text-[var(--color-muted-foreground)] max-w-lg mx-auto">
            Looks like this route got lost in a merge conflict or never made it
            past code review.
            <br className="hidden sm:block" />
            No worries — let&apos;s get you back to logging real progress.
          </p>

          {/* CTA */}
          <div className="pt-6">
            <Button
              size="lg"
              className={`
                h-12 px-8 text-base font-medium
                bg-[var(--color-primary)] text-[var(--color-primary-foreground)]
                hover:bg-[var(--color-primary)]/90
                shadow-lg shadow-[var(--color-primary)]/10
              `}
              asChild
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
