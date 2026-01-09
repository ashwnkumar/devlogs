"use client";
import ConfirmDialog from "@/components/ConfirmDialog";
import InputComponent from "@/components/form/InputComponent";
import NoData from "@/components/NoData";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGlobal } from "@/context/GlobalContext";
import { createClient } from "@/lib/supabase/client";
import { CompanyType, ProjectType } from "@/types";
import {
  Check,
  FolderOpen,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
type Props = {
  company: CompanyType | null;
};

function ProjectCard({ company }: Props) {
  const { projects, fetchProjects, addProject, deleteProject } = useGlobal();

  // Separate states for clarity
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [originalName, setOriginalName] = useState(""); // for cancel restore

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const companyProjects = useMemo(() => {
    return projects?.filter((p) => p.company_id === company?.id) ?? [];
  }, [projects, company?.id]);

  // Add Project
  const handleAdd = useCallback(async () => {
    if (!company?.id || !company?.user_id) return;

    setLoading(true);
    const success = await addProject(
      newProjectName,
      company.id,
      company.user_id
    );
    setLoading(false);

    if (success) {
      setNewProjectName("");
      setIsAdding(false);
    }
  }, [newProjectName, company, addProject]);

  // Start Edit
  const startEdit = useCallback((project: ProjectType) => {
    setEditingId(project.id);
    setEditName(project.name);
    setOriginalName(project.name);
  }, []);

  // Cancel Edit
  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName("");
    setOriginalName("");
  }, []);

  // Save Edit
  const handleUpdate = useCallback(async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Project name cannot be empty");
      return;
    }
    if (trimmed === originalName) {
      cancelEdit();
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("projects")
      .update({ name: trimmed })
      .eq("id", editingId);

    setLoading(false);
    if (error) {
      toast.error(`Failed to update project: ${error.message}`);
      console.error(error);
    } else {
      toast.success("Project updated successfully");
      cancelEdit();
      await fetchProjects();
    }
  }, [editName, originalName, editingId, supabase, fetchProjects, cancelEdit]);

  // Delete Flow
  const openDeleteConfirm = useCallback((id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;

    setLoading(true);
    await deleteProject(deletingId);
    setLoading(false);
    setConfirmOpen(false);
    setDeletingId(null);
  }, [deletingId, deleteProject]);

  const hasProjects = companyProjects.length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-primary/5 p-4 shadow w-full max-h-96 overflow-auto">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-xl font-medium">{company?.name}</h3>
      </div>

      <div className="w-full flex flex-col grow">
        {/* Add New Project Row */}
        {isAdding && (
          <div className="flex items-end gap-2 w-full">
            <InputComponent
              label="New Project Name"
              value={newProjectName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewProjectName(e.target.value)
              }
              placeholder="Enter project name"
              name="new-project"
              type="text"
              autoFocus
              className="flex-1"
              inputClassName="bg-background"
            />
            <Button
              onClick={handleAdd}
              disabled={loading || !newProjectName.trim()}
              variant="outline"
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check />
              )}
            </Button>
            <Button
              onClick={() => setIsAdding(false)}
              variant="ghost"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Projects List */}
        {hasProjects || isAdding ? (
          <div className="flex flex-col gap-2 w-full">
            {companyProjects.map((project) => {
              const isEditing = editingId === project.id;
              const isDeleting = deletingId === project.id && loading;

              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between gap-3 py-1.5"
                >
                  {isEditing ? (
                    <InputComponent
                      value={editName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditName(e.target.value)
                      }
                      placeholder="Project name"
                      name="edit-project"
                      type="text"
                      autoFocus
                      className="flex-1"
                      inputClassName="bg-background"
                    />
                  ) : (
                    <p className="truncate flex-1 flex items-center gap-2">
                      <FolderOpen size={16} />
                      <span>{project.name}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleUpdate}
                              disabled={loading || !editName.trim()}
                              variant="outline"
                              size="icon-sm"
                            >
                              {loading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Save</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={cancelEdit}
                              variant="ghost"
                              size="icon-sm"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Cancel</TooltipContent>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => startEdit(project)}
                              variant="outline"
                              size="icon-sm"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => openDeleteConfirm(project.id)}
                              variant="destructive"
                              size="icon-sm"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <NoData
            title="No Projects Yet"
            description="Start by adding your first project"
            icon={FolderOpen}
          />
        )}
      </div>
      {/* Add Button (only if not already adding and has space) */}
      {!isAdding && (
        <Button
          onClick={() => setIsAdding(true)}
          variant="outline"
          className="w-full mt-2"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Project"
        description="This action cannot be undone. All related logs will remain, but the project will be removed."
        onConfirm={handleDelete}
        confirmText={loading ? "Deleting..." : "Delete"}
      />
    </div>
  );
}

export default ProjectCard;
