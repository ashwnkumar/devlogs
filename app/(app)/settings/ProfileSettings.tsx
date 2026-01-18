"use client";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { UserType } from "@/types/user";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

function ProfileSettings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<UserType>({
    id: "",
    name: "",
    created_at: new Date(),
    updated_at: new Date(),
    avatar_url: "",
    username: "",
    timezone: "",
    current_company: "",
    last_active: new Date(),
    email: "",
    preferences: {},
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!user?.id) {
      toast.error("No authenticated user found");
      return;
    }

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const { data, message } = await response.json();
      toast.success(message || "Profile updated successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error updating profile";
      toast.error(errorMessage);
      console.error("Update error:", error);
    }
  };

  useEffect(() => {
    const fetchUser = () => {
      if (user) {
        setFormData(user);
      }
    };

    fetchUser();
  }, [user]);

  const headerActions = [{ label: "Save Changes", onClick: handleSaveChanges }];

  return (
    <div className="w-full h-full flex flex-col items-start justify-start gap-4">
      <PageHeader
        title="Profile Settings"
        description="Find and manage your profile details here."
        actions={headerActions}
      />
      <p>Personal Details</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl ">
        <InputComponent
          className="w-full"
          label="Name"
          name="name"
          placeholder="Name"
          value={formData?.name}
          onChange={handleInputChange}
        />
        <InputComponent
          className="w-full"
          label="Email"
          name="email"
          placeholder="Email"
          value={formData?.email}
          onChange={handleInputChange}
        />
        <InputComponent
          className="w-full"
          label="Timezone"
          name="timezone"
          disabled
          placeholder="Timezone"
          value={formData?.timezone}
          onChange={handleInputChange}
        />
       
      </div>
    </div>
  );
}

export default ProfileSettings;
