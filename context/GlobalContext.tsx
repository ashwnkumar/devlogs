"use client";
import { TaskTypeType } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { useCompany } from "./CompanyContext";

type GlobalContextType = {
  taskTypes: TaskTypeType[];
  globalLoading: boolean;
  setGlobalLoading: (globalLoading: boolean) => void;
  fetchTaskTypes: () => Promise<void>;
  editTaskType: (id: string, name: string) => Promise<boolean>;
};

const GlobalContext = createContext<GlobalContextType | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [taskTypes, setTaskTypes] = useState<TaskTypeType[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);

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

  return (
    <GlobalContext.Provider
      value={{
        taskTypes,
        globalLoading,
        setGlobalLoading,
        fetchTaskTypes,
        editTaskType,
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
