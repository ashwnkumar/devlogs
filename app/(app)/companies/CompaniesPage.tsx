"use client";
import { DatePicker } from "@/components/form/DatePicker";
import InputComponent from "@/components/form/InputComponent";
import { TimePickerInput } from "@/components/form/TimePickerInput";
import PageHeader from "@/components/PageHeader";
import SheetComponent from "@/components/SheetComponent";
import TableComponent from "@/components/TableComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCompany } from "@/context/CompanyContext";
import { formatDate } from "@/lib/utils";
import { CompanyType, TableColumn } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";

function CompaniesPage() {
  const { companies, loading, addCompany, editCompany, deleteCompany } =
    useCompany();
  const [open, setOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyType | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    joined_at: new Date(),
    left_at: null as Date | null,
    is_current: false,
    work_start: new Date(new Date().setHours(9, 0, 0, 0)), // Default 9:00 AM
    work_end: new Date(new Date().setHours(18, 0, 0, 0)), // Default 6:00 PM
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrentToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_current: checked,
      left_at: checked ? null : prev.left_at,
    }));
  };

  const reset = () => {
    setFormData({
      name: "",
      location: "",
      joined_at: new Date(),
      left_at: null as Date | null,
      is_current: false,
      work_start: new Date(new Date().setHours(9, 0, 0, 0)),
      work_end: new Date(new Date().setHours(18, 0, 0, 0)),
    });
    setEditingCompany(null);
    setOpen(false);
  };

  const handleAddCompany = async () => {
    // Convert Date objects to time strings (HH:MM:SS format)
    const workStartStr = formData.work_start.toTimeString().split(" ")[0]; // "HH:MM:SS"
    const workEndStr = formData.work_end.toTimeString().split(" ")[0];

    const success = await addCompany({
      name: formData.name,
      location: formData.location,
      joined_at: formData.joined_at.toISOString(),
      left_at: formData.left_at ? formData.left_at.toISOString() : null,
      work_start: workStartStr,
      work_end: workEndStr,
    });

    if (success) {
      reset();
    }
  };

  const handleEditCompany = async (row: CompanyType) => {
    setEditingCompany(row);

    // Parse time strings (HH:MM:SS) to Date objects
    const parseTime = (timeStr: string): Date => {
      const [hours, minutes, seconds] = timeStr.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, seconds || 0, 0);
      return date;
    };

    setFormData({
      name: row.name,
      location: row.location,
      joined_at: new Date(row.joined_at),
      left_at: row.left_at ? new Date(row.left_at) : null,
      is_current: row.left_at === null,
      work_start: parseTime(row.work_start),
      work_end: parseTime(row.work_end),
    });
    setOpen(true);
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) return;

    // Convert Date objects to time strings (HH:MM:SS format)
    const workStartStr = formData.work_start.toTimeString().split(" ")[0];
    const workEndStr = formData.work_end.toTimeString().split(" ")[0];

    const success = await editCompany(editingCompany.id, {
      name: formData.name,
      location: formData.location,
      joined_at: formData.joined_at.toISOString(),
      left_at: formData.left_at ? formData.left_at.toISOString() : null,
      work_start: workStartStr,
      work_end: workEndStr,
    });

    if (success) {
      reset();
    }
  };

  const handleDeleteCompany = async (row: CompanyType) => {
    if (confirm(`Are you sure you want to delete "${row.name}"?`)) {
      await deleteCompany(row.id);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent form submission

    // Basic validation
    if (!formData.name.trim()) {
      return;
    }
    if (!formData.location.trim()) {
      return;
    }

    if (editingCompany) {
      handleUpdateCompany();
    } else {
      handleAddCompany();
    }
  };

  const columns: TableColumn<CompanyType>[] = [
    {
      label: "Name",
      key: "name",

      render: (row: CompanyType) => (
        <div className="flex items-center gap-2 ">
          <span>{row.name}</span>

          {row.left_at === null && (
            <span className="">
              <Badge>Current</Badge>
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Location",
      key: "location",
    },
    {
      label: "Working Hours",
      key: "work_start",
      render: (row: CompanyType) => {
        return `${row.work_start} - ${row.work_end}`;
      },
    },
    {
      label: "Joined At",
      key: "joined_at",

      render: (row: CompanyType) =>
        new Date(row.joined_at).toLocaleDateString(),
    },
    {
      label: "Left At",
      key: "left_at",

      render: (row: CompanyType) =>
        row.left_at ? new Date(row.left_at).toLocaleDateString() : "NA",
    },
    {
      label: "Created At",
      key: "created_at",
      render: (row: CompanyType) => formatDate(row.created_at, "date"),
    },
    {
      label: "Updated At",
      key: "updated_at",
      render: (row: CompanyType) => formatDate(row.updated_at, "date"),
    },
  ];

  const headerActions = [
    {
      label: "Add",
      icon: Plus,
      onClick: () => {
        reset(); // Reset form for new company
        setOpen(true);
      },
    },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <PageHeader title="Companies" actions={headerActions} />
      <TableComponent<CompanyType>
        data={companies}
        columns={columns}
        onEdit={handleEditCompany}
        onDelete={handleDeleteCompany}
        loading={loading}
      />

      <SheetComponent
        open={open}
        onOpenChange={setOpen}
        title={editingCompany ? "Edit Company" : "Add Company"}
      >
        <form
          id="company-form"
          className="flex flex-col items-center gap-4 w-full"
          onSubmit={handleSubmit}
        >
          <InputComponent
            name="name"
            label="Name"
            className="w-full"
            required
            value={formData.name}
            onChange={handleInputChange}
          />

          <InputComponent
            name="location"
            label="Location"
            className="w-full"
            required
            value={formData.location}
            onChange={handleInputChange}
          />

          <input
            type="hidden"
            name="joined_at"
            value={formData.joined_at.toISOString()}
          />
          <DatePicker
            label="Joined At"
            required
            value={formData.joined_at}
            onChange={(date) =>
              date && setFormData((p) => ({ ...p, joined_at: date }))
            }
          />
          {!formData.is_current && (
            <DatePicker
              label="Left At"
              disabled={formData.is_current}
              value={formData.left_at ?? undefined}
              onChange={(date) =>
                setFormData((p) => ({ ...p, left_at: date ?? null }))
              }
            />
          )}

          <div className="col-span-2 flex items-center gap-2 w-full">
            <Switch
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={(checked) =>
                handleCurrentToggle(Boolean(checked))
              }
            />
            <label
              htmlFor="is_current"
              className="text-sm font-medium leading-none"
            >
              I&apos;m currently working here
            </label>
          </div>

          {/* Working Hours Section */}
          <div className="w-full space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Working Hours
            </h3>
            <p className="text-xs text-muted-foreground">
              Set default working hours for this company. These will be used for
              holiday and leave logs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <TimePickerInput
              label="Start Time"
              value={formData.work_start}
              onChange={(time) =>
                time && setFormData((p) => ({ ...p, work_start: time }))
              }
              required
            />
            <TimePickerInput
              label="End Time"
              value={formData.work_end}
              onChange={(time) =>
                time && setFormData((p) => ({ ...p, work_end: time }))
              }
              required
            />
          </div>

          <div className="flex flex-col items-center gap-2 w-full">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Processing..."
                : editingCompany
                  ? "Update Company"
                  : "Add Company"}
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

export default CompaniesPage;
