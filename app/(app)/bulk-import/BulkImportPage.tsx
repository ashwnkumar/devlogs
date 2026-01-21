"use client";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import ExcelUpload from "./steps/ExcelUpload";

function BulkImportPage() {
  const [current, setCurrent] = useState<number>(0);

  const steps = [
    { label: "Upload Excel", step: 0 },
    { label: "Project Extraction", step: 1 },
    { label: "Data Cleaning", step: 2 },
    { label: "Import Data", step: 3 },
  ];

  const handleUpload = () => {};

  const labelMap = ["Import", "Add Projects", "Continue", "Import Data"];

  const actionMap = [handleUpload];

  const headerActions = [
    { label: labelMap[current], onClick: actionMap[current] },
  ];

  const renderBody = () => {
    switch (current) {
      case 0:
        return <ExcelUpload />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
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
      {renderBody()}
    </div>
  );
}

export default BulkImportPage;
