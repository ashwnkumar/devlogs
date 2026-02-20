// app/maintenance/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Construction, Clock, Mail } from "lucide-react";

export const metadata = {
  title: "Maintenance - DevLog",
  description:
    "We're currently performing scheduled maintenance. We'll be back soon.",
  robots: "noindex, nofollow",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-xl backdrop-blur-sm bg-white/70 dark:bg-slate-900/70">
          <CardContent className="p-8 md:p-10 text-center space-y-8">
            {/* Icon + Heading */}
            <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
              <Construction className="h-10 w-10 text-amber-600 dark:text-amber-500" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Under Maintenance
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                DevLog is temporarily down while we improve things behind the
                scenes.
              </p>
            </div>

            {/* Status message */}
            <div className="py-6 px-8 bg-slate-100/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-3 text-slate-700 dark:text-slate-300">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                <p className="font-medium">
                  We expect to be back in a few hours.
                </p>
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Thank you for your patience — we're working hard to make DevLog
                even better.
              </p>
            </div>

            {/* Contact & Actions */}
            <div className="space-y-6 pt-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Need urgent help or want to report something?
                </p>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <a href="mailto:code.by.ashwin@gmail.com?subject=DevLog%20Maintenance%20Question">
                    <Mail className="h-4 w-4" />
                    Contact us
                  </a>
                </Button>
              </div>

              <div className="text-xs text-slate-400 dark:text-slate-500">
                <p>
                  DevLog — Conscious developer journaling & productivity
                  insights
                </p>
                <p className="mt-1">© {new Date().getFullYear()} Ashwin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
