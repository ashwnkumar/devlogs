"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { TableActions, TableColumn, TableComponentProps } from "@/types";
import { Ban, EllipsisVertical, Edit, Trash2 } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { toast } from "sonner";
import { DropdownComponent } from "./form/DropdownComponent";
import InputComponent from "./form/InputComponent";
import ConfirmDialog from "./ConfirmDialog";
import { DatePicker } from "./form/DatePicker";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

// ── Simple useDebounce hook
function useDebounce<T>(value: T, delayMs: number = 450): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Generate form fields based on column metadata and form mode
 * @param columns - Array of table columns with metadata
 * @param formMode - 'add' or 'edit' mode
 * @param formData - Current form data values
 * @param formErrors - Current form validation errors
 * @param onFieldChange - Callback when a field value changes
 * @returns Array of React elements representing form fields
 */
function generateFormFields<T extends object>(
  columns: TableColumn<T>[],
  formMode: "add" | "edit",
  formData: Record<string, any>,
  formErrors: Record<string, string>,
  onFieldChange: (key: string, value: any) => void,
): React.ReactNode[] {
  // Filter columns based on mode
  const filteredColumns = columns.filter((col) => {
    if (formMode === "add") {
      // For add mode: include only addable columns (addable !== false)
      return col.addable !== false;
    } else {
      // For edit mode: include only editable columns (editable !== false)
      return col.editable !== false;
    }
  });

  // Map each column to appropriate input component based on dataType
  return filteredColumns.map((col) => {
    const key = String(col.key);
    const value = formData[key];
    const error = formErrors[key];

    // Handle default dataType of "text" when not specified
    const dataType = col.dataType || "text";
    const label = col.label;
    const required = col.required || false;
    const placeholder = col.placeholder;

    // Generate appropriate input component based on dataType
    switch (dataType) {
      case "text":
      case "email":
      case "url":
      case "time":
        return (
          <InputComponent
            key={key}
            label={label}
            type={dataType}
            value={value || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFieldChange(key, e.target.value)
            }
            required={required}
            placeholder={placeholder}
            error={error}
          />
        );

      case "number":
        return (
          <InputComponent
            key={key}
            label={label}
            type="number"
            value={value || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFieldChange(key, e.target.value)
            }
            required={required}
            placeholder={placeholder}
            error={error}
          />
        );

      case "date":
        return (
          <DatePicker
            key={key}
            label={label}
            value={value ? new Date(value) : null}
            onChange={(date) => onFieldChange(key, date)}
            required={required}
            error={error}
          />
        );

      case "boolean":
        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={!!value}
                onCheckedChange={(checked) => onFieldChange(key, checked)}
              />
              <Label className="text-sm font-medium">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <span className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>
        );

      case "select":
        // For select type, use options from column metadata
        const options = col.options || [];
        return (
          <DropdownComponent
            key={key}
            label={label}
            options={options}
            labelKey="label"
            valueKey="value"
            value={value}
            onValueChange={(newValue) => onFieldChange(key, newValue)}
            required={required}
            placeholder={placeholder || `Select ${label}`}
            error={error}
          />
        );

      default:
        // Fallback to text input for unknown types
        return (
          <InputComponent
            key={key}
            label={label}
            type="text"
            value={value || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFieldChange(key, e.target.value)
            }
            required={required}
            placeholder={placeholder}
            error={error}
          />
        );
    }
  });
}

