import React from "react";
import ProjectPage from "./ProjectPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Manage your development projects in DevLogs. Track time, tasks, and productivity across all your active and completed projects.",
};

function page() {
  return (
    <div>
      <ProjectPage />
    </div>
  );
}

export default page;
