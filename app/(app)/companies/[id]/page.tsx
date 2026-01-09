"use client";

import CustomDialog from "@/components/CustomDialog";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/context/GlobalContext";
import { createClient } from "@/lib/supabase/client";
import { CompanyType, ProjectType } from "@/types";
import { Info, Plus, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

  // Bulk upload dialog state
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [howThisWorksDialogOpen, setHowThisWorksDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [projectColumnTitle, setProjectColumnTitle] = useState("");
  const [uploadingBulk, setUploadingBulk] = useState(false);

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

  // Bulk upload handlers
  const handleBulkUpload = async () => {
    if (!uploadedFile || !projectColumnTitle.trim()) {
      return toast.error('Please Upload a File and add Column Name')
    }

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('column_name', projectColumnTitle);
    formData.append('company_id', companyId);

    setUploadingBulk(true);
    try {
        const res = await fetch('/api/import-projects',{
            method: "POST",
            body: formData
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.error || "Import Failed")
        }
        toast.success(`Imported ${data.count} projects`)
    } catch (error) {
        console.error('Error bulk uploading Projects', error);
        toast.error(`Error Importing Projects: ${error.message}`)
        
    }

    setUploadingBulk(false);
    setBulkUploadDialogOpen(false);
    setUploadedFile(null);
    setProjectColumnTitle("");
  };

  const handleCancelBulkUpload = () => {
    setUploadedFile(null);
    setProjectColumnTitle("");
    setBulkUploadDialogOpen(false);
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
        // TODO: Add proper error handling
        console.error("Please select a valid Excel file");
        return;
      }
      setUploadedFile(file);
    }
  };

  const projectActions = [
    {
      label: "Bulk Upload",
      icon: Upload,
      variant: "secondary",
      onClick: () => setBulkUploadDialogOpen(true),
    },
    {
      label: "Add Project",
      icon: Plus,
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

      {/* Bulk Upload Dialog */}
      <CustomDialog
        open={bulkUploadDialogOpen}
        onOpenChange={setBulkUploadDialogOpen}
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
              onClick={() => setHowThisWorksDialogOpen(true)}
              type="button"
            >
                <Info/>
              How this feature works?
            </Button>
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

      {/* How This Works Dialog */}
      <CustomDialog
        open={howThisWorksDialogOpen}
        onOpenChange={setHowThisWorksDialogOpen}
        title="How Bulk Upload Works"
        description="Learn how to use the bulk upload feature"
        cancelText="Close"
        hideOptions
      >
        <div>
          <ol className="list-decimal list-inside space-y-3 text-foreground">
            <li>
              <strong>You upload your Excel sheet</strong> — any .xlsx file
              exported from Google Sheets or Excel works fine. The file is sent
              securely to our servers.
            </li>
            <li>
              <strong>
                You tell us which column contains your project names
              </strong>{" "}
              — sheets often have columns named differently (e.g., "Project",
              "project name", "Project Name", "Work Item", etc.). By entering
              the exact column header, you help us find the right data quickly
              and accurately.
            </li>
            <li>
              <strong>We read only the column you specified</strong> — the rest
              of the sheet (dates, time spent, task types, descriptions, etc.)
              is ignored during this step. This keeps the import focused and
              fast.
            </li>
            <li>
              <strong>We extract unique project names</strong> — if the same
              project appears in multiple rows, we count it only once to avoid
              duplicates.
            </li>
            <li>
              <strong>
                We add each unique project to your current company
              </strong>{" "}
              — every project is linked to the company you're viewing and tied
              to your account for proper organization and privacy.
            </li>
            <li>
              <strong>You get a confirmation</strong> — once complete, you'll
              see how many projects were added. Your project list updates
              immediately so you can start logging time right away.
            </li>
          </ol>

          <p className="text-sm text-muted-foreground mt-6">
            This feature is designed specifically for developers migrating from
            spreadsheets — it saves hours of manual entry while keeping your
            data clean and structured.
          </p>
        </div>
      </CustomDialog>
    </div>
  );
}

export default CompanyDetailsPage;
