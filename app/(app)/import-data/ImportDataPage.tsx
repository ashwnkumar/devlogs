"use client";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Upload, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import ExcelJS from "exceljs";

const steps = [
  { label: "Upload Excel", step: 1 },
  { label: "Column Mapping", step: 2 },
  { label: "Extract Data", step: 3 },
  { label: "Clean Data", step: 4 },
  { label: "Import Data", step: 5 },
];

type FormType = {
  date: string;
  project: string;
  task_type: string;
  description: string;
  start_time: string;
  end_time: string;
};

function ImportDataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormType>({
    date: "",
    project: "",
    task_type: "",
    description: "",
    start_time: "",
    end_time: "",
  });
  const [current, setCurrent] = useState<number>(1);

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
      setFile(file);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleChangeFile = () => {
    const fileInput = document.getElementById(
      "excel-file-upload",
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleExtractData = async (formData: FormType, file: File | null) => {};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getPrimaryAction = () => {
    switch (current) {
      case 1:
        return setCurrent(2);
      case 2:
        handleExtractData(formData, file);
        return setCurrent(3);
    }
  };

  const fields: { label: string; key: keyof FormType }[] = [
    { label: "Date", key: "date" },
    { label: "Project", key: "project" },
    { label: "Task Type", key: "task_type" },
    { label: "Description", key: "description" },
    { label: "Start Time", key: "start_time" },
    { label: "End Time", key: "end_time" },
  ];

  const handleBack = () => {};

  const renderContent = () => {
    switch (current) {
      case 1:
        return (
          <div className="w-full max-w-2xl py-20 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file-upload"
            />

            <label htmlFor="excel-file-upload" className="cursor-pointer">
              {file ? (
                <div className="space-y-4">
                  <div className="text-green-700 font-medium">
                    File selected: {file.name}
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleChangeFile();
                      }}
                    >
                      Change File
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFile();
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center  justify-center">
                  <div className="text-muted-foreground">
                    <Upload />
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
        );
      case 2:
        return (
          <div className="w-full max-w-4xl flex flex-col items-start gap-2 ">
            <div className="flex flex-col items-start">
              <p className="font-medium text-lg">Column Mapping</p>
              <p className="font-light text-sm">
                Enter the names of these columns in your Excel Sheet
              </p>
            </div>
            <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
              {fields.map((item) => (
                <InputComponent
                  key={item.key}
                  value={formData[item.key]}
                  placeholder={`Enter ${item.label}`}
                  label={item.label}
                  name={item.key}
                  className="w-full"
                  onChange={handleInputChange}
                />
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const headerActions = [
    ...(current > 1
      ? [{ label: "Back", onClick: handleBack, variant: "outline" as const }]
      : []),
    { label: "Next", onClick: getPrimaryAction },
  ];
  return (
    <div className="w-full h-full flex flex-col items-center gap-6">
      <PageHeader
        title="Import Data"
        description="Import existing data by uploading an Excel Sheet"
        actions={headerActions}
      />
      <div className="w-full flex items-center justify-around relative">
        <div className="absolute top-4 h-px bg-foreground/50 -z-10 w-full" />
        {steps.map((step) => (
          <div key={step.step} className="flex flex-col items-center gap-2">
            <div
              className={`aspect-square p-1 text-lg flex  justify-center rounded-full ${
                current >= step.step
                  ? "bg-primary text-white"
                  : "bg-accent text-foreground"
              }`}
            >
              {step.step}
            </div>
            <span className="text-sm">{step.label}</span>
          </div>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}

export default ImportDataPage;
