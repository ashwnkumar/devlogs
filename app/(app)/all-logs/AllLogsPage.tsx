"use client";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";
import AddLogDialog from "./AddLogDialog";
import TableComponent from "@/components/TableComponent";
import { useGlobal } from "@/context/GlobalContext";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TaskType } from "@/types";

function AllLogsPage() {
  const { currentProjects, taskTypes } = useGlobal();
  const [open, setOpen] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(1);

  const headerActions = [{ label: "Add Log", onClick: () => setOpen(true) }];

  const getProject = (id: string) => {
    return currentProjects.find((i) => i.id === id)?.name;
  };
  const getTaskType = (id: string) => {
    return taskTypes.find((i) => i.id === id);
  };

  const columns = [
    { label: "Title", key: "title" },
    {
      label: "Project",
      key: "project_id",
      render: (row: TaskType) => getProject(row.project_id),
    },
    {
      label: "Task Type",
      key: "task_type",
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
      label: "Created At",
      key: "created_at",
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
      <PageHeader title="All Logs" actions={headerActions} />
      <div className="flex items-center "></div>
      <TableComponent
        filterConfig={filterConfig}
        dataPath="/tasks"
        revalidate={refresh}
        columns={columns}
        emptyMessage="No Projects Found. Add A Project to View Them Here"
      />
      <AddLogDialog
        open={open}
        onOpenChange={setOpen}
        onAddComplete={() => setRefresh((prev) => prev + 1)}
      />
    </div>
  );
}

export default AllLogsPage;
