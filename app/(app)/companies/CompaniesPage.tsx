"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import CustomDialog from "@/components/CustomDialog";
import { DatePicker } from "@/components/form/DatePicker";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import TableComponent from "@/components/TableComponent";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useGlobal } from "@/context/GlobalContext";
import { CompanyType, TableColumn } from "@/types";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { addCompany, updateCompany, deleteCompany } from "./actions";

function CompaniesPage() {
  const [isPending, startTransition] = useTransition();
  const { companies } = useGlobal();

  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<number>(1);

  const isCurrentlyWorking = companies.some(
    (company) => company.left_at === null,
  );

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    joined_at: new Date(),
    left_at: null as Date | null,
    is_current: false,
  });

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedId(null);
    setFormData({
      name: "",
      location: "",
      joined_at: new Date(),
      left_at: null,
      is_current: false,
    });
  };

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

  const handleSaveCompany = (formDataObj: FormData) => {
    startTransition(async () => {
      try {
        const result = selectedId
          ? await updateCompany(formDataObj)
          : await addCompany(formDataObj);

        toast.success(result.message);
        setRefresh((prev) => prev + 1);
        handleCloseDialog();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred",
        );
      }
    });
  };

  const handleDeleteRow = () => {
    if (!selectedId) return;

    const formData = new FormData();
    formData.append("id", selectedId);

    startTransition(async () => {
      try {
        const result = await deleteCompany(formData);
        toast.success(result.message);
        setRefresh((prev) => prev + 1);
        setConfirm(false);
        setSelectedId(null);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred",
        );
      }
    });
  };

  const handleEditRow = (row: CompanyType) => {
    setSelectedId(row.id);
    setFormData({
      name: row.name,
      location: row.location,
      joined_at: new Date(row.joined_at),
      left_at: row.left_at ? new Date(row.left_at) : null,
      is_current: row.left_at === null,
    });
    setOpen(true);
  };

  const handleAddCompany = () => {
    if (isCurrentlyWorking) {
      toast.info(
        "You are currently working at a company. Please leave your current company first.",
      );
      return;
    }

    setSelectedId(null);
    setFormData({
      name: "",
      location: "",
      joined_at: new Date(),
      left_at: null,
      is_current: false,
    });
    setOpen(true);
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
    { label: "Location", key: "location" },
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
      render: (row: CompanyType) => new Date(row.created_at).toLocaleString(),
    },
    {
      label: "Updated At",
      key: "updated_at",
      render: (row: CompanyType) => new Date(row.updated_at).toLocaleString(),
    },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <PageHeader
        title="Companies"
        actions={[{ label: "Add Company", onClick: handleAddCompany }]}
      />

      <TableComponent<CompanyType>
        dataPath="/companies"
        revalidate={refresh}
        columns={columns}
        actions={[
          { label: "Edit", icon: Edit, onClick: handleEditRow },
          {
            label: "Delete",
            icon: Trash2,
            onClick: (row: CompanyType) => {
              setSelectedId(row.id);
              setConfirm(true);
            },
          },
        ]}
        filterConfig={{
          data: companies,
          label: "Filter By Companies",
          labelKey: "name",
          valueKey: "id",
          searchPlaceholder: "Search Companies",
        }}
      />

      <CustomDialog
        title={selectedId ? "Edit Company" : "Add Company"}
        open={open}
        onOpenChange={setOpen}
        onCancel={handleCloseDialog}
        onConfirm={() => {
          const form = document.getElementById(
            "company-form",
          ) as HTMLFormElement;
          if (form) {
            const formData = new FormData(form);
            handleSaveCompany(formData);
          }
        }}
        confirmText={selectedId ? "Update Company" : "Add Company"}
        isPending={isPending}
      >
        <form id="company-form" className="grid grid-cols-2 gap-4">
          {selectedId && <input type="hidden" name="id" value={selectedId} />}
          <InputComponent
            name="name"
            label="Name"
            required
            value={formData.name}
            onChange={handleInputChange}
          />

          <InputComponent
            name="location"
            label="Location"
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

          <input
            type="hidden"
            name="left_at"
            value={formData.left_at?.toISOString() ?? ""}
          />
          <DatePicker
            label="Left At"
            disabled={formData.is_current}
            value={formData.left_at ?? undefined}
            onChange={(date) =>
              setFormData((p) => ({ ...p, left_at: date ?? null }))
            }
          />

          <input
            type="hidden"
            name="is_current"
            value={formData.is_current.toString()}
          />
          <div className="col-span-2 flex items-center gap-2">
            <Checkbox
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
        </form>
      </CustomDialog>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Are you sure?"
        description="This action cannot be undone."
        onConfirm={handleDeleteRow}
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}

export default CompaniesPage;