function TableComponent<T extends object>({
  filterConfig,
  data: initialData,
  columns,
  actions = [],
  emptyMessage,
  dataPath,
  revalidate,
  enableAdd,
  enableEdit,
  enableDelete,
  addButtonLabel = "Add",
  idField = "id",
}: TableComponentProps<T>) {
  const [view, setView] = useState(false);
  const [selected, setSelected] = useState<T>({} as T);
  const [tableData, setTableData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const debouncedSearch = useDebounce(search, 500);

  // Add/Edit state (unified)
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRow, setDeletingRow] = useState<T | null>(null);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Show controls if there's data or if we have a search placeholder
  const showControls =
    tableData.length > 0 || !!filterConfig?.searchPlaceholder;

  // Show filter dropdown only if filterConfig has data
  const showFilterDropdown =
    !!filterConfig?.data?.length && !!filterConfig.valueKey;

  // Determine if Add button should be shown
  const shouldShowAddButton = enableAdd !== false && !!dataPath;

  // Determine if Edit and Delete buttons should be shown
  const shouldShowEdit = enableEdit !== false && !!dataPath;
  const shouldShowDelete = enableDelete !== false && !!dataPath;
  const shouldShowActionsColumn = shouldShowEdit || shouldShowDelete;

  const fetchData = async (isRefetch: boolean = false) => {
    if (!dataPath) return;

    // Use different loading states for initial load vs refetch
    if (isRefetch) {
      setIsRefetching(true);
    } else {
      setLoading(true);
    }

    let url = dataPath;

    const params = new URLSearchParams();
    if (filter) params.set("f", filter);
    if (debouncedSearch) params.set("q", debouncedSearch);

    if (params.size > 0) {
      url += `?${params.toString()}`;
    }

    try {
      const response = await fetch(`/api${url}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch data");
      }

      const result = await response.json();
      setTableData(result.data || result || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load data");
    } finally {
      if (isRefetch) {
        setIsRefetching(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revalidate, filter, debouncedSearch, dataPath]);

  // Create operation
  const createRecord = async (data: Partial<T>): Promise<void> => {
    if (!dataPath) {
      throw new Error("dataPath is required for create operation");
    }

    // Construct endpoint: /api{dataPath}
    const endpoint = `/api${dataPath}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to create record");
    }

    return response.json();
  };

  // Update operation
  const updateRecord = async (row: T, data: Partial<T>): Promise<void> => {
    if (!dataPath) {
      throw new Error("dataPath is required for update operation");
    }

    // Extract record ID using idField prop (default "id")
    const recordId = (row as any)[idField];
    if (recordId === undefined || recordId === null) {
      throw new Error(`Record ID field "${idField}" not found in row data`);
    }

    // Construct endpoint: /api{dataPath}/{recordId}
    const endpoint = `/api${dataPath}/${recordId}`;

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error.includes("one_running_task_per_user")) {
        if (
          errorData.error.includes('violates check constraint "tasks_check"')
        ) {
          throw new Error("End time cannot be greater than current time.");
        }

        console.log("errorData.error", errorData.error);
        throw new Error("You must end your current task to add a new task.");
      }

      throw new Error(errorData.error || "Failed to update record");
    }

    return response.json();
  };

  // Delete operation
  const deleteRecord = async (row: T): Promise<void> => {
    if (!dataPath) {
      throw new Error("dataPath is required for delete operation");
    }

    // Extract record ID using idField prop (default "id")
    const recordId = (row as any)[idField];
    if (recordId === undefined || recordId === null) {
      throw new Error(`Record ID field "${idField}" not found in row data`);
    }

    // Construct endpoint: /api{dataPath}/{recordId}
    const endpoint = `/api${dataPath}/${recordId}`;

    const response = await fetch(endpoint, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to delete record");
    }

    return response.json();
  };

  const handleRowClick = (row: T) => {
    setSelected(row);
    setView(true);
  };

  const handleAddClick = () => {
    setFormMode("add");
    setEditingRow(null);
    // Initialize formData with default values from column metadata
    const defaultFormData: Record<string, any> = {};
    columns.forEach((col) => {
      if (col.addable !== false) {
        // Use defaultValue if provided, otherwise initialize with appropriate empty value
        if (col.defaultValue !== undefined) {
          const dataType = col.dataType || "text";

          // For time fields with ISO string defaults, extract just the time
          if (dataType === "time") {
            const date = new Date(col.defaultValue);
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            defaultFormData[String(col.key)] = `${hours}:${minutes}`;
          } else {
            defaultFormData[String(col.key)] = col.defaultValue;
          }
        } else {
          // Initialize with empty value based on dataType to ensure controlled components
          const dataType = col.dataType || "text";
          switch (dataType) {
            case "boolean":
              defaultFormData[String(col.key)] = false;
              break;
            case "number":
              defaultFormData[String(col.key)] = "";
              break;
            default:
              defaultFormData[String(col.key)] = "";
          }
        }
      }
    });
    setFormData(defaultFormData);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleEditClick = (row: T, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setFormMode("edit");
    setEditingRow(row);
    // Initialize formData with current row values
    const editFormData: Record<string, any> = {};
    columns.forEach((col) => {
      if (col.editable !== false) {
        const value = (row as any)[col.key];
        const dataType = col.dataType || "text";

        // For time fields, extract just the time portion from timestamp
        if (dataType === "time" && value) {
          const date = new Date(value);
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          editFormData[String(col.key)] = `${hours}:${minutes}`;
        } else {
          // Ensure all form fields have initial values (use empty string for null/undefined)
          editFormData[String(col.key)] =
            value !== null && value !== undefined ? value : "";
        }
      }
    });
    setFormData(editFormData);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleDeleteClick = (row: T, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setDeletingRow(row);
    setDeleteOpen(true);
  };

  const handleFormCancel = () => {
    // Close sheet without API call
    setFormOpen(false);
    // Clear editingRow and formData state
    setEditingRow(null);
    setFormData({});
    setFormErrors({});
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Clear error for this field when user starts typing
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // Helper function to get a human-readable record identifier for the edit sheet title
  const getRecordIdentifier = (row: T): string => {
    // Try common identifier fields in order of preference
    const identifierFields = ["name", "title", "label", "email", idField];

    for (const field of identifierFields) {
      const value = (row as any)[field];
      if (value !== undefined && value !== null && value !== "") {
        return String(value);
      }
    }

    // Fallback to the ID field value
    return String((row as any)[idField] || "Unknown");
  };

  /**
   * Validate form data based on column metadata
   * @returns Object with field names as keys and error messages as values
   */
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Get columns to validate based on form mode
    const columnsToValidate = columns.filter((col) => {
      if (formMode === "add") {
        return col.addable !== false;
      } else {
        return col.editable !== false;
      }
    });

    columnsToValidate.forEach((col) => {
      const key = String(col.key);
      const value = formData[key];
      const dataType = col.dataType || "text";

      // 1. Check required fields are not empty
      if (col.required) {
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (typeof value === "string" && value.trim() === "")
        ) {
          errors[key] = `${col.label} is required`;
          return; // Skip further validation if required field is empty
        }
      }

      // Skip type validation if field is empty and not required
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return;
      }

      // 2. Validate field types
      switch (dataType) {
        case "number":
          if (isNaN(Number(value))) {
            errors[key] = `${col.label} must be a valid number`;
          } else {
            // Check min/max validation if provided
            const numValue = Number(value);
            if (
              col.validation?.min !== undefined &&
              numValue < col.validation.min
            ) {
              errors[key] =
                `${col.label} must be at least ${col.validation.min}`;
            } else if (
              col.validation?.max !== undefined &&
              numValue > col.validation.max
            ) {
              errors[key] =
                `${col.label} must be at most ${col.validation.max}`;
            }
          }
          break;

        case "email":
          // Basic email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            errors[key] = `${col.label} must be a valid email address`;
          }
          break;

        case "url":
          // Basic URL validation
          try {
            new URL(String(value));
          } catch {
            errors[key] = `${col.label} must be a valid URL`;
          }
          break;

        case "date":
          // Check if date is valid
          const dateValue = value instanceof Date ? value : new Date(value);
          if (isNaN(dateValue.getTime())) {
            errors[key] = `${col.label} must be a valid date`;
          } else {
            // Check min/max date validation if provided
            if (col.validation?.min !== undefined) {
              const minDate = new Date(col.validation.min);
              if (dateValue < minDate) {
                errors[key] =
                  `${col.label} must be on or after ${minDate.toLocaleDateString()}`;
              }
            }
            if (col.validation?.max !== undefined) {
              const maxDate = new Date(col.validation.max);
              if (dateValue > maxDate) {
                errors[key] =
                  `${col.label} must be on or before ${maxDate.toLocaleDateString()}`;
              }
            }
          }
          break;

        case "text":
          // Check minLength/maxLength validation if provided
          const strValue = String(value);
          if (
            col.validation?.minLength !== undefined &&
            strValue.length < col.validation.minLength
          ) {
            errors[key] =
              `${col.label} must be at least ${col.validation.minLength} characters`;
          } else if (
            col.validation?.maxLength !== undefined &&
            strValue.length > col.validation.maxLength
          ) {
            errors[key] =
              `${col.label} must be at most ${col.validation.maxLength} characters`;
          } else if (
            col.validation?.pattern &&
            !col.validation.pattern.test(strValue)
          ) {
            errors[key] = `${col.label} format is invalid`;
          }
          break;
      }

      // 3. Execute custom validator functions if provided
      if (col.validation?.customValidator) {
        const customError = col.validation.customValidator(value);
        if (customError) {
          errors[key] = customError;
        }
      }
    });

    return errors;
  };

  return (
    <div className="space-y-4 w-full">
      {/* Loading indicator during refetch */}
      {isRefetching && (
        <div className="w-full h-1 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-pulse" />
        </div>
      )}

      {/* Add button - always show when enabled, regardless of data */}
      {shouldShowAddButton && (
        <div className="flex justify-start">
          <Button onClick={handleAddClick}>{addButtonLabel}</Button>
        </div>
      )}

      {/* Search and filter controls - only show when there's data or search is enabled */}
      {showControls && (
        <div className="w-full flex items-center justify-between mb-4">
          <InputComponent
            className="w-1/3"
            label={filterConfig.searchPlaceholder}
            placeholder={filterConfig.searchPlaceholder}
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
          {showFilterDropdown && (
            <div className="flex items-end gap-2">
              <DropdownComponent
                options={filterConfig.data}
                label={filterConfig.label}
                labelKey={filterConfig.labelKey}
                valueKey={filterConfig.valueKey}
                value={filter}
                onValueChange={setFilter}
                placeholder={filterConfig.label}
                className="w-64 min-w-[180px]"
              />
              {filter && (
                <Button variant="destructive" onClick={() => setFilter("")}>
                  Clear filter
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              {columns.map((col, i) => (
                <TableHead key={String(col.key) || i}>{col.label}</TableHead>
              ))}
              {actions.length > 0 && <TableHead>Actions</TableHead>}
              {shouldShowActionsColumn && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
                {columns.map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton className="h-4 w-full max-w-[240px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : tableData.length === 0 ? (
        <Empty className="min-h-[400px] bg-linear-to-b from-muted/50 to-background">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Ban className="h-12 w-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No Data Found</EmptyTitle>
            {emptyMessage && (
              <EmptyDescription>{emptyMessage}</EmptyDescription>
            )}
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              {columns.map((col, i) => (
                <TableHead key={String(col.key) || i}>{col.label}</TableHead>
              ))}
              {actions.length > 0 && <TableHead>Actions</TableHead>}
              {shouldShowActionsColumn && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, rowIdx) => (
              <TableRow
                key={rowIdx}
                className="cursor-pointer hover:bg-muted/60 transition-colors"
                onClick={() => handleRowClick(row)}
              >
                <TableCell>{rowIdx + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    {col.render
                      ? col.render(row)
                      : (row as any)[col.key as string]}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {actions.map((action, idx) => (
                          <DropdownMenuItem key={idx} asChild>
                            <button
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm"
                              onClick={() => action.onClick?.(row)}
                            >
                              {action.icon && (
                                <action.icon className="h-4 w-4" />
                              )}
                              {action.label}
                            </button>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
                {shouldShowActionsColumn && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {shouldShowEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEditClick(row, e)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {shouldShowDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(row, e)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Details Sheet - always rendered */}
      <Sheet open={view} onOpenChange={setView}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Details</SheetTitle>
          </SheetHeader>
          <div className="p-6 space-y-6">
            {columns.map((col) => (
              <div key={String(col.key)} className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  {col.label}
                </div>
                <div className="text-base">
                  {col.render
                    ? col.render(selected)
                    : (selected as any)[col.key as string]}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add/Edit Form Sheet - always rendered */}
      <Sheet open={formOpen} onOpenChange={handleFormCancel}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {formMode === "add"
                ? "Add New Record"
                : `Edit Record${editingRow ? ` - ${getRecordIdentifier(editingRow)}` : ""}`}
            </SheetTitle>
          </SheetHeader>
          <div className="p-6 space-y-4">
            {/* Generate form fields based on column metadata */}
            {generateFormFields(
              columns,
              formMode,
              formData,
              formErrors,
              handleFieldChange,
            )}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleFormCancel}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  // Validate form before submission
                  const errors = validateForm();
                  if (Object.keys(errors).length > 0) {
                    // Store validation errors in formErrors state
                    setFormErrors(errors);
                    toast.error("Please fix the validation errors");
                    return;
                  }

                  // Transform time fields to timestamps before submission
                  const transformedData = { ...formData };
                  columns.forEach((col) => {
                    const key = String(col.key);
                    const dataType = col.dataType || "text";

                    // Convert time inputs to full timestamps
                    if (dataType === "time" && transformedData[key]) {
                      const timeValue = transformedData[key];

                      // If it's already a full timestamp, leave it
                      if (timeValue.includes("T") || timeValue.includes(" ")) {
                        return;
                      }

                      // Otherwise, combine with today's date
                      const today = new Date();
                      const [hours, minutes] = timeValue.split(":");
                      today.setHours(
                        parseInt(hours, 10),
                        parseInt(minutes, 10),
                        0,
                        0,
                      );
                      transformedData[key] = today.toISOString();
                    }
                  });

                  // Handle form submission based on mode
                  if (formMode === "add") {
                    // Add mode: create new record
                    setIsSubmitting(true);
                    try {
                      await createRecord(transformedData as Partial<T>);
                      toast.success("Record created successfully");
                      // Close sheet
                      setFormOpen(false);
                      setFormData({});
                      setFormErrors({});
                      // Refresh table data (preserve filter/search state)
                      await fetchData(true);
                    } catch (error) {
                      const errorMessage =
                        error instanceof Error
                          ? error.message
                          : "Failed to create record";
                      toast.error(errorMessage);
                      // Keep sheet open on error so user can retry or cancel
                    } finally {
                      setIsSubmitting(false);
                    }
                  } else {
                    // Edit mode: update existing record
                    if (!editingRow) {
                      toast.error("No record selected for editing");
                      return;
                    }

                    setIsSubmitting(true);
                    try {
                      await updateRecord(
                        editingRow,
                        transformedData as Partial<T>,
                      );
                      toast.success("Record updated successfully");
                      // Close sheet
                      setFormOpen(false);
                      setEditingRow(null);
                      setFormData({});
                      setFormErrors({});
                      // Refresh table data (preserve filter/search state)
                      await fetchData(true);
                    } catch (error) {
                      const errorMessage =
                        error instanceof Error
                          ? error.message
                          : "Failed to update record";
                      toast.error(errorMessage);
                      // Keep sheet open on error so user can retry or cancel
                    } finally {
                      setIsSubmitting(false);
                    }
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog - always rendered */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Confirm Delete"
        description="Are you sure you want to delete this record? This action cannot be undone."
        cancelText="Cancel"
        confirmText="Delete"
        confirmVariant="destructive"
        loading={isDeleting}
        onCancel={() => {
          setDeleteOpen(false);
          setDeletingRow(null);
        }}
        onConfirm={async () => {
          if (!deletingRow) return;

          setIsDeleting(true);
          try {
            await deleteRecord(deletingRow);
            toast.success("Record deleted successfully");
            setDeleteOpen(false);
            setDeletingRow(null);
            // Refresh table data after successful deletion (preserve filter/search state)
            await fetchData(true);
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to delete record";
            toast.error(errorMessage);
            // Keep dialog open on error so user can retry or cancel
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </div>
  );
}

export default TableComponent;
