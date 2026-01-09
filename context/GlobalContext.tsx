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
  projects: ProjectType[];
  taskTypes: TaskTypeType[];
  globalLoading: boolean;
  fetchCompanies: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  addProject: (
    name: string,
    companyId: string,
    userId: string
  ) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
};

const GlobalContext = createContext<GlobalContextType | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskTypeType[]>([]);
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

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setGlobalLoading(true);
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("user_id", user.id);
      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data || []);
      }
    } finally {
      setGlobalLoading(false);
    }
  }, [user]);

  const addProject = async (
    name: string,
    companyId: string,
    userId: string
  ): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Project name cannot be empty");
      return false;
    }

    setGlobalLoading(true);
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("projects").insert({
        name: trimmed,
        company_id: companyId,
        user_id: userId,
      });

      if (error) {
        toast.error(`Failed to add project: ${error.message}`);
        console.error(error);
        return false;
      } else {
        toast.success("Project added successfully");
        await fetchProjects();
        return true;
      }
    } finally {
      setGlobalLoading(false);
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    setGlobalLoading(true);
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        toast.error(`Failed to delete project: ${error.message}`);
        console.error(error);
        return false;
      } else {
        toast.success("Project deleted successfully");
        await fetchProjects();
        return true;
      }
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
    fetchProjects();
  }, [user, fetchTaskTypes, fetchCompanies, fetchProjects]);

  return (
    <GlobalContext.Provider
      value={{
        companies,
        projects,
        taskTypes,
        globalLoading,
        fetchCompanies,
        fetchProjects,
        addProject,
        deleteProject,
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
