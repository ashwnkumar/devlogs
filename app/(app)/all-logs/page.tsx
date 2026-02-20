import React from "react";
import AllLogsPage from "./AllLogsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Logs",
  description:
    "View and manage all your work logs in DevLogs. Browse your complete development history with filtering and search capabilities.",
};

function page() {
  return (
    <div className="w-full h-full">
      <AllLogsPage />
    </div>
  );
}

export default page;
