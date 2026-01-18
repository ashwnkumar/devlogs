"use client";
import PageHeader from "@/components/PageHeader";
import TableComponent from "@/components/TableComponent";
import { useAuth } from "@/context/AuthContext";
import { useGlobal } from "@/context/GlobalContext";
import { formatDate } from "@/lib/utils";
import { CompanyType, ProjectType, TableColumn } from "@/types";
import React from "react";

function ProjectPage() {
  const { companies } = useGlobal();
  const { user } = useAuth();

  const getCompanyName = (companyId: string): string => {
    const company = companies.find((c: CompanyType) => c.id === companyId);
    return company?.name || "NA";
  };

  const columns: TableColumn<ProjectType>[] = [
    {
      label: "Name",
      key: "name",
      dataType: "text",
      required: true,
      editable: true,
      addable: true,
      placeholder: "Enter project name",
    },
    {
      label: "Company",
      key: "company_id",
      dataType: "select",
      required: true,
      editable: true,
      addable: true,
      options: companies.map((c: CompanyType) => ({
        label: c.name,
        value: c.id,
      })),
      defaultValue: user?.current_company ? String(user.current_company) : "",
      render: (row: ProjectType) => <p>{getCompanyName(row.company_id)}</p>,
    },
    {
      label: "Created At",
      key: "created_at",
      dataType: "date",
      editable: false,
      addable: false,
      render: (row: ProjectType) => formatDate(row.created_at),
    },
    {
      label: "Updated At",
      key: "updated_at",
      dataType: "date",
      editable: false,
      addable: false,
      render: (row: ProjectType) => formatDate(row.updated_at),
    },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <PageHeader title="Projects" />
      <TableComponent<ProjectType>
        dataPath="/projects"
        columns={columns}
        enableAdd={true}
        enableEdit={true}
        enableDelete={true}
        addButtonLabel="Add Project"
        emptyMessage="No Projects Found. Add A Project to View Them Here"
        filterConfig={{
          data: companies,
          label: "Filter By Company",
          labelKey: "name",
          valueKey: "id",
          searchPlaceholder: "Search Projects",
        }}
      />
    </div>
  );
}

export default ProjectPage;
