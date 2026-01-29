"use client";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useCallback } from "react";
import ExcelUpload from "./steps/ExcelUpload";
import { useAuth } from "@/context/AuthContext";
import { useGlobal } from "@/context/GlobalContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { extractExcelData, ExtractedWorkLog } from "@/app/actions/bulk-import";
import Preview from "./steps/Preview";
import { BulkImportTutorial } from "@/components/BulkImportTutorial";
import { Info } from "lucide-react";

type ErrorType = {
  company_id: string;
  file: string;
};

type FormType = {
  company_id: string;
  file: File | null;
};

function BulkImportPage() {
  const [current, setCurrent] = useState<number>(0);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const { user } = useAuth();
  const { taskTypes } = useGlobal();

  const [formData, setFormData] = useState<FormType>({
    company_id: "",
    file: null,
  });
  const [errors, setErrors] = useState<ErrorType>({
    company_id: "",
    file: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [projectsMap, setProjectsMap] = useState<
    { label: string; value: string }[]
  >([]);
  const [taskTypesMap, setTaskTypesMap] = useState<
    { label: string; value: string }[]
  >([]);

  // Editable data (modified by user)
  const [extractedData, setExtractedData] = useState<ExtractedWorkLog[]>([]);

  // Original data backup for reset functionality
  const [originalData, setOriginalData] = useState<ExtractedWorkLog[]>([]);

  // Validation errors: Map<rowIndex, errorMessage>
  const [validationErrors, setValidationErrors] = useState<Map<number, string>>(
    new Map(),
  );

  // Track if data has been modified
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Set default company_id from user context
  useEffect(() => {
    if (user?.current_company) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        company_id: user.current_company as string,
      }));
    }
  }, [user]);

  // Validate a single row
  const validateRow = useCallback(
    (rowIndex: number, updatedRow: Partial<ExtractedWorkLog>) => {
      const fullRow = { ...extractedData[rowIndex], ...updatedRow };
      const errors = new Map(validationErrors);

      if (fullRow.startTime && fullRow.endTime) {
        if (fullRow.startTime >= fullRow.endTime) {
          errors.set(rowIndex, "Start time must be before end time");
          toast.error(
            `Row ${rowIndex + 1}: Start time must be before end time`,
          );
        } else {
          errors.delete(rowIndex);
        }
      }

      setValidationErrors(errors);
    },
    [extractedData, validationErrors],
  );

  // Check if can proceed to next step (no validation errors)
  const canProceedToImport = useCallback(() => {
    return validationErrors.size === 0;
  }, [validationErrors]);

  // Update a single row
  const handleRowUpdate = useCallback(
    (rowIndex: number, updatedRow: Partial<ExtractedWorkLog>) => {
      setExtractedData((prev) => {
        const newData = [...prev];
        newData[rowIndex] = { ...newData[rowIndex], ...updatedRow };
        return newData;
      });
      setHasUnsavedChanges(true);
      validateRow(rowIndex, updatedRow);
    },
    [validateRow],
  );

  // Bulk replace project names
  const handleBulkReplaceProject = useCallback(
    (oldName: string, newName: string) => {
      setExtractedData((prev) =>
        prev.map((row) =>
          row.projectName === oldName ? { ...row, projectName: newName } : row,
        ),
      );
      setHasUnsavedChanges(true);

      // Update projectsMap to reflect new unique values
      setProjectsMap((prev) => {
        // Remove old name and add new name if not already present
        const filtered = prev.filter((p) => p.value !== oldName);
        const hasNewName = filtered.some((p) => p.value === newName);
        if (!hasNewName) {
          return [...filtered, { label: newName, value: newName }];
        }
        return filtered;
      });
    },
    [],
  );

  // Bulk replace task types
  const handleBulkReplaceTaskType = useCallback(
    (oldType: string, newType: string) => {
      setExtractedData((prev) =>
        prev.map((row) =>
          row.taskType === oldType ? { ...row, taskType: newType } : row,
        ),
      );
      setHasUnsavedChanges(true);

      // Update taskTypesMap to reflect new unique values
      setTaskTypesMap((prev) => {
        // Remove old type and add new type if not already present
        const filtered = prev.filter((t) => t.value !== oldType);
        const hasNewType = filtered.some((t) => t.value === newType);
        if (!hasNewType) {
          return [...filtered, { label: newType, value: newType }];
        }
        return filtered;
      });
    },
    [],
  );

  // Reset all changes
  const handleResetChanges = useCallback(() => {
    // Restore extractedData from originalData
    setExtractedData([...originalData]);

    // Clear validationErrors map
    setValidationErrors(new Map());

    // Set hasUnsavedChanges to false
    setHasUnsavedChanges(false);

    // Recalculate projectsMap and taskTypesMap from original data
    const uniqueProjects = Array.from(
      new Set(originalData.map((row) => row.projectName).filter(Boolean)),
    );
    setProjectsMap(uniqueProjects.map((p) => ({ label: p!, value: p! })));

    const uniqueTaskTypes = Array.from(
      new Set(originalData.map((row) => row.taskType).filter(Boolean)),
    );
    setTaskTypesMap(uniqueTaskTypes.map((t) => ({ label: t!, value: t! })));

    // Show toast notification confirming reset
    toast.success("All changes have been reset to original data");
  }, [originalData]);

  // Delete a row
  const handleDeleteRow = useCallback((rowIndex: number) => {
    setExtractedData((prev) => prev.filter((_, idx) => idx !== rowIndex));
    setHasUnsavedChanges(true);
  }, []);

  const steps = [
    { label: "Upload Excel", step: 0 },
    // { label: "Project Extraction", step: 1 },
    // { label: "Task Type Mapping", step: 2 },
    { label: "Data Cleaning", step: 1 },
    { label: "Import Data", step: 2 },
  ];

  const validateForm = () => {
    const err: ErrorType = { company_id: "", file: "" };
    switch (current) {
      case 0:
        if (!formData.company_id) err.company_id = "Company is Required";
        if (!formData.file) err.file = "File is Required";
        break;
      default:
        break;
    }
    setErrors(err);
    return (
      Object.keys(err).filter((key) => err[key as keyof ErrorType]).length === 0
    );
  };

  const handleUpload = async () => {
    if (!validateForm()) return toast.error("Missing required data");
    if (!formData.file) return toast.error("File is required");

    const uploadForm = new FormData();
    uploadForm.append("file", formData.file);
    setLoading(true);

    const result = await extractExcelData(uploadForm);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    // Set both extractedData and originalData for editing and reset functionality
    setExtractedData(result?.data);
    setOriginalData(result?.data);
    const proj = result.meta.uniqueProjects.map((i) => ({
      label: i,
      value: i,
    }));
    setProjectsMap(proj);
    const tas = result.meta.uniqueTaskTypes.map((i) => ({
      label: i,
      value: i,
    }));
    setTaskTypesMap(tas);
    toast.success(`Extracted ${result.meta.totalRows} rows!`);
    setLoading(false);
    setCurrent((p) => p + 1);
  };

  // Handle navigation from Preview step to Import step
  const handleProceedToImport = () => {
    if (!canProceedToImport()) {
      const errorCount = validationErrors.size;
      toast.error(
        `Cannot proceed: ${errorCount} validation error${errorCount > 1 ? "s" : ""} found. Please fix the errors before importing.`,
      );
      return;
    }
    // Proceed to next step
    setCurrent((p) => p + 1);
  };

  const labelMap = ["Next", "Next", "Next", "Import Data"];
  const actionMap = [handleUpload, handleProceedToImport]; // Reuse or define per-step

  const headerActions = [
    {
      label: "How It Works",
      icon: Info,
      variant: "outline" as const,
      onClick: () => setTutorialOpen(true),
    },
    { label: labelMap[current], onClick: actionMap[current] },
  ];

  const renderBody = () => {
    switch (current) {
      case 0:
        return (
          <ExcelUpload
            companyId={formData.company_id}
            file={formData.file}
            onCompanyChange={(value) => {
              setFormData((prev) => ({ ...prev, company_id: value }));
              setErrors((prev) => ({ ...prev, company_id: "" }));
            }}
            onFileChange={(file) => {
              setFormData((prev) => ({ ...prev, file }));
              setErrors((prev) => ({ ...prev, file: "" }));
            }}
            errors={errors}
          />
        );

      case 1:
        return (
          <Preview
            data={extractedData}
            projects={projectsMap}
            taskTypes={taskTypesMap}
            systemTaskTypes={taskTypes}
            validationErrors={validationErrors}
            hasUnsavedChanges={hasUnsavedChanges}
            onRowUpdate={handleRowUpdate}
            onBulkReplaceProject={handleBulkReplaceProject}
            onBulkReplaceTaskType={handleBulkReplaceTaskType}
            onResetChanges={handleResetChanges}
            onDeleteRow={handleDeleteRow}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <BulkImportTutorial open={tutorialOpen} onOpenChange={setTutorialOpen} />
      <PageHeader
        title="Bulk Import Data"
        description="Upload an Excel sheet to extract your old logs."
        actions={headerActions}
      />
      <div className="relative w-full flex items-center justify-around">
        <div className="h-0.5 w-full absolute -z-10 bg-accent top-1/4" />
        {steps.map((item) => (
          <div key={item.step} className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center aspect-square rounded-full p-2 bg-accent text-foreground font-semibold",
                current === item.step && "bg-primary text-white",
              )}
            >
              {item.step + 1}
            </div>
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      {loading ? (
        <div className="w-full flex flex-col items-center gap-2">
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-20" />
        </div>
      ) : (
        renderBody()
      )}
    </div>
  );
}

export default BulkImportPage;
