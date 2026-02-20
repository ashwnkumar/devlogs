"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownComponent } from "@/components/form/DropdownComponent";
import InputComponent from "@/components/form/InputComponent";
import { TaskTypeType } from "@/types/user";
import { ExtractedWorkLog } from "@/app/actions/bulk-import";
import { toast } from "sonner";

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uniqueProjects: string[];
  uniqueTaskTypes: string[];
  systemTaskTypes: TaskTypeType[];
  extractedData: ExtractedWorkLog[];
  onReplaceProject: (oldName: string, newName: string) => void;
  onReplaceTaskType: (oldType: string, newType: string) => void;
}

type TabType = "projects" | "taskTypes";

export function BulkEditDialog({
  open,
  onOpenChange,
  uniqueProjects,
  uniqueTaskTypes,
  systemTaskTypes,
  extractedData,
  onReplaceProject,
  onReplaceTaskType,
}: BulkEditDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>("projects");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [replacementProject, setReplacementProject] = useState<string>("");
  const [selectedTaskType, setSelectedTaskType] = useState<string>("");
  const [replacementTaskType, setReplacementTaskType] = useState<string>("");

  // Calculate affected row counts
  const projectAffectedCount = useMemo(() => {
    if (!selectedProject) return 0;
    return extractedData.filter((row) => row.projectName === selectedProject)
      .length;
  }, [selectedProject, extractedData]);

  const taskTypeAffectedCount = useMemo(() => {
    if (!selectedTaskType) return 0;
    return extractedData.filter((row) => row.taskType === selectedTaskType)
      .length;
  }, [selectedTaskType, extractedData]);

  // Convert unique values to dropdown options
  const projectOptions = useMemo(
    () => uniqueProjects.map((p) => ({ label: p, value: p })),
    [uniqueProjects],
  );

  const taskTypeOptions = useMemo(
    () => uniqueTaskTypes.map((t) => ({ label: t, value: t })),
    [uniqueTaskTypes],
  );

  const systemTaskTypeOptions = useMemo(
    () =>
      systemTaskTypes.map((t) => ({
        label: t.name,
        value: t.name,
        color: t.color,
      })),
    [systemTaskTypes],
  );

  const handleApplyProjectReplacement = () => {
    if (!selectedProject || !replacementProject.trim()) {
      toast.error("Please select a project and enter a replacement name");
      return;
    }

    onReplaceProject(selectedProject, replacementProject.trim());
    toast.success(`Updated ${projectAffectedCount} rows`);

    // Reset selections
    setSelectedProject("");
    setReplacementProject("");
  };

  const handleApplyTaskTypeReplacement = () => {
    if (!selectedTaskType || !replacementTaskType) {
      toast.error("Please select both task types");
      return;
    }

    onReplaceTaskType(selectedTaskType, replacementTaskType);
    toast.success(`Updated ${taskTypeAffectedCount} rows`);

    // Reset selections
    setSelectedTaskType("");
    setReplacementTaskType("");
  };

  const handleClose = () => {
    // Reset all state when closing
    setActiveTab("projects");
    setSelectedProject("");
    setReplacementProject("");
    setSelectedTaskType("");
    setReplacementTaskType("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl"
        aria-describedby="bulk-edit-description"
      >
        <DialogHeader>
          <DialogTitle>Bulk Edit</DialogTitle>
          <DialogDescription id="bulk-edit-description">
            Find and replace project names or task types across all rows
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div
          className="flex gap-2 border-b"
          role="tablist"
          aria-label="Bulk edit options"
        >
          <Button
            variant={activeTab === "projects" ? "default" : "ghost"}
            onClick={() => setActiveTab("projects")}
            className="rounded-b-none"
            role="tab"
            aria-selected={activeTab === "projects"}
            aria-controls="projects-panel"
            id="projects-tab"
          >
            Project Names
          </Button>
          <Button
            variant={activeTab === "taskTypes" ? "default" : "ghost"}
            onClick={() => setActiveTab("taskTypes")}
            className="rounded-b-none"
            role="tab"
            aria-selected={activeTab === "taskTypes"}
            aria-controls="taskTypes-panel"
            id="taskTypes-tab"
          >
            Task Types
          </Button>
        </div>

        {/* Tab Content */}
        <div className="py-4 space-y-4">
          {activeTab === "projects" && (
            <div
              className="space-y-4"
              role="tabpanel"
              id="projects-panel"
              aria-labelledby="projects-tab"
            >
              <DropdownComponent
                label="Select Project to Replace"
                options={projectOptions}
                value={selectedProject}
                onValueChange={(value) => {
                  setSelectedProject(value);
                  setReplacementProject("");
                }}
                placeholder="Choose a project..."
              />

              <InputComponent
                label="New Project Name"
                value={replacementProject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setReplacementProject(e.target.value)
                }
                placeholder="Enter new project name"
                disabled={!selectedProject}
              />

              {selectedProject && (
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  This will affect{" "}
                  <span className="font-semibold text-foreground">
                    {projectAffectedCount}
                  </span>{" "}
                  {projectAffectedCount === 1 ? "row" : "rows"}
                </p>
              )}
            </div>
          )}

          {activeTab === "taskTypes" && (
            <div
              className="space-y-4"
              role="tabpanel"
              id="taskTypes-panel"
              aria-labelledby="taskTypes-tab"
            >
              <DropdownComponent
                label="Select Type to Replace"
                options={taskTypeOptions}
                value={selectedTaskType}
                onValueChange={(value) => {
                  setSelectedTaskType(value);
                  setReplacementTaskType("");
                }}
                placeholder="Choose a task type..."
              />

              <div className="space-y-2">
                <DropdownComponent
                  label="Replacement Type"
                  options={systemTaskTypeOptions}
                  value={replacementTaskType}
                  onValueChange={setReplacementTaskType}
                  placeholder="Choose from system task types..."
                />
                {replacementTaskType && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Color:</span>
                    <div
                      className="w-6 h-6 rounded border"
                      style={{
                        backgroundColor:
                          systemTaskTypes.find(
                            (t) => t.name === replacementTaskType,
                          )?.color || "#000",
                      }}
                    />
                  </div>
                )}
              </div>

              {selectedTaskType && (
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  This will affect{" "}
                  <span className="font-semibold text-foreground">
                    {taskTypeAffectedCount}
                  </span>{" "}
                  {taskTypeAffectedCount === 1 ? "row" : "rows"}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {activeTab === "projects" ? (
            <Button
              onClick={handleApplyProjectReplacement}
              disabled={!selectedProject || !replacementProject.trim()}
              aria-label="Apply project name replacement"
            >
              Apply Project Replacement
            </Button>
          ) : (
            <Button
              onClick={handleApplyTaskTypeReplacement}
              disabled={!selectedTaskType || !replacementTaskType}
              aria-label="Apply task type replacement"
            >
              Apply Type Replacement
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
