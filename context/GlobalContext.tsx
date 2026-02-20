"use client";
import { TaskTypeType } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { useCompany } from "./CompanyContext";
import { useProject } from "./ProjectContext";

type ChecklistItem = {
  id: "companies" | "projects" | "name";
  label: string;
  route: string;
  status: boolean;
};

type GlobalContextType = {
  taskTypes: TaskTypeType[];
  globalLoading: boolean;
  setGlobalLoading: (globalLoading: boolean) => void;
  fetchTaskTypes: () => Promise<void>;
  editTaskType: (id: string, name: string) => Promise<boolean>;
  checklist: ChecklistItem[];
};

const GlobalContext = createContext<GlobalContextType | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { companies } = useCompany();
  const { projects } = useProject();
  const [taskTypes, setTaskTypes] = useState<TaskTypeType[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "name",
      label: "Update your name in your profile",
      route: "/settings?tab=profile",
      status: false,
    },
    {
      id: "companies",
      label: "Add your company",
      route: "/companies",
      status: false,
    },
    {
      id: "projects",
      label: "Create your first project",
      route: "/projects",
      status: false,
    },
  ]);


  const fetchTaskTypes = useCallback(async () => {
    if (!user) return;
    setGlobalLoading(true);
    try {
      const response = await fetch("/api/task-types");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch task types");
      }

      const { data } = await response.json();
      setTaskTypes(data || []);
    } catch (error) {
      console.error("Error fetching task types:", error);
    } finally {
      setGlobalLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const editTaskType = async (id: string, name: string): Promise<boolean> => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Task type name cannot be empty");
      return false;
    }

    setGlobalLoading(true);
    try {
      const response = await fetch(`/api/task-types/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update task type");
      }

      // Update the task type in the local state
      setTaskTypes((prev) =>
        prev.map((taskType) =>
          taskType.id === id ? { ...taskType, ...data.data } : taskType,
        ),
      );
      toast.success("Task type updated successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update task type",
      );
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTaskTypes();
    }
  }, [user?.id, fetchTaskTypes]);

  const hasName = useCallback((): boolean => {
    if (!user?.email) return false;

    const emailClean = user.email.split("@")[0];
    return user.name !== emailClean;
  }, [user]);

  useEffect(() => {
    setChecklist((prev) =>
      prev.map((item) => {
        switch (item.id) {
          case "companies":
            return { ...item, status: companies.length > 0 };

          case "projects":
            return { ...item, status: projects.length > 0 };

          case "name":
            return { ...item, status: hasName() };

          default:
            return item;
        }
      }),
    );
  }, [companies.length, projects.length, hasName]);

  return (
    <GlobalContext.Provider
      value={{
        taskTypes,
        globalLoading,
        setGlobalLoading,
        fetchTaskTypes,
        editTaskType,
        checklist,
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
