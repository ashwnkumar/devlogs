"use client";
import { DatePicker } from "@/components/form/DatePicker";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import SheetComponent from "@/components/SheetComponent";
import TableComponent from "@/components/TableComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCompany } from "@/context/CompanyContext";
import { useGlobal } from "@/context/GlobalContext";
import { formatDate } from "@/lib/utils";
import { CompanyType, TableColumn } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";

function CompaniesPage() {
  const { globalLoading } = useGlobal();
  const { companies, addCompany, editCompany, deleteCompany } = useCompany();
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
    });
    setEditingCompany(null);
    setOpen(false);
  };

  const handleAddCompany = async () => {
    const success = await addCompany({
      name: formData.name,
      location: formData.location,
      joined_at: formData.joined_at.toISOString(),
      left_at: formData.left_at ? formData.left_at.toISOString() : null,
    });

    if (success) {
      reset();
    }
  };

  const handleEditCompany = async (row: CompanyType) => {
    setEditingCompany(row);
    setFormData({
      name: row.name,
      location: row.location,
      joined_at: new Date(row.joined_at),
      left_at: row.left_at ? new Date(row.left_at) : null,
      is_current: row.left_at === null,
    });
    setOpen(true);
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) return;

    const success = await editCompany(editingCompany.id, {
      name: formData.name,
      location: formData.location,
      joined_at: formData.joined_at.toISOString(),
      left_at: formData.left_at ? formData.left_at.toISOString() : null,
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
        loading={globalLoading}
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
              I’m currently working here
            </label>
          </div>
          <div className="flex flex-col items-center gap-2 w-full">
            <Button type="submit" className="w-full" disabled={globalLoading}>
              {globalLoading
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
