"use client";
import { useState, useMemo } from "react";
import { ExtractedWorkLog } from "@/app/actions/bulk-import";
import { EditableTable } from "../components/EditableTable";
import { DropdownComponent } from "@/components/form/DropdownComponent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

type PreviewProps = {
  data: ExtractedWorkLog[];
  onUpdate: (updatedRow: ExtractedWorkLog, rowIndex: number) => void;
  onDelete: (rowIndex: number) => void;
  onBulkUpdateProject: (oldName: string, newName: string) => void;
  uniqueProjects: string[];
  uniqueTaskTypes: string[];
  systemTaskTypes: { label: string; value: string }[];
  isLoading?: boolean;
};

// Skeleton Loading Component
function PreviewSkeleton() {
  return (
    <div className="w-full h-full flex flex-col gap-4 px-6 py-3">
      {/* Info Banner Skeleton */}
      <div className="rounded-lg border bg-muted/50 p-3">
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Filters Section Skeleton */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="w-full rounded-lg border bg-card p-4">
        <div className="space-y-3">
          {/* Table Header */}
          <div className="flex gap-4 pb-3 border-b">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {/* Table Rows */}
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 py-2">
              {[...Array(7)].map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-10 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Preview({
  data,
  onUpdate,
  onDelete,
  onBulkUpdateProject,
  uniqueProjects,
  uniqueTaskTypes,
  systemTaskTypes,
  isLoading = false,
}: PreviewProps) {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTaskType, setSelectedTaskType] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [showOnlyEmpty, setShowOnlyEmpty] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filter data based on selected filters and keep track of original indices
  const filteredDataWithIndices = useMemo(() => {
    let filtered = data.map((row, originalIndex) => ({ row, originalIndex }));

    // Filter by search term (searches across all text fields)
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        const { row } = item;
        return (
          row.projectName?.toLowerCase().includes(lowerSearch) ||
          row.taskType?.toLowerCase().includes(lowerSearch) ||
          row.task?.toLowerCase().includes(lowerSearch) ||
          (row.date &&
            new Date(row.date).toLocaleDateString().includes(lowerSearch)) ||
          (row.startTime &&
            new Date(row.startTime)
              .toLocaleTimeString()
              .includes(lowerSearch)) ||
          (row.endTime &&
            new Date(row.endTime).toLocaleTimeString().includes(lowerSearch))
        );
      });
    }

    // Filter by project
    if (selectedProject) {
      filtered = filtered.filter(
        (item) => item.row.projectName === selectedProject,
      );
    }

    // Filter by task type
    if (selectedTaskType) {
      filtered = filtered.filter(
        (item) => item.row.taskType === selectedTaskType,
      );
    }

    // Filter by empty rows (rows with at least one empty field)
    if (showOnlyEmpty) {
      filtered = filtered.filter((item) => {
        const { row } = item;
        return (
          !row.date ||
          !row.projectName ||
          !row.taskType ||
          !row.task ||
          !row.startTime ||
          !row.endTime
        );
      });
    }

    return filtered;
  }, [data, selectedProject, selectedTaskType, showOnlyEmpty, searchTerm]);

  const filteredData = filteredDataWithIndices.map((item) => item.row);

  // Calculate stats based on filtered data
  const totalRows = filteredData.length;
  const rowsWithDate = filteredData.filter((row) => row.date).length;
  const rowsWithProject = filteredData.filter((row) => row.projectName).length;
  const rowsWithTaskType = filteredData.filter((row) => row.taskType).length;

  // Check if any filters are active
  const hasActiveFilters =
    selectedProject || selectedTaskType || showOnlyEmpty || searchTerm.trim();

  // Clear all filters
  const clearFilters = () => {
    setSelectedProject("");
    setSelectedTaskType("");
    setNewProjectName("");
    setShowOnlyEmpty(false);
    setSearchTerm("");
  };

  // Handle project replacement
  const handleReplaceAllProjects = () => {
    if (!selectedProject || !newProjectName.trim()) {
      return;
    }
    onBulkUpdateProject(selectedProject, newProjectName.trim());
    setNewProjectName("");
    setSelectedProject("");
  };

  // Count affected rows for project replacement
  const affectedRowsCount = selectedProject
    ? data.filter((row) => row.projectName === selectedProject).length
    : 0;

  // Convert unique values to dropdown options
  const projectOptions = uniqueProjects.map((p) => ({ label: p, value: p }));
  const taskTypeOptions = uniqueTaskTypes.map((t) => ({ label: t, value: t }));

  // Show skeleton while loading
  if (isLoading) {
    return <PreviewSkeleton />;
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 px-6 py-3">
      {/* Info Banner */}
      <div className="rounded-lg border bg-muted/50 p-3">
        <p className="text-sm text-muted-foreground">
          💡 <span className="font-medium text-foreground">Tip:</span> Click on
          any cell to edit it directly. Press{" "}
          <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">
            Enter
          </kbd>{" "}
          to save or{" "}
          <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">
            Esc
          </kbd>{" "}
          to cancel.
        </p>
      </div>

      {/* Filters Section */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <DropdownComponent
              label="Project"
              options={projectOptions}
              value={selectedProject}
              onValueChange={(value) => {
                setSelectedProject(value);
                setNewProjectName("");
              }}
              placeholder="All Projects"
              className="w-full"
            />
            {selectedProject && (
              <div className="space-y-2 p-3 rounded-md bg-muted/50 border">
                <p className="text-xs font-medium text-muted-foreground">
                  Replace &quot;{selectedProject}&quot;
                </p>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter new project name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {affectedRowsCount}{" "}
                    {affectedRowsCount === 1 ? "row" : "rows"}
                  </span>
                  <Button
                    size="sm"
                    onClick={handleReplaceAllProjects}
                    disabled={!newProjectName.trim()}
                    className="h-8"
                  >
                    Replace All
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DropdownComponent
            label="Type"
            options={taskTypeOptions}
            value={selectedTaskType}
            onValueChange={setSelectedTaskType}
            placeholder="All Task Types"
            className="w-full"
          />
          {/* Search Bar */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search all fields..."
                className="w-full rounded-md border border-input bg-background pl-9 pr-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          {/* Show Only Empty Rows Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Quality</label>
            <div className="flex items-center space-x-2 h-10 px-3 rounded-md border border-input bg-background">
              <Checkbox
                id="show-empty"
                checked={showOnlyEmpty}
                onCheckedChange={(checked) =>
                  setShowOnlyEmpty(checked === true)
                }
              />
              <label
                htmlFor="show-empty"
                className="text-sm cursor-pointer select-none"
              >
                Show only incomplete rows
              </label>
            </div>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span>Active filters:</span>
            {searchTerm.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary">
                Search: &quot;{searchTerm}&quot;
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary/80"
                  onClick={() => setSearchTerm("")}
                />
              </span>
            )}
            {selectedProject && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary">
                Project: {selectedProject}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary/80"
                  onClick={() => {
                    setSelectedProject("");
                    setNewProjectName("");
                  }}
                />
              </span>
            )}
            {selectedTaskType && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary">
                Type: {selectedTaskType}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary/80"
                  onClick={() => setSelectedTaskType("")}
                />
              </span>
            )}
            {showOnlyEmpty && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary">
                Incomplete rows only
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary/80"
                  onClick={() => setShowOnlyEmpty(false)}
                />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters ? "Filtered Rows" : "Total Rows"}
          </p>
          <p className="text-2xl font-bold">
            {totalRows}
            {hasActiveFilters && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                / {data.length}
              </span>
            )}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">With Date</p>
          <p className="text-2xl font-bold">{rowsWithDate}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">With Project</p>
          <p className="text-2xl font-bold">{rowsWithProject}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">With Type</p>
          <p className="text-2xl font-bold">{rowsWithTaskType}</p>
        </div>
      </div>

      {/* Editable Data Table */}
      <div className="w-full rounded-lg  bg-card overflow-auto min-h-[min(800px,80vh)] max-h-[85vh]">
        <div className="min-h-0 flex-1 overflow-auto">
          <EditableTable
            data={filteredData}
            onUpdate={(updatedRow, displayIndex) => {
              // Map display index to original index
              const originalIndex =
                filteredDataWithIndices[displayIndex].originalIndex;
              onUpdate(updatedRow, originalIndex);
            }}
            onDelete={(displayIndex) => {
              // Map display index to original index
              const originalIndex =
                filteredDataWithIndices[displayIndex].originalIndex;
              onDelete(originalIndex);
            }}
            onBulkDelete={(displayIndices) => {
              // Map display indices to original indices
              const originalIndices = displayIndices.map(
                (displayIndex) =>
                  filteredDataWithIndices[displayIndex].originalIndex,
              );
              // Sort in descending order to delete from end to start
              const sortedIndices = originalIndices.sort((a, b) => b - a);
              sortedIndices.forEach((originalIndex) => onDelete(originalIndex));
            }}
            systemTaskTypes={systemTaskTypes}
          />
        </div>
      </div>
    </div>
  );
}

export default Preview;
