"use client";

import { useState, useRef, useEffect } from "react";
import { ExtractedWorkLog } from "@/app/actions/bulk-import";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownComponent } from "@/components/form/DropdownComponent";
import { Trash2, Palmtree } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EditableTableProps = {
  data: ExtractedWorkLog[];
  onUpdate: (updatedRow: ExtractedWorkLog, rowIndex: number) => void;
  onDelete: (rowIndex: number) => void;
  onBulkDelete?: (rowIndices: number[]) => void;
  systemTaskTypes: { label: string; value: string }[];
};

export function EditableTable({
  data,
  onUpdate,
  onDelete,
  onBulkDelete,
  systemTaskTypes,
}: EditableTableProps) {
  console.log('systemTaskTypes', systemTaskTypes)
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    field: keyof ExtractedWorkLog;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  // Handle row selection
  const toggleRowSelection = (rowIndex: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex);
    } else {
      newSelected.add(rowIndex);
    }
    setSelectedRows(newSelected);
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((_, index) => index)));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;

    const indices = Array.from(selectedRows).sort((a, b) => b - a);

    if (onBulkDelete) {
      onBulkDelete(indices);
    } else {
      // Fallback to individual deletes
      indices.forEach((index) => onDelete(index));
    }

    setSelectedRows(new Set());
    toast.success(
      `Deleted ${indices.length} ${indices.length === 1 ? "row" : "rows"}`,
    );
  };

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;

  const handleCellClick = (
    rowIndex: number,
    field: keyof ExtractedWorkLog,
    currentValue:
      | Date
      | string
      | number
      | boolean
      | Record<string, unknown>
      | null,
  ) => {
    setEditingCell({ rowIndex, field });

    // Format the value for editing
    if (field === "date" && currentValue) {
      setEditValue(format(new Date(currentValue as Date), "yyyy-MM-dd"));
    } else if ((field === "startTime" || field === "endTime") && currentValue) {
      setEditValue(format(new Date(currentValue as Date), "HH:mm"));
    } else {
      setEditValue(String(currentValue || ""));
    }
  };

  const handleSave = () => {
    if (!editingCell) return;

    const { rowIndex, field } = editingCell;
    const row = data[rowIndex];
    let updatedValue: Date | string | null = editValue;

    // Parse the value based on field type
    if (field === "date") {
      if (editValue) {
        const [year, month, day] = editValue.split("-").map(Number);
        updatedValue = new Date(year, month - 1, day);
        updatedValue.setHours(0, 0, 0, 0);
      } else {
        updatedValue = null;
      }
    } else if (field === "startTime" || field === "endTime") {
      if (editValue) {
        const [hours, minutes] = editValue.split(":").map(Number);
        updatedValue = new Date();
        updatedValue.setHours(hours, minutes, 0, 0);
      } else {
        updatedValue = null;
      }
    } else {
      updatedValue = editValue.trim() || null;
    }

    // Validation for time fields
    if (field === "startTime" || field === "endTime") {
      const updatedRow = { ...row, [field]: updatedValue };
      if (updatedRow.startTime && updatedRow.endTime) {
        if (new Date(updatedRow.startTime) >= new Date(updatedRow.endTime)) {
          toast.error("Start time must be before end time");
          setEditingCell(null);
          return;
        }
      }
    }

    const updatedRow = { ...row, [field]: updatedValue };
    onUpdate(updatedRow, rowIndex);
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  // Special handler for task type dropdown
  const handleTaskTypeChange = (rowIndex: number, newTaskType: string) => {
    const row = data[rowIndex];
    const updatedRow = { ...row, taskType: newTaskType };
    onUpdate(updatedRow, rowIndex);
  };

  const renderCell = (
    row: ExtractedWorkLog,
    rowIndex: number,
    field: keyof ExtractedWorkLog,
    displayValue: string | React.ReactNode,
  ) => {
    const isEditing =
      editingCell?.rowIndex === rowIndex && editingCell?.field === field;

    // Special handling for taskType - always show as dropdown
    if (field === "taskType") {
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownComponent
            options={systemTaskTypes}
            value={row.taskType || ""}
            onValueChange={(value) => handleTaskTypeChange(rowIndex, value)}
            placeholder={row.taskType || "Select task type..."}
            className="w-full"
          />
        </div>
      );
    }

    if (isEditing) {
      if (field === "task") {
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[60px] rounded border border-primary bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        );
      }

      const inputType =
        field === "date"
          ? "date"
          : field === "startTime" || field === "endTime"
            ? "time"
            : "text";

      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={inputType}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full rounded border border-primary bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      );
    }

    return (
      <div
        onClick={() => handleCellClick(rowIndex, field, row[field] ?? null)}
        className="cursor-pointer rounded px-2 py-1 hover:bg-muted transition-colors min-h-[32px] flex items-center whitespace-normal break-words"
        title="Click to edit"
      >
        {displayValue}
      </div>
    );
  };

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between bg-primary/10 border-b border-primary/20 px-4 py-2 mb-2">
          <span className="text-sm font-medium">
            {selectedRows.size} {selectedRows.size === 1 ? "row" : "rows"}{" "}
            selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all rows"
              />
            </TableHead>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead className="w-[150px]">Project</TableHead>
            <TableHead className="w-[130px]">Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[110px]">Start Time</TableHead>
            <TableHead className="w-[110px]">End Time</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => {
            const isHolidayOrLeave = row.isHolidayOrLeave;

            return (
              <TableRow
                key={rowIndex}
                className={`${selectedRows.has(rowIndex) ? "bg-muted/50" : ""} ${isHolidayOrLeave ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedRows.has(rowIndex)}
                    onCheckedChange={() => toggleRowSelection(rowIndex)}
                    aria-label={`Select row ${rowIndex + 1}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isHolidayOrLeave && (
                      <Palmtree
                        className="h-4 w-4 text-blue-500"
                        aria-label="Holiday/Leave"
                      />
                    )}
                    {rowIndex + 1}
                  </div>
                </TableCell>

                {/* Date */}
                <TableCell>
                  {renderCell(
                    row,
                    rowIndex,
                    "date",
                    row.date ? (
                      format(new Date(row.date), "dd/MM/yyyy")
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    ),
                  )}
                </TableCell>

                {/* Project Name */}
                <TableCell>
                  {renderCell(
                    row,
                    rowIndex,
                    "projectName",
                    row.projectName || (
                      <span className="text-muted-foreground">-</span>
                    ),
                  )}
                </TableCell>

                {/* Type */}
                <TableCell>
                  {renderCell(
                    row,
                    rowIndex,
                    "taskType",
                    row.taskType || (
                      <span className="text-muted-foreground">-</span>
                    ),
                  )}
                </TableCell>

                {/* Task Description */}
                <TableCell>
                  {renderCell(
                    row,
                    rowIndex,
                    "task",
                    row.task || (
                      <span className="text-muted-foreground">-</span>
                    ),
                  )}
                </TableCell>

                {/* Start Time */}
                <TableCell>
                  {renderCell(
                    row,
                    rowIndex,
                    "startTime",
                    row.startTime ? (
                      format(new Date(row.startTime), "HH:mm")
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    ),
                  )}
                </TableCell>

                {/* End Time */}
                <TableCell>
                  {renderCell(
                    row,
                    rowIndex,
                    "endTime",
                    row.endTime ? (
                      format(new Date(row.endTime), "HH:mm")
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    ),
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(rowIndex)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
