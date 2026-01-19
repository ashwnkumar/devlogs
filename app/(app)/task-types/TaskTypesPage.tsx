"use client";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import SheetComponent from "@/components/SheetComponent";
import TableComponent from "@/components/TableComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/context/GlobalContext";
import { formatDate } from "@/lib/utils";
import { TaskTypeType, TableColumn } from "@/types";
import { Plus, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function TaskTypesPage() {
  const { taskTypes, globalLoading, editTaskType } = useGlobal();
  const [open, setOpen] = useState(false);
  const [editingTaskType, setEditingTaskType] = useState<TaskTypeType | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    color: "#000000",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setFormData({
      name: "",
      color: "#000000",
    });
    setEditingTaskType(null);
    setOpen(false);
  };

  const handleAddTaskType = async () => {
    // TODO: Implement add functionality
    console.log("Add task type:", formData);
    toast.info("Add functionality will be implemented later");
    reset();
  };

  const handleEditTaskType = async (row: TaskTypeType) => {
    setEditingTaskType(row);
    setFormData({
      name: row.name,
      color: row.color,
    });
    setOpen(true);
  };

  const handleUpdateTaskType = async () => {
    if (!editingTaskType) return;

    const success = await editTaskType(editingTaskType.id, formData.name);
    if (success) {
      reset();
    }
  };

  const handleDeleteTaskType = async (row: TaskTypeType) => {
    // TODO: Implement delete functionality
    console.log("Delete task type:", row);
    toast.info("Delete functionality will be implemented later");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent form submission

    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Task type name is required");
      return;
    }
    if (!formData.color.trim()) {
      toast.error("Color is required");
      return;
    }

    if (editingTaskType) {
      await handleUpdateTaskType();
    } else {
      await handleAddTaskType();
    }
  };

  const handleCopyColor = (
    e: React.MouseEvent<HTMLButtonElement>,
    color: string,
  ) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color);
    toast.success(`Color ${color} copied to clipboard!`);
  };

  const columns: TableColumn<TaskTypeType>[] = [
    {
      label: "Name",
      key: "name",
    },
    {
      label: "Color",
      key: "color",
      render: (row: TaskTypeType) => (
        <div className="flex items-center gap-2">
          <div
            className="rounded aspect-square w-6 h-6 border"
            style={{ backgroundColor: row.color }}
          />
          <span className="font-mono text-sm">{row.color}</span>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="h-6 w-6"
            onClick={(e) => handleCopyColor(e, row.color)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      label: "Preview",
      key: "preview",
      render: (row: TaskTypeType) => (
        <Badge style={{ backgroundColor: row.color }}>{row.name}</Badge>
      ),
    },
    {
      label: "Created At",
      key: "created_at",
      render: (row: TaskTypeType) => formatDate(row.created_at, "date"),
    },
    {
      label: "Updated At",
      key: "updated_at",
      render: (row: TaskTypeType) => formatDate(row.updated_at, "date"),
    },
  ];

  const headerActions = [
    {
      label: "Add",
      icon: Plus,
      onClick: () => {
        reset(); // Reset form for new task type
        setOpen(true);
      },
    },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <PageHeader title="Task Types" actions={headerActions} />
      <TableComponent<TaskTypeType>
        data={taskTypes}
        columns={columns}
        onEdit={handleEditTaskType}
        onDelete={handleDeleteTaskType}
        loading={globalLoading}
      />

      <SheetComponent
        open={open}
        onOpenChange={setOpen}
        title={editingTaskType ? "Edit Task Type" : "Add Task Type"}
      >
        <form
          id="task-type-form"
          className="flex flex-col items-center gap-4 w-full"
          onSubmit={handleSubmit}
        >
          <InputComponent
            name="name"
            label="Task Type Name"
            className="w-full"
            required
            value={formData.name}
            onChange={handleInputChange}
          />

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium">
              Color <span className="text-destructive ml-1">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-12 h-10 rounded border border-input cursor-pointer"
                required
                disabled={!!editingTaskType}
              />
              <InputComponent
                name="color"
                label=""
                className="flex-1"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="#000000"
                disabled={!!editingTaskType}
              />
            </div>
            {editingTaskType && (
              <p className="text-xs text-muted-foreground">
                Color cannot be changed when editing
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 w-full p-3 border rounded-md bg-muted/50">
            <span className="text-sm text-muted-foreground">Preview:</span>
            <Badge style={{ backgroundColor: formData.color }}>
              {formData.name || "Task Type Name"}
            </Badge>
          </div>

          <div className="flex flex-col items-center gap-2 w-full">
            <Button type="submit" className="w-full" disabled={globalLoading}>
              {globalLoading
                ? "Processing..."
                : editingTaskType
                  ? "Update Task Type"
                  : "Add Task Type"}
            </Button>
            <Button
              type="button"
              variant={"outline"}
              className="w-full"
              onClick={reset}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetComponent>
    </div>
  );
}

export default TaskTypesPage;
