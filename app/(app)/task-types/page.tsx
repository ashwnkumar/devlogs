import React from "react";
import TaskTypesPage from "./TaskTypesPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Types",
  description:
    "Configure and manage your task types in DevLogs. Classify work by logic, UI/UX, research, debugging, meetings, and more for better productivity insights.",
};

function page() {
  return (
    <div className="w-full  h-full">
      <TaskTypesPage />
    </div>
  );
}

export default page;
