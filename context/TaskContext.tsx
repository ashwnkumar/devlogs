'use client'
import { TaskType } from "@/types";
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

interface TaskContextType {
  tasks: TaskType[];
  fetchTasks: (projectId?: string, searchQuery?: string) => Promise<void>;
  addTask: (
    taskData: Omit<
      TaskType,
      | "id"
      | "user_id"
      | "created_at"
      | "updated_at"
      | "is_running"
      | "duration_minutes"
    >,
  ) => Promise<boolean>;
  editTask: (
    id: string,
    taskData: Partial<
      Omit<TaskType, "id" | "user_id" | "created_at" | "updated_at">
    >,
  ) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const { setGlobalLoading } = useGlobal();

  const fetchTasks = useCallback(
    async (projectId?: string, searchQuery?: string) => {
      if (!user) return;
      setGlobalLoading(true);
      try {
        const url = new URL("/api/tasks", window.location.origin);
        if (projectId) {
          url.searchParams.set("f", projectId);
        }
        if (searchQuery) {
          url.searchParams.set("q", searchQuery);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch tasks");
        }

        const { data } = await response.json();
        setTasks(data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to fetch tasks");
      } finally {
        setGlobalLoading(false);
      }
    },
    [user, setGlobalLoading],
  );

  const addTask = async (
    taskData: Omit<
      TaskType,
      | "id"
      | "user_id"
      | "created_at"
      | "updated_at"
      | "is_running"
      | "duration_minutes"
    >,
  ): Promise<boolean> => {
    const trimmedTitle = taskData.title.trim();
    if (!trimmedTitle) {
      toast.error("Task title cannot be empty");
      return false;
    }

    if (!taskData.project_id) {
      toast.error("Project is required");
      return false;
    }

    if (!taskData.task_type) {
      toast.error("Task type is required");
      return false;
    }

    setGlobalLoading(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskData,
          title: trimmedTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add task");
      }

      // Add the new task to the local state
      setTasks((prev) => [data.data, ...prev]);
      toast.success("Task added successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add task",
      );
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const editTask = async (
    id: string,
    taskData: Partial<
      Omit<TaskType, "id" | "user_id" | "created_at" | "updated_at">
    >,
  ): Promise<boolean> => {
    if (taskData.title && !taskData.title.trim()) {
      toast.error("Task title cannot be empty");
      return false;
    }

    setGlobalLoading(true);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update task");
      }

      // Update the task in the local state
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...data.data } : task)),
      );
      toast.success("Task updated successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update task",
      );
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    setGlobalLoading(true);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete task");
      }

      // Remove the task from the local state
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success("Task deleted successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete task",
      );
      return false;
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        fetchTasks,
        addTask,
        editTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
