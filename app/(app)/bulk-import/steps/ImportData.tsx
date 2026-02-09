"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { ExtractedWorkLog } from "@/app/actions/bulk-import";

interface ImportDataProps {
  data: ExtractedWorkLog[];
  companyId: string;
  onImportComplete: () => void;
  importStatus: "idle" | "loading" | "success" | "error";
  importResult: {
    projectsCreated: number;
    projectsReused: number;
    taskTypesCreated: number;
    tasksCreated: number;
    projects: Array<{ id: string; name: string }>;
  } | null;
  errorMessage: string | null;
  validationErrors: Array<{
    rowNumber: number;
    field: string;
    message: string;
  }> | null;
}

export default function ImportData({
  data,
  companyId,
  onImportComplete,
  importStatus,
  importResult,
  errorMessage,
  validationErrors,
}: ImportDataProps) {
  if (importStatus === "loading") {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Importing your data...</p>
        <p className="text-sm text-muted-foreground">
          This may take a moment. Please don't close this page.
        </p>
      </div>
    );
  }

  if (importStatus === "success" && importResult) {
    return (
      <div className="w-full flex flex-col items-center gap-6">
        <Card className="w-full max-w-2xl p-6">
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-semibold">Import Successful!</h2>
            <p className="text-muted-foreground text-center">
              Your data has been successfully imported into the system.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Tasks Created</span>
              <span className="text-lg font-bold text-primary">
                {importResult.tasksCreated}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Projects Created</span>
              <span className="text-lg font-bold text-green-600">
                {importResult.projectsCreated}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Projects Reused</span>
              <span className="text-lg font-bold text-blue-600">
                {importResult.projectsReused}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Task Types Created</span>
              <span className="text-lg font-bold text-purple-600">
                {importResult.taskTypesCreated}
              </span>
            </div>
          </div>

          {importResult.projects.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Projects Processed:</h3>
              <div className="flex flex-wrap gap-2">
                {importResult.projects.map((project) => (
                  <span
                    key={project.id}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {project.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button onClick={onImportComplete}>Done</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (importStatus === "error") {
    return (
      <div className="w-full flex flex-col items-center gap-6">
        <Card className="w-full max-w-2xl p-6">
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-semibold">Import Failed</h2>
            <p className="text-muted-foreground text-center">{errorMessage}</p>
          </div>

          {validationErrors && validationErrors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Validation Errors ({validationErrors.length})
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {validationErrors.map((error, index) => (
                  <div
                    key={index}
                    className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                  >
                    <p className="text-sm font-medium">
                      Row {error.rowNumber}: {error.field}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {error.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={onImportComplete}>
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Idle state - show summary and confirm button
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-16 w-16 text-primary" />
          <h2 className="text-2xl font-semibold">Ready to Import</h2>
          <p className="text-muted-foreground text-center">
            You're about to import {data.length} task
            {data.length !== 1 ? "s" : ""} into your account.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Total Tasks</span>
            <span className="text-lg font-bold">{data.length}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Company</span>
            <span className="text-sm">{companyId}</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> This action cannot be undone. Make sure your
            data is correct before proceeding.
          </p>
        </div>
      </Card>
    </div>
  );
}
