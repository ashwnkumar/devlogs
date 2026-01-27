"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { DropdownComponent } from "@/components/form/DropdownComponent";
import TableComponent from "@/components/TableComponent";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import InputComponent from "@/components/form/InputComponent";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  data: unknown;
  company_id: string;
  projects: { label: string; value: string }[];
  taskTypes: { label: string; value: string }[];
};

type Row = {
  date: string;
  projectName: string;
  taskType: string;
  task: string;
  startTime: string;
  endTime: string;
};

function Preview({ data, company_id, projects, taskTypes }: Props) {
  const [tableData, setTableData] = useState<Row[]>([]);
  const [showEmpty, setShowEmpty] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTaskType, setSelectedTaskType] = useState<string>("");

  useEffect(() => {
    if (!data) return;
    setTableData(data as Row[]);
  }, [data]);

  const handleDeleteRow = (_row: Row, rowIdx: number) => {
    setTableData((prev) => prev.filter((_, idx) => idx !== rowIdx));
    toast.info("Removed Task");
  };

  const handleClearFilters = () => {
    setSelectedProject("");
    setSelectedTaskType("");
    setShowEmpty(false);
    toast.info("Filters cleared");
  };

  const columns = [
    {
      label: "Date",
      key: "date",
      render: (row: Row) =>
        row.date ? format(new Date(row.date), "dd-MM-yyyy") : "",
    },
    { label: "Project", key: "projectName", render:(row:Row) =>  <InputComponent className="w-52" value={row.projectName}  /> },
    { label: "Task Type", key: "taskType", render: (row: Row) => <InputComponent value={row.taskType} /> },
    {
      label: "Description",
      key: "task",
      render: (row: Row) => (
       <Textarea value={row.task} />
      ),
    },
    {
      label: "Start Time",
      key: "startTime",
      render: (row: Row) =>
        row.startTime ? format(new Date(row.startTime), "HH:mm") : "",
    },
    {
      label: "End Time",
      key: "endTime",
      render: (row: Row) =>
        row.endTime ? format(new Date(row.endTime), "HH:mm") : "",
    },
  ];

  const filteredData = useMemo(() => {
    let filtered = tableData;

    // Filter by project
    if (selectedProject) {
      filtered = filtered.filter((row) => row.projectName === selectedProject);
    }

    // Filter by task type
    if (selectedTaskType) {
      filtered = filtered.filter((row) => row.taskType === selectedTaskType);
    }

    // Filter by empty rows
    if (showEmpty) {
      filtered = filtered.filter((row) =>
        Object.values(row).some(
          (value) => value === "" || value === null || value === undefined,
        ),
      );
    }

    return filtered;
  }, [tableData, showEmpty, selectedProject, selectedTaskType]);

  return (
    <div className="w-full h-full flex flex-col items-center gap-4">
      <div className="flex flex-col items-start gap-2 w-full border rounded p-4">
        <div className="flex items-center justify-between w-full">
          <p className="font-semibold">Filters:</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DropdownComponent
            options={projects}
            label="Projects"
            value={selectedProject}
            onValueChange={setSelectedProject}
            placeholder="All Projects"
          />
          <DropdownComponent
            options={taskTypes}
            label="Task Types"
            value={selectedTaskType}
            onValueChange={setSelectedTaskType}
            placeholder="All Task Types"
          />

          <div className="flex flex-col items-start gap-3">
            <p className="text-sm font-medium">Empty Rows:</p>
            <div className="flex items-center gap-2">
              <Switch
                id="empty"
                checked={showEmpty}
                onCheckedChange={setShowEmpty}
              />
              <Label htmlFor="empty">Show only empty rows</Label>
            </div>
          </div>
        </div>
      </div>

      <TableComponent
        data={filteredData}
        columns={columns}
        disableClick
        hideEdit
        onDelete={handleDeleteRow}
      />
    </div>
  );
}

export default Preview;
