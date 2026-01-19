'use client'
import { ProjectType } from "@/types";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useGlobal } from "./GlobalContext";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface ProjectContextType {
  projects: ProjectType[];
  fetchProjects: (companyId?: string) => Promise<void>;
  addProject: (
    projectData: Omit<ProjectType, "id" | "created_at" | "updated_at">,
  ) => Promise<boolean>;
  editProject: (
    id: string,
    projectData: Partial<Omit<ProjectType, "id" | "created_at" | "updated_at">>,
  ) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const { setGlobalLoading } = useGlobal();

  const fetchProjects = useCallback(
    async (companyId?: string) => {
      if (!user) return;
      setGlobalLoading(true);
      try {
        const url = new URL("/api/projects", window.location.origin);
        if (companyId) {
          url.searchParams.set("company_id", companyId);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch projects");
        }

        const { data } = await response.json();
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to fetch projects");
      } finally {
        setGlobalLoading(false);
      }
    },
    [user, setGlobalLoading],
  );

  const addProject = async (
    projectData: Omit<ProjectType, "id" | "created_at" | "updated_at">,
  ): Promise<boolean> => {
    const trimmedName = projectData.name.trim();
    if (!trimmedName) {
      toast.error("Project name cannot be empty");
      return false;
    }

    setGlobalLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          companyId: projectData.company_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add project");
      }

      // Add the new project to the local state
      setProjects((prev) => [data.data, ...prev]);
      toast.success("Project added successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add project",
      );
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const editProject = async (
    id: string,
    projectData: Partial<Omit<ProjectType, "id" | "created_at" | "updated_at">>,
  ): Promise<boolean> => {
    if (projectData.name && !projectData.name.trim()) {
      toast.error("Project name cannot be empty");
      return false;
    }

    setGlobalLoading(true);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update project");
      }

      // Update the project in the local state
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id ? { ...project, ...data.data } : project,
        ),
      );
      toast.success("Project updated successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update project",
      );
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    setGlobalLoading(true);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete project");
      }

      // Remove the project from the local state
      setProjects((prev) => prev.filter((project) => project.id !== id));
      toast.success("Project deleted successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete project",
      );
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        fetchProjects,
        addProject,
        editProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
