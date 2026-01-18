import CompaniesPage from "./CompaniesPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies",
  description:
    "Manage your companies and organizations in DevLogs. Track work across different clients and employers.",
};

function page() {
  return (
    <div className="w-full h-full">
      <CompaniesPage />
    </div>
  );
}

export default page;
