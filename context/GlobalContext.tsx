"use client";
import { CompanyType, ProjectType, TaskTypeType } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type GlobalContextType = {
  companies: CompanyType[];
  taskTypes: TaskTypeType[];
  globalLoading: boolean;
  currentProjects: ProjectType[];
  setGlobalLoading: (globalLoading: boolean) => void;
  fetchCompanies: () => Promise<void>;
  handleAddProject: (name: string, companyId: string) => Promise<boolean>;
  handleDeleteProject: (projectId: string) => Promise<boolean>;
};

const GlobalContext = createContext<GlobalContextType | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskTypeType[]>([]);
  const [currentProjects, setCurrentProjects] = useState<ProjectType>([]);
  const [globalLoading, setGlobalLoading] = useState(false);

  const fetchCompanies = useCallback(async () => {
    if (!user) return;
    setGlobalLoading(true);
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("user_id", user.id);
      if (error) {
        console.error("Error fetching companies:", error);
      } else {
        setCompanies(data || []);
      }
    } finally {
      setGlobalLoading(false);
    }
  }, [user]);

  const fetchCurrentProjects = async () => {
    try {
      const response = await fetch(
        `/api/projects?company_id=${user?.current_company}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch data");
      }

      const data = await response.json();
      setCurrentProjects(data.data || data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddProject = async (
    name: string,
    companyId: string
  ): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Project name cannot be empty");
      return false;
    }
    setGlobalLoading(true);
    try {
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmed,
          companyId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add project");
      }

      toast.success("Project added successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add project"
      );
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string): Promise<boolean> => {
    setGlobalLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete project");
      }

      toast.success("Project deleted successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete project"
      );
      console.error(error);
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const fetchTaskTypes = useCallback(async () => {
    setGlobalLoading(true);
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("task_types")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching task types:", error);
      } else {
        setTaskTypes(data);
      }
    } finally {
      setGlobalLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTaskTypes();
    fetchCompanies();
    fetchCurrentProjects();
  }, [user]);

  return (
    <GlobalContext.Provider
      value={{
        companies,
        taskTypes,
        globalLoading,
        currentProjects,
        fetchCompanies,
        setGlobalLoading,
        handleAddProject,
        handleDeleteProject,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => {
  const cxt = useContext(GlobalContext);
  if (!cxt) {
    throw new Error("useGlobal must be used within an GlobalProvider");
  }
  return cxt;
};
