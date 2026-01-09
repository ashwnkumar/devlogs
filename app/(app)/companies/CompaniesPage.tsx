"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import CustomDialog from "@/components/CustomDialog";
import { DatePicker } from "@/components/form/DatePicker";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import TableComponent from "@/components/TableComponent";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { CompanyType } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

function CompaniesPage() {
  const { user } = useAuth();

  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isCurrentlyWorking = companies.some(
    (company) => company.left_at === null
  );

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    joined_at: new Date(),
    left_at: null as Date | null,
    is_current: false,
  });

  const validateForm = () => {
    return (
      formData.name.trim() && formData.location.trim() && formData.joined_at
    );
  };

  const fetchCompanies = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load companies");
      console.error(error);
    } else {
      setCompanies(data || []);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

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

  const handleSaveCompany = async () => {
    if (!validateForm()) {
      return toast.error("Please fill all required fields");
    }

    const supabase = await createClient();

    const payload = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      joined_at: formData.joined_at.toISOString(),
      left_at: formData.is_current
        ? null
        : formData.left_at?.toISOString() ?? null,
    };

    if (selectedId) {
      const { error } = await supabase
        .from("companies")
        .update(payload)
        .eq("id", selectedId);

      if (error) {
        toast.error(`Update failed: ${error.message}`);
        console.error(error);
      } else {
        if (formData.is_current) {
          const { error } = await supabase
            .from("users")
            .update({ current_company: selectedId })
            .eq("id", user?.id)
            .select();

          if (error) {
            toast.error(`Update error: ${error.message}`);
            console.error(error);
          } else {
            toast.success("Current company updated successfully");
          }
        }

        toast.success("Company updated successfully");
        await fetchCompanies();
        handleCloseDialog();
      }
    } else {
      const { data: companyData, error: addErr } = await supabase
        .from("companies")
        .insert({
          ...payload,
          user_id: user?.id,
        })
        .select()
        .single();

      if (addErr) {
        toast.error(`Failed to add company: ${addErr.message}`);
        console.error(addErr);
      } else {
        if (formData.is_current) {
          const { error } = await supabase
            .from("users")
            .update({ current_company: companyData.id })
            .eq("id", user?.id)
            .select();

          if (error) {
            toast.error(`Update error: ${error.message}`);
            console.error(error);
          } else {
            toast.success("Current company updated successfully");
          }
        }

        toast.success("Company added successfully");
        await fetchCompanies();
        handleCloseDialog();
      }
    }
  };

  const handleDeleteRow = async () => {
    if (!selectedId) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", selectedId);

    if (error) {
      toast.error(`Delete failed: ${error.message}`);
      console.error(error);
    } else {
      toast.success("Company deleted successfully");
      await fetchCompanies();
      handleCloseDialog();
    }
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
        "You are currently working at a company. Please leave your current company first."
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

  const columns = [
    {
      label: "Name",
      key: "name",
      render: (row: CompanyType) =>
        row.left_at === null ? (
          <div className="flex items-center gap-2">
            <span>{row.name}</span>
            <Badge>Current</Badge>
          </div>
        ) : (
          row.name
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

      <TableComponent
        data={companies}
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
      />

      <CustomDialog
        title={selectedId ? "Edit Company" : "Add Company"}
        open={open}
        onOpenChange={setOpen}
        onCancel={handleCloseDialog}
        onConfirm={handleSaveCompany}
        confirmText={selectedId ? "Update Company" : "Add Company"}
      >
        <div className="grid grid-cols-2 gap-4">
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

          <DatePicker
            label="Joined At"
            required
            value={formData.joined_at}
            onChange={(date) =>
              date && setFormData((p) => ({ ...p, joined_at: date }))
            }
          />

          <DatePicker
            label="Left At"
            disabled={formData.is_current}
            value={formData.left_at ?? undefined}
            onChange={(date) =>
              setFormData((p) => ({ ...p, left_at: date ?? null }))
            }
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
        </div>
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
