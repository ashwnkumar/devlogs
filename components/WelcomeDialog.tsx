"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeDialog({ open, onOpenChange }: WelcomeDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const { user } = useAuth();

  const steps = [
    {
      title: "Welcome to DevLogs!",
      description: (
        <>
          <p className="mb-4">
            DevLogs is a developer-first work logging and journaling platform
            that helps engineers consciously track what they worked on, how long
            it took, and how their effort evolves over time.
          </p>
          <p className="mb-4">
            Unlike traditional time trackers, DevLogs combines structured daily
            task logging with meaningful analytics — giving you clear insights
            into productivity patterns, focus areas, and long-term growth.
          </p>
          <p>Let’s get you familiar with the core sections.</p>
        </>
      ),
      url: "/onboarding/onboarding-1.jpeg",
      alt: "DevLogs welcome screen overview",
    },
    {
      title: "Dashboard",
      description: (
        <>
          <p className="mb-4">
            Your central hub for insights and quick actions.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Overview of productivity patterns and analytics</li>
            <li>Timelines, summaries and focus area charts</li>
            <li>Quick task logging & recent activity</li>
          </ul>
        </>
      ),
      url: "/onboarding/onboarding-1.jpeg", // ← update to correct dashboard screenshot
      alt: "DevLogs dashboard view",
    },
    {
      title: "All Logs",
      description: (
        <>
          <p className="mb-4">Browse your complete work history.</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Filter and search logs by date, project, task type</li>
            <li>Edit or delete past entries</li>
            <li>Export data for reports or backups</li>
          </ul>
        </>
      ),
      url: "/onboarding/onboarding-2.jpeg",
      alt: "All logs list view",
    },
    {
      title: "Companies",
      description: (
        <>
          <p className="mb-4">Organize work by company or client.</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Add and manage multiple companies</li>
            <li>Associate projects and logs per company</li>
            <li>Company-level time tracking & insights</li>
          </ul>
        </>
      ),
      url: "/onboarding/onboarding-3.jpeg",
      alt: "Companies management screen",
    },
    {
      title: "Projects",
      description: (
        <>
          <p className="mb-4">Group your work into projects.</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Create and organize projects</li>
            <li>Track time and task distribution per project</li>
            <li>Easy context switching between projects</li>
          </ul>
        </>
      ),
      url: "/onboarding/onboarding-4.jpeg",
      alt: "Projects overview",
    },
    {
      title: "Task Types",
      description: (
        <>
          <p className="mb-4">Categorize your work effort.</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Define types (logic, UI, research, etc.)</li>
            <li>Analyze time spent per category</li>
            <li>Customize to match your workflow</li>
          </ul>
        </>
      ),
      url: "/onboarding/onboarding-5.jpeg",
      alt: "Task types configuration",
    },
    {
      title: "Settings",
      description: (
        <>
          <p className="mb-4">Customize your DevLogs experience.</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Profile, preferences & notification settings</li>
            <li>Manage authentication & security</li>
            <li>Export data and access help</li>
          </ul>
        </>
      ),
      url: "/onboarding/onboarding-6.jpeg",
      alt: "Settings panel",
    },
    {
      title: "You're All Set!",
      description: (
        <>
          <p className="mb-6 text-lg font-medium">
            Ready to start logging with intention.
          </p>
          <p>
            Jump to the <strong>Dashboard</strong> to begin — or explore any
            section from the sidebar.
          </p>
        </>
      ),
      // no image on final step
    },
  ];

  const handleComplete = async () => {
    if (!user?.id) {
      onOpenChange(false);
      return;
    }

    setIsCompleting(true);

    const supabase = createClient();

    try {
      const { error } = await supabase.rpc("update_user_metadata", {
        user_id: user.id,
        new_values: { is_onboarded: true },
      });

      if (error) console.error("onboarding rpc failed:", error);
    } catch (err) {
      console.error("onboarding completion error:", err);
    } finally {
      setIsCompleting(false);
      onOpenChange(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="relative pb-4">
          <DialogTitle className="text-xl">
            {steps[currentStep].title}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-6 py-2">
            <div className="min-h-[80px]">{steps[currentStep].description}</div>

            {steps[currentStep].url && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={steps[currentStep].url}
                  alt={steps[currentStep].alt || "DevLogs screenshot"}
                  fill
                  className="object-cover"
                  priority={currentStep <= 2} // load first few eagerly
                  sizes="(max-width: 640px) 100vw, 560px"
                />
              </div>
            )}
          </div>
        </DialogDescription>

        <DialogFooter className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isCompleting}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip tour
          </Button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isCompleting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={isCompleting}
              className="min-w-[120px]"
            >
              {isCompleting
                ? "Saving..."
                : isLastStep
                  ? "Get Started"
                  : "Continue"}
              {!isCompleting && !isLastStep && (
                <ArrowRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
