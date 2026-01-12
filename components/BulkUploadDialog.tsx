import CustomDialog from "./CustomDialog";
import InputComponent from "./form/InputComponent";
import Tutorial from "./Tutorial";
import { Button } from "./ui/button";
import { Info, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { Row } from "react-day-picker";
import { SheetFooter } from "./ui/sheet";

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onUploadSuccess?: () => void;
}

export default function BulkUploadDialog({
  open,
  onOpenChange,
  companyId,
  onUploadSuccess,
}: BulkUploadDialogProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [formData, setFormData] = useState({
    upload: null as File | null,
    column_name: "",
    sheet_number: 1,
  });
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [extracted, setExtracted] = useState<string[]>([]);
  const [newProject, setNewProject] = useState<string>("");

  const handleExtract = async () => {
    if (!formData.upload || !formData.column_name.trim()) {
      return toast.error("Please Upload a File and add Column Name");
    }

    const buffer = await formData.upload.arrayBuffer();

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const sheet = workbook.getWorksheet(formData.sheet_number);
      if (!sheet) throw new Error("No Worksheet Found");

      const headerRow = sheet.getRow(1);
      const headers = headerRow.values as string[];

      const colIdx = headers.findIndex(
        (h) =>
          h?.toString()?.trim()?.toLowerCase() ===
          formData.column_name.trim()?.toLowerCase()
      );
      if (colIdx === -1)
        throw new Error(`Column ${formData.column_name} not found`);

      const projectNames = new Set<string>();

      sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber === 1) return;
        const cellValue = row.getCell(colIdx).text?.trim();
        if (cellValue) projectNames.add(cellValue);
      });

      if (projectNames.size === 0) throw new Error("No Projects Found");
      setExtracted(Array.from(projectNames));
      toast.success(`Extracted ${projectNames.size} projects`);
      setCurrentStep(2);
    } catch (error) {
      console.error("Error bulk uploading Projects", error);
      toast.error(`Error Importing Projects: ${(error as Error).message}`);
    }
  };

  const handleCancelBulkUpload = () => {
    setFormData({
      upload: null,
      column_name: "",
      sheet_number: 1,
    });
    onOpenChange(false);
    setCurrentStep(1);
    setExtracted([]);
    setNewProject("");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an Excel file
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!allowedTypes.includes(file.type)) {
        console.error("Please select a valid Excel file");
        return;
      }
      setFormData((prev) => ({ ...prev, upload: file }));
    }
  };

  const handleUploadProjects = async () => {
    const uploadFormData = new FormData();
    uploadFormData.append("company_id", companyId);
    uploadFormData.append("projects", JSON.stringify(extracted));

    setUploadingBulk(true);

    try {
      const response = await fetch("/api/import-projects", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to import projects");
        return;
      }

      // Success case
      toast.success(`Successfully imported ${result.count} projects!`);

      // Call the success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error importing projects:", error);
      toast.error("Something went wrong while importing projects");
    } finally {
      setUploadingBulk(false);
      handleCancelBulkUpload();
    }
  };

  const getConfirmAction = () => {
    switch (currentStep) {
      case 1:
        return handleExtract();
      case 2:
        return handleUploadProjects();
      default:
        return null;
    }
  };

  const getConfirmText = () => {
    switch (currentStep) {
      case 1:
        return "Extract";
      case 2:
        return uploadingBulk ? "Importing" : "Import";
      default:
        return "Upload";
    }
  };

  const stepView = [
    { value: 1, text: "Upload Excel" },
    { value: 2, text: "Confirm Projects" },
    { value: 3, text: "Import Projects" },
  ];
  return (
    <>
      <CustomDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Bulk Upload Projects"
        description="Upload an Excel file to add multiple projects at once"
        cancelText="Cancel"
        confirmText={getConfirmText()}
        onConfirm={getConfirmAction}
        onCancel={handleCancelBulkUpload}
      >
        <div className="items-start flex flex-col space-y-4">
          {/* How This Works Button */}
          <Button
            size="icon-lg"
            className="w-full gap-2"
            onClick={() => setShowTutorial(true)}
            type="button"
          >
            <Info />
            How this feature works?
          </Button>
          <div className="flex w-full items-center justify-between relative">
            <div className="w-full h-px bg-foreground/20 absolute top-1/4 -z-10" />
            {stepView.map((step) => (
              <div
                key={step.value}
                className={`flex items-center font-medium flex-col gap-2 ${
                  currentStep === step.value
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                <div
                  className={`flex items-center justify-center aspect-square w-8 h-8 text-lg rounded-full p-2 ${
                    currentStep === step.value
                      ? "bg-primary text-white"
                      : "bg-background border text-foreground"
                  }`}
                >
                  <span>{step.value}</span>
                </div>
                <span>{step.text}</span>
              </div>
            ))}
          </div>
          {currentStep === 1 ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-full space-y-2">
                <label className="text-sm font-medium">Excel File</label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="excel-file-upload"
                  />
                  <label htmlFor="excel-file-upload" className="cursor-pointer">
                    {formData.upload ? (
                      <div className="space-y-2">
                        <div className="text-green-600 font-medium">
                          File selected: {formData.upload.name}
                        </div>
                        <Button variant="outline" size="sm" type="button">
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-muted-foreground">
                          <svg
                            className="mx-auto h-12 w-12"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-primary">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Excel files only (.xlsx, .xls)
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Project Column Title Input */}
              <InputComponent
                className="w-full"
                label="Project Column Title"
                value={formData.column_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    column_name: e.target.value,
                  }))
                }
                placeholder="Enter the column name containing project names"
                name="project-column"
                type="text"
                required
              />
            </div>
          ) : currentStep === 2 ? (
            <div className="p-2 w-full flex flex-col items-center gap-2">
              <div className="flex items-end gap-2 border-b pb-4 w-full">
                <InputComponent
                  value={newProject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setNewProject(e.target.value);
                  }}
                  className="w-full"
                  label="Add a New Project"
                  placeholder="Add Project"
                />
                <Button
                  onClick={() => {
                    if (newProject.trim()) {
                      setExtracted((prev) => [newProject, ...prev]);
                      setNewProject("");
                    }
                  }}
                  variant={"outline"}
                >
                  Add Project
                </Button>
              </div>
              {extracted.map((item, idx) => (
                <div key={idx} className="w-full flex items-center gap-2">
                  <InputComponent
                    value={item}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const newValue = e.target.value;
                      setExtracted((prev) => {
                        const updated = [...prev];
                        updated[idx] = newValue;
                        return updated;
                      });
                    }}
                    className="w-full"
                  />
                  <Button
                    size={"icon-lg"}
                    variant={"destructive"}
                    onClick={() => {
                      setExtracted((prev) => prev.filter((_, i) => i !== idx));
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          ) : currentStep === 3 ? (
            <div className="w-full flex flex-col items-center gap-2">
              <span className="loader1"></span>
              <p>Importing Projects..</p>
            </div>
          ) : null}
        </div>
      </CustomDialog>

      <Tutorial open={showTutorial} onOpenChange={setShowTutorial} />
    </>
  );
}
