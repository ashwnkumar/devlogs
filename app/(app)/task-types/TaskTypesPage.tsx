"use client";

import PageHeader from "@/components/PageHeader";
import TableComponent from "@/components/TableComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/context/GlobalContext";
import { Copy } from "lucide-react";
import { TaskTypeType, TableColumn } from "@/types";
import { toast } from "sonner";

function TaskTypesPage() {
  const { taskTypes } = useGlobal();

  const handleCopyColor = (
    e: React.MouseEvent<HTMLButtonElement>,
    color: string,
  ) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color);
    toast.success(`Color ${color} copied to clipboard!`);
  };

  const columns: TableColumn<TaskTypeType>[] = [
    { label: "Name", key: "name" },
    {
      label: "Color (OKLCH)",
      key: "color",
      render: (row: TaskTypeType) => (
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
      render: (row: TaskTypeType) => (
        <Badge style={{ backgroundColor: row.color }}> {row.name} </Badge>
      ),
    },
    {
      label: "Created At",
      key: "created_at",
      render: (row: TaskTypeType) => (
        <span>{new Date(row.created_at).toLocaleString()}</span>
      ),
    },
    {
      label: "Updated At",
      key: "updated_at",
      render: (row: TaskTypeType) => (
        <span>{new Date(row.updated_at).toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div className=" w-full h-full flex flex-col items-center justify-start gap-6">
      <TableComponent<TaskTypeType>
        title="Task Types"
        dataPath="/task-types"
        columns={columns}
        filterConfig={{
         
          searchPlaceholder: "Search Task Types",
        }}
        enableEdit={false}
        enableDelete={false}
        enableAdd={false}
      />
    </div>
  );
}

export default TaskTypesPage;
