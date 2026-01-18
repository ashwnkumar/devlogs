import React from "react";
import ImportDataPage from "./ImportDataPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import Data",
  description:
    "Import your existing work data into DevLogs. Bulk upload projects, tasks, and logs to get started quickly.",
};

function page() {
  return (
    <div className="w-full">
      <ImportDataPage />
    </div>
  );
}

export default page;
