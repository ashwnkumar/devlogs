"use client";
import CustomDialog from "@/components/CustomDialog";
import CustomSelect from "@/components/CustomSelect";
import { DropdownComponent } from "@/components/form/DropdownComponent";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import TableComponent from "@/components/TableComponent";
import { useAuth } from "@/context/AuthContext";
import { useGlobal } from "@/context/GlobalContext";
import { formatDate } from "@/lib/utils";
import { CompanyType, ProjectType } from "@/types";
import React, { ChangeEvent, useState } from "react";
import { toast } from "sonner";

function ProjectPage() {
  const {
    companies,
    globalLoading,
    handleAddProject: addProject,
  } = useGlobal();
  const { user } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(1);
  const [formData, setFormData] = useState({
    name: "",
    company_id: user?.current_company ? String(user.current_company) : "",
  });
  const [errors, setErrors] = useState<{ name?: string; company_id?: string }>(
    {}
  );

  const reset = () => {
    setFormData({
      name: "",
      company_id: user?.current_company ? String(user.current_company) : "",
    });
    setOpen(false);
    setErrors({});
    setRefresh((p) => p + 1);
  };

  const validate = () => {
    const err: { name?: string; company_id?: string } = {};
    if (!formData.name) err.name = "Name is Required";
    if (!formData.company_id) err.company_id = "Company is Required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleAddProject = async () => {
    if (!validate()) return toast.error("Fill All Required Fields");
    await addProject(formData.name, formData.company_id);
    toast.success("Project Added Successfully!");
    reset();
  };

  const getCompanyName = (companyId: string): string => {
    const company = companies.find((c: CompanyType) => c.id === companyId);
    return company?.name || "NA";
  };

  const columns = [
    { label: "Name", key: "name" },
    {
      label: "Company",
      key: "company_id",
      render: (row: ProjectType) => <p>{getCompanyName(row.company_id)}</p>,
    },
    {
      label: "Created At",
      key: "created_at",
      render: (row: ProjectType) => formatDate(row.created_at),
    },
    {
      label: "Updated At",
      key: "updated_at",
      render: (row: ProjectType) => formatDate(row.updated_at),
    },
  ];

  const headerActions = [
    { label: "Add Project", onClick: () => setOpen(true) },
  ];
  return (
    <div className="flex flex-col w-full h-full gap-6">
      <PageHeader title="Projects" actions={headerActions} />
      <TableComponent
        dataPath="/projects"
        revalidate={refresh}
        columns={columns}
        emptyMessage="No Projects Found. Add A Project to View Them Here"
      />
      <CustomDialog
        open={open}
        onOpenChange={setOpen}
        confirmText="Add Project"
        onConfirm={handleAddProject}
        title="Add Project"
        isPending={globalLoading}
        onCancel={reset}
      >
        <div className="w-full h-full flex flex-col items-center gap-4 p-1">
          <InputComponent
            value={formData.name}
            name="name"
            required
            label="Project Name"
            autoFocus
            className="w-full"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            error={errors.name}
          />
          <DropdownComponent
            label="Select Project"
            className="w-full"
            placeholder="Click to Select Company"
            options={companies}
            labelKey="name"
            valueKey="id"
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, company_id: value }))
            }
            value={formData.company_id}
            error={errors.company_id}
          />
        </div>
      </CustomDialog>
    </div>
  );
}

export default ProjectPage;
