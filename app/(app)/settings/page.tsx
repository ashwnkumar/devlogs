import React from "react";
import SettingsPage from "./SettingsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your DevLogs account settings, preferences, and profile information. Customize your work logging experience.",
};

function page() {
  return <SettingsPage />;
}

export default page;
