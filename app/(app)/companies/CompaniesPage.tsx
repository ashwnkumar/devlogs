"use client";
import ConfirmDialog from "@/components/ConfirmDialog";
import CustomDialog from "@/components/CustomDialog";
import { DatePicker } from "@/components/form/DatePicker";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import TableComponent from "@/components/TableComponent";
import { Badge } from "@/components/ui/badge";
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

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    joined_at: new Date(),
    left_at: null as Date | null,
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
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
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
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      left_at: formData.left_at ? formData.left_at.toISOString() : null,
    };

    if (selectedId) {
      const { error } = await supabase
        .from("companies")
        .update(payload)
        .eq("id", selectedId)
        .select();

      if (error) {
        toast.error(`Update failed: ${error.message}`);
        console.error(error);
      } else {
        toast.success("Company updated successfully");
        await fetchCompanies();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase
        .from("companies")
        .insert({
          ...payload,
          user_id: user?.id,
        })
        .select();

      if (error) {
        toast.error(`Add failed: ${error.message}`);
        console.error(error);
      } else {
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
      .eq("id", selectedId)
      .select();

    if (error) {
      toast.error(`Delete failed: ${error.message}`);
      console.error(error);
    } else {
      toast.success("Company deleted successfully");
      await fetchCompanies();
      handleCloseDialog();
    }
  };

  const handleEditRow = (row: any) => {
    setSelectedId(row.id);
    setFormData({
      name: row.name,
      location: row.location,
      joined_at: row.joined_at ? new Date(row.joined_at) : new Date(),
      left_at: row.left_at ? new Date(row.left_at) : null,
    });
    setOpen(true);
  };

  const columns = [
    {
      label: "Name",
      key: "name",
      render: (row: CompanyType) =>
        !row.left_at ? (
          <div className="flex items-center gap-2">
            <span>{row.name}</span>
            <Badge>Current</Badge>
          </div>
        ) : (
          <span>{row.name}</span>
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
        row.joined_at ? new Date(row.joined_at).toLocaleDateString() : "—",
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

  const headerButtons = [
    {
      label: "Add Company",
      onClick: () => {
        setSelectedId(null);
        setFormData({
          name: "",
          location: "",
          joined_at: new Date(),
          left_at: null,
        });
        setOpen(true);
      },
    },
  ];

  const tableActions = [
    {
      label: "Edit",
      icon: Edit,
      onClick: handleEditRow,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: (row: any) => {
        setConfirm(true);
        setSelectedId(row?.id);
      },
    },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <PageHeader title="Companies" actions={headerButtons} />
      <TableComponent
        data={companies}
        columns={columns}
        actions={tableActions}
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
            placeholder="Company Name"
            required
            value={formData.name}
            onChange={handleInputChange}
          />
          <InputComponent
            name="location"
            label="Location"
            required
            placeholder="Location"
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
            value={formData.left_at ?? undefined}
            onChange={(date) =>
              setFormData((p) => ({ ...p, left_at: date ?? null }))
            }
          />
        </div>
      </CustomDialog>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Are you sure?"
        description=" This action cannot be undone. This will permanently delete your
            company details."
        onConfirm={handleDeleteRow}
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}

export default CompaniesPage;
