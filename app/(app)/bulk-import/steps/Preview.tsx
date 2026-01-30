"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { DropdownComponent } from "@/components/form/DropdownComponent";
import TableComponent from "@/components/TableComponent";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import InputComponent from "@/components/form/InputComponent";
import { Textarea } from "@/components/ui/textarea";
import { ExtractedWorkLog } from "@/app/actions/bulk-import";
import { TaskTypeType } from "@/types/user";
import { TimePickerInput } from "@/components/form/TimePickerInput";
import { TableColumn } from "@/types/table";
import { ArrowRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type Props = {
  data: ExtractedWorkLog[];
  company_id?: string;
  projects: { label: string; value: string }[];
  taskTypes: { label: string; value: string }[];
  systemTaskTypes?: TaskTypeType[];
  validationErrors?: Map<number, string>;
  hasUnsavedChanges?: boolean;
  onRowUpdate?: (
    rowIndex: number,
    updatedRow: Partial<ExtractedWorkLog>,
  ) => void;
  onBulkReplaceProject?: (oldName: string, newName: string) => void;
  onBulkReplaceTaskType?: (oldType: string, newType: string) => void;
  onResetChanges?: () => void;
  onDeleteRow?: (rowIndex: number) => void;
};

function Preview({
  data,
  company_id,
  projects,
  taskTypes,
  systemTaskTypes = [],
  validationErrors = new Map(),
  hasUnsavedChanges = false,
  onRowUpdate,
  onBulkReplaceProject,
  onBulkReplaceTaskType,
  onResetChanges,
  onDeleteRow,
}: Props) {
  const router = useRouter();
  const [tableData, setTableData] = useState<ExtractedWorkLog[]>([]);
  const [showEmpty, setShowEmpty] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTaskType, setSelectedTaskType] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);

  // Bulk edit inline state
  const [bulkEditProjectName, setBulkEditProjectName] = useState<string>("");
  const [bulkEditTaskType, setBulkEditTaskType] = useState<string>("");

  useEffect(() => {
    if (!data) return;
    setTableData(data);
  }, [data]);

  const handleDeleteRow = useCallback(
    (row: ExtractedWorkLog & { id: string | number }) => {
      // Find the index in the original extractedData array
      const rowIndex = data.findIndex((r) => r.rowNumber === row.rowNumber);
      if (rowIndex !== -1 && onDeleteRow) {
        onDeleteRow(rowIndex);
        // Toast is handled in parent component
      }
    },
    [data, onDeleteRow],
  );

  const handleClearFilters = useCallback(() => {
    setSelectedProject("");
    setSelectedTaskType("");
    setShowEmpty(false);
    setBulkEditProjectName("");
    setBulkEditTaskType("");
    toast.info("Filters cleared");
  }, []);

  const filteredData = useMemo(() => {
    let filtered = tableData;

    // Filter by project
    if (selectedProject) {
      filtered = filtered.filter((row) => row.projectName === selectedProject);
    }

    // Filter by task type
    if (selectedTaskType) {
      filtered = filtered.filter((row) => row.taskType === selectedTaskType);
    }

    // Filter by empty rows
    if (showEmpty) {
      filtered = filtered.filter((row) =>
        Object.values(row).some(
          (value) => value === "" || value === null || value === undefined,
        ),
      );
    }

    return filtered;
  }, [tableData, showEmpty, selectedProject, selectedTaskType]);

  // Handle bulk edit project name
  const handleApplyBulkEditProject = useCallback(() => {
    if (!selectedProject || !bulkEditProjectName.trim()) {
      toast.error("Please enter a new project name");
      return;
    }

    if (onBulkReplaceProject) {
      onBulkReplaceProject(selectedProject, bulkEditProjectName.trim());
      // Toast is handled in parent component
      setBulkEditProjectName("");
      setSelectedProject("");
    }
  }, [selectedProject, bulkEditProjectName, onBulkReplaceProject]);

  // Handle bulk edit task type
  const handleApplyBulkEditTaskType = useCallback(() => {
    if (!selectedTaskType || !bulkEditTaskType) {
      toast.error("Please select a replacement task type");
      return;
    }

    if (onBulkReplaceTaskType) {
      onBulkReplaceTaskType(selectedTaskType, bulkEditTaskType);
      // Toast is handled in parent component
      setBulkEditTaskType("");
      setSelectedTaskType("");
    }
  }, [selectedTaskType, bulkEditTaskType, onBulkReplaceTaskType]);

  // Handle import to API
  const handleImport = useCallback(async () => {
    // Validate company_id is present
    if (!company_id) {
      toast.error("Company ID is required for import");
      return;
    }

    // Validate there's data to import
    if (!data || data.length === 0) {
      toast.error("No data to import");
      return;
    }

    // Check for validation errors
    if (validationErrors.size > 0) {
      toast.error(
        `Cannot import: ${validationErrors.size} validation error${validationErrors.size > 1 ? "s" : ""} found`,
      );
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading("Importing tasks...");

    try {
      // Call the bulk import API
      const response = await fetch("/api/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: data,
          company_id: company_id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (result.validationErrors && result.validationErrors.length > 0) {
          const errorMessages = result.validationErrors
            .slice(0, 3)
            .map(
              (err: any) =>
                `Row ${err.rowNumber}: ${err.field} - ${err.message}`,
            )
            .join("\n");

          const moreErrors =
            result.validationErrors.length > 3
              ? `\n...and ${result.validationErrors.length - 3} more errors`
              : "";

          toast.error(`Validation failed:\n${errorMessages}${moreErrors}`, {
            id: toastId,
            duration: 6000,
          });
        } else {
          // Handle other errors
          toast.error(result.error || "Import failed", { id: toastId });
        }
        return;
      }

      // Success! Show summary and redirect
      const { data: importData, message } = result;
      toast.success(
        `${message}\n• Projects created: ${importData.projectsCreated}\n• Projects reused: ${importData.projectsReused}\n• Task types created: ${importData.taskTypesCreated}`,
        {
          id: toastId,
          duration: 5000,
        },
      );

      // Redirect to projects page after a short delay
      setTimeout(() => {
        router.push("/projects");
      }, 1500);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to import tasks",
        { id: toastId },
      );
    } finally {
      setIsImporting(false);
    }
  }, [data, company_id, validationErrors, router]);

  const columns: TableColumn<ExtractedWorkLog & { id: string | number }>[] = [
    {
      label: "Date",
      key: "date",
      width: "160px",
      render: (row: ExtractedWorkLog, rowIdx?: number) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-36 justify-start font-normal"
              aria-label={`Date for row ${(rowIdx ?? 0) + 1}`}
            >
              {row.date
                ? format(new Date(row.date), "dd-MM-yyyy")
                : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={row.date ? new Date(row.date) : undefined}
              onSelect={(date) => {
                if (onRowUpdate && rowIdx !== undefined && date) {
                  onRowUpdate(rowIdx, { date });
                }
              }}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      ),
    },
    {
      label: "Project",
      key: "projectName",
      width: "220px",
      render: (row: ExtractedWorkLog, rowIdx?: number) => (
        <InputComponent
          className="w-52"
          value={row.projectName || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (onRowUpdate && rowIdx !== undefined) {
              onRowUpdate(rowIdx, { projectName: e.target.value });
            }
          }}
          aria-label={`Project name for row ${(rowIdx ?? 0) + 1}`}
        />
      ),
    },
    {
      label: "Task Type",
      key: "taskType",
      width: "180px",
      render: (row: ExtractedWorkLog, rowIdx?: number) => (
        <DropdownComponent
          options={systemTaskTypes.map((t) => ({
            label: t.name,
            value: t.name,
          }))}
          value={row.taskType || ""}
          onValueChange={(value) => {
            if (onRowUpdate && rowIdx !== undefined) {
              onRowUpdate(rowIdx, { taskType: value });
            }
          }}
          placeholder={row.taskType || "Select task type"}
          aria-label={`Task type for row ${(rowIdx ?? 0) + 1}`}
        />
      ),
    },
    {
      label: "Description",
      key: "task",
      width: "300px",
      render: (row: ExtractedWorkLog, rowIdx?: number) => (
        <Textarea
          value={row.task || ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (onRowUpdate && rowIdx !== undefined) {
              onRowUpdate(rowIdx, { task: e.target.value });
            }
          }}
          aria-label={`Description for row ${(rowIdx ?? 0) + 1}`}
        />
      ),
    },
    {
      label: "Start Time",
      key: "startTime",
      width: "180px",
      render: (row: ExtractedWorkLog, rowIdx?: number) => (
        <TimePickerInput
          value={row.startTime}
          onChange={(newTime) => {
            if (onRowUpdate && rowIdx !== undefined) {
              onRowUpdate(rowIdx, { startTime: newTime });
            }
          }}
          error={
            rowIdx !== undefined ? validationErrors.get(rowIdx) : undefined
          }
        />
      ),
    },
    {
      label: "End Time",
      key: "endTime",
      width: "180px",
      render: (row: ExtractedWorkLog, rowIdx?: number) => (
        <TimePickerInput
          value={row.endTime}
          onChange={(newTime) => {
            if (onRowUpdate && rowIdx !== undefined) {
              onRowUpdate(rowIdx, { endTime: newTime });
            }
          }}
          error={
            rowIdx !== undefined ? validationErrors.get(rowIdx) : undefined
          }
        />
      ),
    },
  ];

  // Add id field to data for TableComponent compatibility
  const tableDataWithIds = useMemo(() => {
    return filteredData.map((row, idx) => ({
      ...row,
      id: row.rowNumber || idx,
    }));
  }, [filteredData]);

  return (
    <div className="w-full h-full flex flex-col items-center gap-4">
      {/* Import Button Section */}
      <div className="w-full flex justify-end">
        <Button
          onClick={handleImport}
          disabled={
            isImporting ||
            validationErrors.size > 0 ||
            !data ||
            data.length === 0
          }
          className="flex items-center gap-2"
          size="lg"
        >
          <Upload className="h-4 w-4" />
          {isImporting ? "Importing..." : "Import Tasks"}
        </Button>
      </div>

      <div className="flex flex-col items-start gap-2 w-full border rounded p-4">
        <div className="flex items-center justify-between w-full">
          <p className="font-semibold">Filters:</p>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && onResetChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetChanges}
                aria-label="Reset all changes to original data"
              >
                Reset All Changes
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
              aria-label="Clear all filters"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DropdownComponent
            options={projects}
            label="Projects"
            value={selectedProject}
            onValueChange={setSelectedProject}
            placeholder="All Projects"
          />
          <DropdownComponent
            options={taskTypes}
            label="Task Types"
            value={selectedTaskType}
            onValueChange={setSelectedTaskType}
            placeholder="All Task Types"
          />

          <div className="flex flex-col items-start gap-3">
            <p className="text-sm font-medium">Empty Rows:</p>
            <div className="flex items-center gap-2">
              <Switch
                id="empty"
                checked={showEmpty}
                onCheckedChange={setShowEmpty}
              />
              <Label htmlFor="empty">Show only empty rows</Label>
            </div>
          </div>
        </div>

        {/* Inline Bulk Edit Section */}
        {(selectedProject || selectedTaskType) && (
          <div className="w-full mt-4 pt-4 border-t">
            <p className="text-sm font-semibold mb-3 text-muted-foreground">
              Bulk Edit Active Filters
            </p>

            <div className="space-y-3">
              {/* Project Bulk Edit */}
              {selectedProject && (
                <div className="flex flex-col gap-2 p-3 bg-accent/50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Project:</span>
                      <span className="text-sm px-2 py-0.5 bg-background rounded border">
                        {selectedProject}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({filteredData.length}{" "}
                        {filteredData.length === 1 ? "row" : "rows"})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <InputComponent
                      placeholder="Enter new project name"
                      value={bulkEditProjectName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setBulkEditProjectName(e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleApplyBulkEditProject}
                      disabled={!bulkEditProjectName.trim()}
                    >
                      Rename {filteredData.length}{" "}
                      {filteredData.length === 1 ? "row" : "rows"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Task Type Bulk Edit */}
              {selectedTaskType && (
                <div className="flex flex-col gap-2 p-3 bg-accent/50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Task Type:</span>
                      <span className="text-sm px-2 py-0.5 bg-background rounded border">
                        {selectedTaskType}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({filteredData.length}{" "}
                        {filteredData.length === 1 ? "row" : "rows"})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <DropdownComponent
                      options={systemTaskTypes.map((t) => ({
                        label: t.name,
                        value: t.name,
                      }))}
                      placeholder="Select replacement task type"
                      value={bulkEditTaskType}
                      onValueChange={setBulkEditTaskType}
                      className="flex-1"
                    />
                    {bulkEditTaskType && (
                      <div
                        className="w-6 h-6 rounded border"
                        style={{
                          backgroundColor:
                            systemTaskTypes.find(
                              (t) => t.name === bulkEditTaskType,
                            )?.color || "#000",
                        }}
                        title={`Color for ${bulkEditTaskType}`}
                      />
                    )}
                    <Button
                      size="sm"
                      onClick={handleApplyBulkEditTaskType}
                      disabled={!bulkEditTaskType}
                    >
                      Update {filteredData.length}{" "}
                      {filteredData.length === 1 ? "row" : "rows"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <TableComponent
        data={tableDataWithIds}
        columns={columns}
        disableClick
        hideEdit
        onEdit={() => {}}
        onDelete={handleDeleteRow}
      />
    </div>
  );
}

export default Preview;
