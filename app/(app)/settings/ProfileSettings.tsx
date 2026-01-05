"use client";
import InputComponent from "@/components/form/InputComponent";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { UserType } from "@/types/auth";
import React, { useEffect, useState } from "react";

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

  useEffect(() => {
    const fetchUser = () => {
      if (user) {
        setFormData(user);
      }
    };

    fetchUser();
  }, [user]);

  return (
    <div className="w-full h-full flex flex-col items-start justify-start gap-4">
      <PageHeader
        title="Profile Settings"
        description="Find and manage your profile details here."
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
          placeholder="Timezone"
          value={formData?.timezone}
          onChange={handleInputChange}
        />
        <InputComponent
          className="w-full"
          label="Username"
          name="username"
          placeholder="Username"
          value={formData?.username}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}

export default ProfileSettings;
