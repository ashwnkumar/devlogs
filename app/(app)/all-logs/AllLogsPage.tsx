"use client";
import PageHeader from "@/components/PageHeader";
import TableComponent from "@/components/TableComponent";
import { useGlobal } from "@/context/GlobalContext";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TaskType } from "@/types";

function AllLogsPage() {
  const { currentProjects, taskTypes } = useGlobal();

  const getProject = (id: string) => {
    return currentProjects.find((i) => i.id === id)?.name;
  };
  const getTaskType = (id: string) => {
    return taskTypes.find((i) => i.id === id);
  };

  const columns = [
    {
      label: "Title",
      key: "title",
      dataType: "text" as const,
      editable: true,
      addable: true,
      required: true,
      placeholder: "Enter task title",
    },
    {
      label: "Project",
      key: "project_id",
      dataType: "select" as const,
      editable: true,
      addable: true,
      required: true,
      options: currentProjects.map((project) => ({
        label: project.name,
        value: project.id,
      })),
      render: (row: TaskType) => getProject(row.project_id),
    },
    {
      label: "Task Type",
      key: "task_type",
      dataType: "select" as const,
      editable: true,
      addable: true,
      required: true,
      options: taskTypes.map((type) => ({
        label: type.name,
        value: type.id,
      })),
      render: (row: TaskType) => {
        const item = getTaskType(row.task_type);
        return (
          <Badge style={{ backgroundColor: item?.color }}> {item?.name} </Badge>
        );
      },
    },
    {
      label: "Start Time",
      key: "start_time",
      dataType: "time" as const,
      editable: true,
      addable: true,
      required: true,
      defaultValue: new Date().toISOString(),
      render: (row: TaskType) => formatDate(row.start_time, "time"),
    },
    {
      label: "End Time",
      key: "end_time",
      dataType: "time" as const,
      editable: true,
      addable: false,
      required: false,
      render: (row: TaskType) =>
        row.end_time ? (
          formatDate(row.end_time, "time")
        ) : (
          <Badge>Current Task</Badge>
        ),
    },

    {
      label: "Created At",
      key: "created_at",
      dataType: "date" as const,
      editable: false,
      addable: false,
      required: false,
      render: (row: TaskType) => formatDate(row.created_at),
    },
  ];

  const filterConfig = {
    data: currentProjects,
    label: "Filter By Projects",
    labelKey: "name",
    valueKey: "id",
    searchPlaceholder: "Search Tasks",
  };

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <PageHeader title="All Logs" />
      <TableComponent
        filterConfig={filterConfig}
        dataPath="/tasks"
        columns={columns}
        enableAdd={true}
        enableEdit={true}
        enableDelete={true}
        addButtonLabel="Add Log"
        emptyMessage="No Projects Found. Add A Project to View Them Here"
      />
    </div>
  );
}

export default AllLogsPage;
