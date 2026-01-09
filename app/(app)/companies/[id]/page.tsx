"use client";

import CustomDialog from "@/components/CustomDialog";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import { useGlobal } from "@/context/GlobalContext";
import { createClient } from "@/lib/supabase/client";
import { CompanyType, ProjectType } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function CompanyDetailsPage() {
  const params = useParams();
  const companyId = params.id as string;
  const { projects: allProjects, addProject } = useGlobal();

  const [company, setCompany] = useState<CompanyType | null>(null);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add project dialog state
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [addingProject, setAddingProject] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("id", companyId)
          .single();

        if (error) {
          setError(error.message);
        } else {
          setCompany(data);
        }
      } catch {
        setError("Failed to fetch company data");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  useEffect(() => {
    const init = () => {
      const filtered = allProjects.filter((p) => p.company_id === companyId);
      if (filtered) {
        setProjects(filtered);
      }
    };

    init();
  }, [allProjects, companyId]);

  const handleAddProject = async () => {
    if (!company?.id || !company?.user_id) return;

    setAddingProject(true);
    const success = await addProject(
      newProjectName,
      company.id,
      company.user_id
    );
    setAddingProject(false);

    if (success) {
      setNewProjectName("");
      setAddProjectDialogOpen(false);
    }
  };

  const handleCancelAddProject = () => {
    setNewProjectName("");
    setAddProjectDialogOpen(false);
  };

  const projectActions = [
    {
      label: "Add Project",
      onClick: () => setAddProjectDialogOpen(true),
    },
  ];

  const viewData = [
    {
      label: "Company Name",
      value: <span className="text-lg font-medium">{company?.name}</span>,
    },
    {
      label: "Location",
      value: <span className="text-lg">{company?.location}</span>,
    },
    {
      label: "Joined At",
      value: (
        <span className="text-lg">
          {company?.joined_at
            ? new Date(company.joined_at).toLocaleDateString()
            : "N/A"}
        </span>
      ),
    },
    {
      label: "Left At",
      value: (
        <span className="text-lg">
          {company?.left_at
            ? new Date(company.left_at).toLocaleDateString()
            : "Currently working here"}
        </span>
      ),
    },
    {
      label: "Created At",
      value: (
        <span className="text-lg">
          {company?.created_at
            ? new Date(company.created_at).toLocaleString()
            : "N/A"}
        </span>
      ),
    },
    {
      label: "Last Updated",
      value: (
        <span className="text-lg">
          {company?.updated_at
            ? new Date(company.updated_at).toLocaleString()
            : "N/A"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full gap-8">
        <PageHeader title="Loading..." />
        <div className="flex items-center justify-center">
          <p>Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full h-full gap-8">
        <PageHeader title="Error" />
        <div className="flex items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col w-full h-full gap-8">
        <PageHeader title="Company Not Found" />
        <div className="flex items-center justify-center">
          <p>Company not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-8">
      <PageHeader
        title={company.name}
        description={`Company details for ${company.name}`}
        showBack
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {viewData.map((item, idx) => (
          <div key={idx}>
            <label className="text-sm font-medium text-muted-foreground">
              {item.label}
            </label>
            <p>{item.value || "NA"}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 border-t pt-4">
        <PageHeader
          title={"Projects"}
          description={`Projects you worked on at ${company.name}`}
          actions={projectActions}
        />

        <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-6">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project.id}
                className="p-4 w-full rounded-lg borde shadow-sm bg-card flex flex-col hover:shadow-md transition"
              >
                <p className="font-semibold text-lg">{project.name}</p>
                <p className="text-sm text-muted-foreground">
                  {" "}
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full w-full text-center text-muted-foreground text-sm py-6">
              No projects found for this company.
            </div>
          )}
        </div>
      </div>

      {/* Add Project Dialog */}
      <CustomDialog
        open={addProjectDialogOpen}
        onOpenChange={setAddProjectDialogOpen}
        title="Add New Project"
        description="Create a new project for this company"
        cancelText="Cancel"
        confirmText={addingProject ? "Adding..." : "Add Project"}
        onConfirm={handleAddProject}
        onCancel={handleCancelAddProject}
      >
        <div className="py-4">
          <InputComponent
            label="Project Name"
            value={newProjectName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProjectName(e.target.value)
            }
            placeholder="Enter project name"
            name="new-project"
            type="text"
            autoFocus
            required
          />
        </div>
      </CustomDialog>
    </div>
  );
}

export default CompanyDetailsPage;
