"use client";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import ExcelUpload from "./steps/ExcelUpload";
import { useAuth } from "@/context/AuthContext";
import { useCompany } from "@/context/CompanyContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { extractExcelData } from "@/app/actions/bulk-import";
import Preview from "./steps/Preview";

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
  const { user } = useAuth();
  const { companies } = useCompany();

  const [formData, setFormData] = useState<FormType>({
    company_id: "",
    file: null,
  });
  const [errors, setErrors] = useState<ErrorType>({
    company_id: "",
    file: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [projectsMap,setProjectsMap] = useState([])
  const [taskTypesMap,setTaskTypesMap] = useState([])
  const [extracted, setExtracted] = useState([])

  // Set default company_id from user context
  useEffect(() => {
    if (user?.current_company) {
      setFormData((prev) => ({ ...prev, company_id: user.current_company }));
    }
  }, [user]);

  const steps = [
    { label: "Upload Excel", step: 0 },
    // { label: "Project Extraction", step: 1 },
    // { label: "Task Type Mapping", step: 2 },
    { label: "Data Cleaning", step: 1 },
    { label: "Import Data", step: 2 },
  ];

  const validateForm = () => {
    const err: ErrorType = {};
    switch (current) {
      case 0:
        if (!formData.company_id) err.company_id = "Company is Required";
        if (!formData.file) err.file = "File is Required";
        break;
      default:
        break;
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm()) return toast.error("Missing required data");
    const uploadForm = new FormData();
    uploadForm.append("file", formData.file);
    setLoading(true)

    const result = await extractExcelData(uploadForm);

    if (!result.success) {
      toast.error(result.error);
      return;
    }


    setExtracted(result?.data)
    const proj = result.meta.uniqueProjects.map(i => ({label: i, value: i}))
    setProjectsMap(proj)
    const tas = result.meta.uniqueTaskTypes.map(i => ({label: i, value: i}))
    setTaskTypesMap(tas)
    toast.success(`Extracted ${result.meta.totalRows} rows!`)
    setLoading(false)
    setCurrent(p => p+1)
   
  };

  const labelMap = ["Next", "Next", "Next", "Import Data"];
  const actionMap = [handleUpload]; // Reuse or define per-step

  const headerActions = [
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
      return <Preview data={extracted} projects={projectsMap} taskTypes={taskTypesMap} />

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
