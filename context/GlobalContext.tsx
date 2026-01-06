"use client";
import { CompanyType, ProjectType } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { createClient } from "@/lib/supabase/client";

type GlobalContextType = {
  userCompanies: CompanyType[];
  userProjects: ProjectType[];
  fetchCompanies: () => Promise<void>;
  fetchProjects: () => Promise<void>;
};

const GlobalContext = createContext<GlobalContextType | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userCompanies, setUserCompanies] = useState<CompanyType[]>([]);
  const [userProjects, setUserProjects] = useState<ProjectType[]>([]);

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
      setUserCompanies(data || []);
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
      setUserProjects(data || []);
    }
  };
  useEffect(() => {
    fetchCompanies();
    fetchProjects();
  }, [user]);

  return (
    <GlobalContext.Provider
      value={{
        userCompanies,
        userProjects,
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
