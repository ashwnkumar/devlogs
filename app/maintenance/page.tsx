// app/maintenance/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Construction, Clock, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Maintenance – DevLog",
  description: "DevLog is temporarily offline for maintenance. Back soon.",
  robots: "noindex, nofollow",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md sm:max-w-lg">
        <Card className="border border-border bg-card shadow-xl backdrop-blur-sm">
          <CardContent className="p-8 sm:p-10 text-center space-y-8">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Construction className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Under Maintenance
              </h1>
              <p className="text-lg text-muted-foreground">
                DevLog is currently down for scheduled improvements.
              </p>
            </div>

            {/* Status box */}
            <div className="py-6 px-6 sm:px-8 bg-muted/40 rounded-xl border border-border">
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="font-medium">Expected back in a few hours</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground/90">
                We're making DevLog faster, more reliable, and even more useful
                for conscious developers.
              </p>
            </div>

            {/* Contact section */}
            <div className="space-y-6 pt-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Urgent question or feedback during downtime?
                </p>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <a
                    href="mailto:code.by.ashwin@gmail.com?subject=DevLog%20Maintenance%20-%20Question"
                    className="inline-flex items-center"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Ashwin
                  </a>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground/70 space-y-1">
                <p>DevLog — Conscious developer work logging & insight</p>
                <p>© {new Date().getFullYear()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          <Link href="/" prefetch={false}>
            ← Return to DevLog (when we're back)
          </Link>
        </p>
      </div>
    </div>
  );
}
