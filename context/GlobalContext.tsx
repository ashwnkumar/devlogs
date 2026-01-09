"use client";
import { CompanyType, ProjectType, TaskTypeType } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { createClient } from "@/lib/supabase/client";

type GlobalContextType = {
  companies: CompanyType[];
  projects: ProjectType[];
  taskTypes: TaskTypeType[];
  fetchCompanies: () => Promise<void>;
  fetchProjects: () => Promise<void>;
};

const GlobalContext = createContext<GlobalContextType | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskTypeType[]>([]);

  const fetchCompanies = async () => {
    if (!user) return;
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
  };
  const fetchProjects = async () => {
    if (!user) return;
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
  };

  const fetchTaskTypes = async () => {
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
  };
  
  useEffect(() => {
    fetchTaskTypes();
    fetchCompanies();
    fetchProjects();
  }, [user]);

  return (
    <GlobalContext.Provider
      value={{
        companies,
        projects,
        taskTypes,
        fetchCompanies,
        fetchProjects,
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
