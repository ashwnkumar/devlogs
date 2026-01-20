import ComingSoon from "@/components/ComingSoon";
import React from "react";
import type { Metadata } from "next";
import DashboardPage from "./DashboardPage";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your DevLogs dashboard with insights into your daily work, productivity trends, and task distribution across projects.",
};

function page() {
  return (
    <div>
      <DashboardPage />
    </div>
  );
}

export default page;
