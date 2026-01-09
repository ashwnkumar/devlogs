"use client";

import PageHeader from "@/components/PageHeader";
import TableComponent from "@/components/TableComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/context/GlobalContext";
import { Copy, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TaskType = {
  id: number;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
};

function TaskTypesPage() {
  
  const {taskTypes, globalLoading} = useGlobal();


  const handleCopyColor = (e: React.MouseEvent<HTMLButtonElement> ,color: string) => {
    e.stopPropagation()
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
            onClick={(e) => handleCopyColor(e, row.color)}
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
      <TableComponent data={taskTypes} columns={columns} loading={globalLoading} />
    </div>
  );
}

export default TaskTypesPage;
