"use client";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import SheetComponent from "@/components/SheetComponent";
import TableComponent from "@/components/TableComponent";
import { Button } from "@/components/ui/button";
import { DropdownComponent } from "@/components/form/DropdownComponent";
import { useProject } from "@/context/ProjectContext";
import { useCompany } from "@/context/CompanyContext";
import { useGlobal } from "@/context/GlobalContext";
import { formatDate } from "@/lib/utils";
import { CompanyType, ProjectType, TableColumn } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";

function ProjectPage() {
  const { projects, loading, addProject, editProject, deleteProject } =
    useProject();
  const { companies } = useCompany();
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    company_id: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, company_id: value }));
  };

  const reset = () => {
    setFormData({
      name: "",
      company_id: "",
    });
    setEditingProject(null);
    setOpen(false);
  };

  const handleAddProject = async () => {
    const success = await addProject({
      name: formData.name,
      company_id: formData.company_id,
    });

    if (success) {
      reset();
    }
  };

  const handleEditProject = async (row: ProjectType) => {
    setEditingProject(row);
    setFormData({
      name: row.name,
      company_id: row.company_id,
    });
    setOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;

    const success = await editProject(editingProject.id, {
      name: formData.name,
      company_id: formData.company_id,
    });

    if (success) {
      reset();
    }
  };

  const handleDeleteProject = async (row: ProjectType) => {
    if (confirm(`Are you sure you want to delete "${row.name}"?`)) {
      await deleteProject(row.id);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent form submission

    // Basic validation
    if (!formData.name.trim()) {
      return;
    }
    if (!formData.company_id.trim()) {
      return;
    }

    if (editingProject) {
      await handleUpdateProject();
    } else {
      await handleAddProject();
    }
  };

  const getCompanyName = (companyId: string): string => {
    const company = companies.find((c: CompanyType) => c.id === companyId);
    return company?.name || "NA";
  };

  const columns: TableColumn<ProjectType>[] = [
    {
      label: "Name",
      key: "name",
    },
    {
      label: "Company",
      key: "company_id",
      render: (row: ProjectType) => getCompanyName(row.company_id),
    },
    {
      label: "Created At",
      key: "created_at",
      render: (row: ProjectType) => formatDate(row.created_at, "date"),
    },
    {
      label: "Updated At",
      key: "updated_at",
      render: (row: ProjectType) => formatDate(row.updated_at, "date"),
    },
  ];

  const headerActions = [
    {
      label: "Add",
      icon: Plus,
      onClick: () => {
        reset(); // Reset form for new project
        setOpen(true);
      },
    },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <PageHeader title="Projects" actions={headerActions} />
      <TableComponent<ProjectType>
        data={projects}
        columns={columns}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        loading={loading}
      />

      <SheetComponent
        open={open}
        onOpenChange={setOpen}
        title={editingProject ? "Edit Project" : "Add Project"}
      >
        <form
          id="project-form"
          className="flex flex-col items-center gap-4 w-full"
          onSubmit={handleSubmit}
        >
          <InputComponent
            name="name"
            label="Project Name"
            className="w-full"
            required
            value={formData.name}
            onChange={handleInputChange}
          />

          <DropdownComponent
            label="Company"
            required
            value={formData.company_id}
            onValueChange={handleSelectChange}
            options={companies.map((company) => ({
              label: company.name,
              value: company.id,
            }))}
            placeholder="Select a company"
          />

          <div className="flex flex-col items-center gap-2 w-full">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Processing..."
                : editingProject
                  ? "Update Project"
                  : "Add Project"}
            </Button>
            <Button
              type="button"
              variant={"outline"}
              className="w-full"
              onClick={reset}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetComponent>
    </div>
  );
}

export default ProjectPage;
