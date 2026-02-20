"use client";
import { DropdownComponent } from "@/components/form/DropdownComponent";
import FileUpload from "@/components/form/FileUpload";
import { Card, CardContent } from "@/components/ui/card";
import { useCompany } from "@/context/CompanyContext";
import React from "react";
import { toast } from "sonner";

type ExcelUploadProps = {
  companyId: string;
  file: File | null;
  onCompanyChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  errors: Record<string, string>;
};

function ExcelUpload({
  companyId,
  onCompanyChange,
  onFileChange,
  errors,
}: ExcelUploadProps) {
  const { companies } = useCompany();

  const handleFileChange = (files: File[]) => {
    const selectedFile = files[0] || null;
    onFileChange(selectedFile);

    if (selectedFile) {
      toast.success(`File selected: ${selectedFile.name}`);
    }
  };

  const handleCompanyChange = (value: string) => {
    onCompanyChange(value);
    const selectedCompany = companies.find((c) => c.id === value);
    if (selectedCompany) {
      toast.info(`Company selected: ${selectedCompany.name}`);
    }
  };

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
            onValueChange={handleCompanyChange}
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
        onChange={handleFileChange}
        error={errors?.file}
      />
    </div>
  );
}
export default ExcelUpload;
