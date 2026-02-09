"use client";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import ExcelUpload from "./steps/ExcelUpload";
import { useAuth } from "@/context/AuthContext";
import { useGlobal } from "@/context/GlobalContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { extractExcelData, ExtractedWorkLog } from "@/app/actions/bulk-import";
import Preview from "./steps/Preview";
import ImportData from "./steps/ImportData";
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

  // Track if data has been modified
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Import state management
  const [importStatus, setImportStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [importResult, setImportResult] = useState<{
    projectsCreated: number;
    projectsReused: number;
    taskTypesCreated: number;
    tasksCreated: number;
    projects: Array<{ id: string; name: string }>;
  } | null>(null);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(
    null,
  );
  const [importValidationErrors, setImportValidationErrors] = useState<
    Array<{
      rowNumber: number;
      field: string;
      message: string;
    }>
  >([]);

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

  const steps = [
    { label: "Upload Excel", step: 0 },
    { label: "Data Preview", step: 1 },
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
    toast.loading("Processing Excel file...", { id: "excel-upload" });

    const result = await extractExcelData(uploadForm);

    if (!result.success) {
      toast.error(result.error, { id: "excel-upload" });
      setLoading(false);
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
    toast.success(
      `Successfully extracted ${result.meta.totalRows} rows from Excel file!`,
      { id: "excel-upload" },
    );
    setLoading(false);
    setCurrent((p) => p + 1);
  };

  // Handle navigation from Preview step to Import step
  const handleProceedToImport = () => {
    // Check if there's any data to import
    if (extractedData.length === 0) {
      toast.error("No data to import. Please upload a file with data.");
      return;
    }

    toast.success(
      `Data validated successfully! Ready to import ${extractedData.length} ${extractedData.length === 1 ? "row" : "rows"}.`,
    );
    // Proceed to next step
    setCurrent((p) => p + 1);
  };

  // Handle actual import to database
  const handleImportData = async () => {
    if (!formData.company_id) {
      toast.error("Company ID is required");
      return;
    }

    if (extractedData.length === 0) {
      toast.error("No data to import");
      return;
    }

    setImportStatus("loading");
    setImportErrorMessage(null);
    setImportValidationErrors([]);

    try {
      const response = await fetch("/api/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: extractedData,
          company_id: formData.company_id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setImportStatus("error");
        setImportErrorMessage(result.error || "Failed to import data");
        if (result.validationErrors) {
          setImportValidationErrors(result.validationErrors);
        }
        toast.error(result.error || "Failed to import data");
        return;
      }

      setImportStatus("success");
      setImportResult(result.data);
      toast.success(result.message || "Data imported successfully!");
    } catch (error) {
      setImportStatus("error");
      setImportErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
      toast.error("Failed to import data. Please try again.");
    }
  };

  // Handle completion (success or error) - reset or navigate away
  const handleImportComplete = () => {
    if (importStatus === "success") {
      // Reset everything and go back to start
      setExtractedData([]);
      setOriginalData([]);
      setFormData({ company_id: user?.current_company as string, file: null });
      setProjectsMap([]);
      setTaskTypesMap([]);
      setHasUnsavedChanges(false);
      setImportStatus("idle");
      setImportResult(null);
      setCurrent(0);
      toast.success("Ready for next import!");
    } else {
      // Go back to preview to fix errors
      setCurrent(1);
      setImportStatus("idle");
    }
  };

  const labelMap = ["Next", "Next", "Import Data"];
  const actionMap = [handleUpload, handleProceedToImport, handleImportData];

  // Handle reset all changes
  const handleResetAllChanges = () => {
    setExtractedData(originalData);
    setHasUnsavedChanges(false);
    toast.success("All changes have been reset");
  };

  const headerActions = [
    {
      label: "How It Works",
      icon: Info,
      variant: "outline" as const,
      onClick: () => setTutorialOpen(true),
    },
    ...(current === 1 && hasUnsavedChanges
      ? [
          {
            label: "Reset All Changes",
            variant: "outline" as const,
            onClick: handleResetAllChanges,
          },
        ]
      : []),
    // Hide action button on import step if loading or completed
    ...(current === 2 &&
    (importStatus === "loading" || importStatus === "success")
      ? []
      : [{ label: labelMap[current], onClick: actionMap[current] }]),
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
            uniqueProjects={projectsMap.map((p) => p.value)}
            uniqueTaskTypes={taskTypesMap.map((t) => t.value)}
            onUpdate={(updatedRow, rowIndex) => {
              setExtractedData((prev) =>
                prev.map((row, i) => (i === rowIndex ? updatedRow : row)),
              );
              setHasUnsavedChanges(true);
            }}
            onDelete={(rowIndex) => {
              setExtractedData((prev) => prev.filter((_, i) => i !== rowIndex));
              setHasUnsavedChanges(true);
              toast.success(`Row ${rowIndex + 1} deleted`);
            }}
            onBulkUpdateProject={(oldName, newName) => {
              const updatedCount = extractedData.filter(
                (row) => row.projectName === oldName,
              ).length;

              setExtractedData((prev) =>
                prev.map((row) =>
                  row.projectName === oldName
                    ? { ...row, projectName: newName }
                    : row,
                ),
              );

              // Update the projectsMap to reflect the change
              setProjectsMap((prev) => {
                const filtered = prev.filter((p) => p.value !== oldName);
                const hasNewName = filtered.some((p) => p.value === newName);
                if (!hasNewName) {
                  return [...filtered, { label: newName, value: newName }].sort(
                    (a, b) => a.label.localeCompare(b.label),
                  );
                }
                return filtered;
              });

              setHasUnsavedChanges(true);
              toast.success(
                `Replaced "${oldName}" with "${newName}" in ${updatedCount} ${updatedCount === 1 ? "row" : "rows"}`,
              );
            }}
            systemTaskTypes={taskTypes.map((t) => ({
              label: t.name,
              value: t.name,
            }))}
          />
        );

      case 2:
        return (
          <ImportData
            data={extractedData}
            companyId={formData.company_id}
            onImportComplete={handleImportComplete}
            importStatus={importStatus}
            importResult={importResult}
            errorMessage={importErrorMessage}
            validationErrors={importValidationErrors}
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
