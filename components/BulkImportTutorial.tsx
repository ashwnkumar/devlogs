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
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

interface BulkImportTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkImportTutorial({
  open,
  onOpenChange,
}: BulkImportTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Step 1: Select Company & Upload Excel",
      description: (
        <>
          <p className="mb-4">
            Start by selecting the company whose data you want to import.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Choose your company from the dropdown</li>
            <li>Upload your Excel file (.xlsx format)</li>
            <li>
              The file should contain columns for project name, task type, date,
              start time, end time, and description
            </li>
            <li>Click "Next" to extract and preview the data</li>
          </ul>
        </>
      ),
      url: "/bulk-import/bulk-import-1.jpeg",
      alt: "Bulk import step 1: Upload Excel file",
    },
    {
      title: "Step 2: Preview & Edit Data",
      description: (
        <>
          <p className="mb-4">
            Review the extracted data and make any necessary edits.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>View all extracted work logs in a table format</li>
            <li>Edit individual cells by clicking on them</li>
            <li>
              Use bulk edit to replace project names or task types across
              multiple rows
            </li>
            <li>Delete rows that you don't want to import</li>
            <li>Validation errors will be highlighted in red</li>
            <li>Reset changes if needed to restore original data</li>
          </ul>
        </>
      ),
      url: "/bulk-import/bulk-import-2.jpeg",
      alt: "Bulk import step 2: Preview and edit data",
    },
    {
      title: "Step 3: Import to Database",
      description: (
        <>
          <p className="mb-4">
            Once you're satisfied with the data, import it to your database.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Review the final data one last time</li>
            <li>Click "Import Data" to add all logs to your database</li>
            <li>
              New projects and task types will be created automatically if they
              don't exist
            </li>
            <li>You'll see a confirmation once the import is complete</li>
            <li>All imported logs will be visible in your "All Logs" page</li>
          </ul>
        </>
      ),
      url: "/bulk-import/bulk-import-3.jpeg",
      alt: "Bulk import step 3: Import to database",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(0);
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
            <div className="min-h-20">{steps[currentStep].description}</div>

            {steps[currentStep].url && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={steps[currentStep].url}
                  alt={
                    steps[currentStep].alt || "Bulk import tutorial screenshot"
                  }
                  fill
                  className="object-cover"
                  priority={currentStep === 0}
                  sizes="(max-width: 640px) 100vw, 560px"
                />
              </div>
            )}
          </div>
        </DialogDescription>

        <DialogFooter className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Close
          </Button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}

            <Button onClick={handleNext} className="min-w-30">
              {isLastStep ? "Got it!" : "Continue"}
              {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
