"use client";
import PageHeader from "@/components/PageHeader";
import TableComponent from "@/components/TableComponent";
import React, { useState } from "react";

type CompanyType = {
  id: number;
  name: string;
  joined_at: Date;
  left_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyType[]>([]);

  const columns = [
    {
      label: "Name",
      key: "name",
    },
    {
      label: "Joined At",
      key: "joined_at",
    },
    {
      label: "Left At",
      key: "left_at",
    },
    {
      label: "Created At",
      key: "created_at",
    },
    {
      label: "Updated At",
      key: "updated_at",
    },
  ];
  return (
    <div className="flex flex-col w-full h-full gap-6">
      <PageHeader title="Companies" />
      <TableComponent data={companies} columns={columns} />
    </div>
  );
}

export default CompaniesPage;
