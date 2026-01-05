"use client";

import PageHeader from "@/components/PageHeader";
import TableComponent from "@/components/TableComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Copy, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TaskType = {
  id: number;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
};

function TaskTypesPage() {
  const { user } = useAuth();
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("task_types")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(`Something went wrong: ${error.message}`);
        console.error("Error fetching task types:", error);
      } else {
        setTaskTypes(data);
      }
    };

    if (user) {
      fetch();
    }
  }, [user]);

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`Color ${color} copied to clipboard!`);
  };

  const columns = [
    { label: "Name", key: "name" },
    {
      label: "Color (OKLCH)",
      key: "color",
      render: (row: TaskType) => (
        <div className="flex items-center gap-2">
          <div
            className="rounded aspect-square w-6 h-6"
            style={{ backgroundColor: row.color }}
          />
          <Button
            variant={"ghost"}
            size={"icon"}
            className="hover:bg-background!"
            onClick={() => handleCopyColor(row.color)}
          >
            <Copy />
          </Button>
        </div>
      ),
    },
    {
      label: "Preview",
      key: "color",
      render: (row: TaskType) => (
        <Badge style={{ backgroundColor: row.color }}> {row.name} </Badge>
      ),
    },
    {
      label: "Created At",
      key: "created_at",
      render: (row: TaskType) => (
        <span>{new Date(row.created_at).toLocaleString()}</span>
      ),
    },
    {
      label: "Updated At",
      key: "updated_at",
      render: (row: TaskType) => (
        <span>{new Date(row.updated_at).toLocaleString()}</span>
      ),
    },
  ];

  const headerActions = [
    { label: "Add Task Type", onClick: () => {}, icon: Plus },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-start gap-6">
      <PageHeader title="Task Types" />
      <TableComponent data={taskTypes} columns={columns} />
    </div>
  );
}

export default TaskTypesPage;
