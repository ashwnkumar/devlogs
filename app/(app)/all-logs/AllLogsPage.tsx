"use client";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import SheetComponent from "@/components/SheetComponent";
import TableComponent from "@/components/TableComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DropdownComponent } from "@/components/form/DropdownComponent";
import { useTask } from "@/context/TaskContext";
import { useProject } from "@/context/ProjectContext";
import { useGlobal } from "@/context/GlobalContext";
import { formatDate } from "@/lib/utils";
import { TaskType, ProjectType, TaskTypeType, TableColumn } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";

function AllLogsPage() {
  const { globalLoading, taskTypes } = useGlobal();
  const { tasks, addTask, editTask, deleteTask } = useTask();
  const { projects } = useProject();
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    project_id: "",
    task_type: "",
    start_time: new Date(),
    end_time: null as Date | null,
    is_overtime: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOvertimeToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_overtime: checked,
    }));
  };

  const reset = () => {
    setFormData({
      title: "",
      project_id: "",
      task_type: "",
      start_time: new Date(),
      end_time: null as Date | null,
      is_overtime: false,
    });
    setEditingTask(null);
    setOpen(false);
  };

  const handleAddTask = async () => {
    const success = await addTask({
      title: formData.title,
      project_id: formData.project_id,
      task_type: formData.task_type,
      start_time: formData.start_time.toISOString(),
      end_time: formData.end_time ? formData.end_time.toISOString() : null,
      is_overtime: formData.is_overtime,
    });

    if (success) {
      reset();
    }
  };

  const handleEditTask = async (row: TaskType) => {
    setEditingTask(row);
    setFormData({
      title: row.title,
      project_id: row.project_id,
      task_type: row.task_type,
      start_time: new Date(row.start_time),
      end_time: row.end_time ? new Date(row.end_time) : null,
      is_overtime: row.is_overtime,
    });
    setOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    const success = await editTask(editingTask.id, {
      title: formData.title,
      project_id: formData.project_id,
      task_type: formData.task_type,
      start_time: formData.start_time.toISOString(),
      end_time: formData.end_time ? formData.end_time.toISOString() : null,
      is_overtime: formData.is_overtime,
    });

    if (success) {
      reset();
    }
  };

  const handleDeleteTask = async (row: TaskType) => {
    if (confirm(`Are you sure you want to delete "${row.title}"?`)) {
      await deleteTask(row.id);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent form submission

    // Basic validation
    if (!formData.title.trim()) {
      return;
    }
    if (!formData.project_id.trim()) {
      return;
    }
    if (!formData.task_type.trim()) {
      return;
    }

    if (editingTask) {
      await handleUpdateTask();
    } else {
      await handleAddTask();
    }
  };

  const getProjectName = (projectId: string): string => {
    const project = projects.find((p: ProjectType) => p.id === projectId);
    return project?.name || "NA";
  };

  const getTaskTypeName = (taskTypeId: string): TaskTypeType | undefined => {
    return taskTypes.find((t: TaskTypeType) => t.id === taskTypeId);
  };

  const columns: TableColumn<TaskType>[] = [
    {
      label: "Title",
      key: "title",
    },
    {
      label: "Project",
      key: "project_id",
      render: (row: TaskType) => getProjectName(row.project_id),
    },
    {
      label: "Task Type",
      key: "task_type",
      render: (row: TaskType) => {
        const taskType = getTaskTypeName(row.task_type);
        return taskType ? (
          <Badge style={{ backgroundColor: taskType.color }}>
            {taskType.name}
          </Badge>
        ) : (
          "NA"
        );
      },
    },
    {
      label: "Start Time",
      key: "start_time",
      render: (row: TaskType) => formatDate(row.start_time, "time"),
    },
    {
      label: "End Time",
      key: "end_time",
      render: (row: TaskType) =>
        row.end_time ? (
          formatDate(row.end_time, "time")
        ) : (
          <Badge>Current Task</Badge>
        ),
    },
    {
      label: "Overtime",
      key: "is_overtime",
      render: (row: TaskType) => (
        <Badge variant={row.is_overtime ? "destructive" : "secondary"}>
          {row.is_overtime ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      label: "Created At",
      key: "created_at",
      render: (row: TaskType) => formatDate(row.created_at, "date"),
    },
  ];

  const headerActions = [
    {
      label: "Add",
      icon: Plus,
      onClick: () => {
        reset(); // Reset form for new task
        setOpen(true);
      },
    },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <PageHeader title="All Logs" actions={headerActions} />
      <TableComponent<TaskType>
        data={tasks}
        columns={columns}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        loading={globalLoading}
      />

      <SheetComponent
        open={open}
        onOpenChange={setOpen}
        title={editingTask ? "Edit Task" : "Add Task"}
      >
        <form
          id="task-form"
          className="flex flex-col items-center gap-4 w-full"
          onSubmit={handleSubmit}
        >
          <InputComponent
            name="title"
            label="Task Title"
            className="w-full"
            required
            value={formData.title}
            onChange={handleInputChange}
          />

          <DropdownComponent
            label="Project"
            required
            value={formData.project_id}
            onValueChange={(value) => handleSelectChange("project_id", value)}
            options={projects.map((project) => ({
              label: project.name,
              value: project.id,
            }))}
            placeholder="Select a project"
          />

          <DropdownComponent
            label="Task Type"
            required
            value={formData.task_type}
            onValueChange={(value) => handleSelectChange("task_type", value)}
            options={taskTypes.map((taskType) => ({
              label: taskType.name,
              value: taskType.id,
            }))}
            placeholder="Select a task type"
          />

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium">
              Start Time <span className="text-destructive ml-1">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.start_time.toISOString().slice(0, 16)}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  start_time: new Date(e.target.value),
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium">End Time</label>
            <input
              type="datetime-local"
              value={
                formData.end_time
                  ? formData.end_time.toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  end_time: e.target.value ? new Date(e.target.value) : null,
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="col-span-2 flex items-center gap-2 w-full">
            <Switch
              id="is_overtime"
              checked={formData.is_overtime}
              onCheckedChange={(checked) =>
                handleOvertimeToggle(Boolean(checked))
              }
            />
            <label
              htmlFor="is_overtime"
              className="text-sm font-medium leading-none"
            >
              Overtime Task
            </label>
          </div>

          <div className="flex flex-col items-center gap-2 w-full">
            <Button type="submit" className="w-full" disabled={globalLoading}>
              {globalLoading
                ? "Processing..."
                : editingTask
                  ? "Update Task"
                  : "Add Task"}
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

export default AllLogsPage;
