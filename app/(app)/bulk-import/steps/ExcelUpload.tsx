"use client";
import { DropdownComponent } from "@/components/form/DropdownComponent";
import FileUpload from "@/components/form/FileUpload";
import { Card, CardContent } from "@/components/ui/card";
import { useCompany } from "@/context/CompanyContext";
import React from "react";

type ExcelUploadProps = {
  companyId: string;
  file: File | null;
  onCompanyChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  errors: Record<string, string>;
};

function ExcelUpload({
  companyId,
  file,
  onCompanyChange,
  onFileChange,
  errors,
}: ExcelUploadProps) {
  const { companies } = useCompany();


  return (
    <div className="w-full h-full flex flex-col items-center gap-6 px-6 py-3">
      <Card className="w-full py-4">
        <CardContent className="w-full flex items-center justify-between">
          <div className="flex flex-col items-start">
            <p className="font-semibold">Select Company</p>
            <p className="text-muted-foreground font-light">
              Choose the company whose data you will be importing
            </p>
          </div>
          <DropdownComponent
            label="Company"
            required
            value={companyId}
            onValueChange={onCompanyChange}
            options={companies.map((company) => ({
              label: company.name,
              value: company.id,
            }))}
            placeholder="Select a company"
            className="w-72"
            error={errors?.company_id}
          />
        </CardContent>
      </Card>
      <FileUpload
        accept={"excel"}
        onChange={(files) => onFileChange(files[0] || null)}
        error={errors?.file}
      />
    </div>
  );
}
export default ExcelUpload;
