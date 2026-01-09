import CustomDialog from "./CustomDialog";
import InputComponent from "./form/InputComponent";
import Tutorial from "./Tutorial";
import { Button } from "./ui/button";
import { Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [projectColumnTitle, setProjectColumnTitle] = useState("");
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [currentStep, setSteps] = useState<number>(1);

  const handleBulkUpload = async () => {
    if (!uploadedFile || !projectColumnTitle.trim()) {
      return toast.error("Please Upload a File and add Column Name");
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("column_name", projectColumnTitle);
    formData.append("company_id", companyId);

    setUploadingBulk(true);
    try {
      const res = await fetch("/api/import-projects", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Import Failed");
      }
      toast.success(`Imported ${data.count} projects`);

      // Reset form and close dialog
      setUploadedFile(null);
      setProjectColumnTitle("");
      onOpenChange(false);
      onUploadSuccess?.();
    } catch (error) {
      console.error("Error bulk uploading Projects", error);
      toast.error(`Error Importing Projects: ${(error as Error).message}`);
    }

    setUploadingBulk(false);
  };

  const handleCancelBulkUpload = () => {
    setUploadedFile(null);
    setProjectColumnTitle("");
    onOpenChange(false);
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
      setUploadedFile(file);
    }
  };

  const stepView = [
    { value: 1, text: "Upload Excel" },
    { value: 2, text: "Confirm Projects" },
  ];
  return (
    <>
      <CustomDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Bulk Upload Projects"
        description="Upload an Excel file to add multiple projects at once"
        cancelText="Cancel"
        confirmText={uploadingBulk ? "Uploading..." : "Upload"}
        onConfirm={handleBulkUpload}
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
          <div className="flex w-full items-center justify-evenly relative">
            <div className="w-full h-px bg-foreground/20 absolute top-1/4 -z-10" />
            {stepView.map((step) => (
              <div
              key={step.value}
              
              className={`flex items-center font-medium flex-col gap-2 ${currentStep === step.value ? "text-primary": "text-foreground"
              }`}>
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
          {/* File Upload Area */}
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
                {uploadedFile ? (
                  <div className="space-y-2">
                    <div className="text-green-600 font-medium">
                      File selected: {uploadedFile.name}
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
            value={projectColumnTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setProjectColumnTitle(e.target.value)
            }
            placeholder="Enter the column name containing project names"
            name="project-column"
            type="text"
            required
          />
        </div>
      </CustomDialog>

      <Tutorial open={showTutorial} onOpenChange={setShowTutorial} />
    </>
  );
}
