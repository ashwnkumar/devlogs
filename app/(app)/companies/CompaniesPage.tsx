"use client";

import PageHeader from "@/components/PageHeader";
import TableComponent from "@/components/TableComponent";
import { Badge } from "@/components/ui/badge";
import { useGlobal } from "@/context/GlobalContext";
import { CompanyType, TableColumn } from "@/types";

function CompaniesPage() {
  const { companies } = useGlobal();

  const columns: TableColumn<CompanyType>[] = [
    {
      label: "Name",
      key: "name",
      dataType: "text",
      required: true,
      editable: true,
      addable: true,
      placeholder: "Enter company name",
      render: (row: CompanyType) => (
        <div className="flex items-center gap-2 ">
          <span>{row.name}</span>

          {row.left_at === null && (
            <span className="">
              <Badge>Current</Badge>
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Location",
      key: "location",
      dataType: "text",
      required: true,
      editable: true,
      addable: true,
      placeholder: "Enter location",
    },
    {
      label: "Joined At",
      key: "joined_at",
      dataType: "date",
      required: true,
      editable: true,
      addable: true,
      defaultValue: new Date(),
      render: (row: CompanyType) =>
        new Date(row.joined_at).toLocaleDateString(),
    },
    {
      label: "Left At",
      key: "left_at",
      dataType: "date",
      required: false,
      editable: true,
      addable: true,
      defaultValue: null,
      render: (row: CompanyType) =>
        row.left_at ? new Date(row.left_at).toLocaleDateString() : "NA",
    },
    {
      label: "Created At",
      key: "created_at",
      dataType: "date",
      editable: false,
      addable: false,
      render: (row: CompanyType) => new Date(row.created_at).toLocaleString(),
    },
    {
      label: "Updated At",
      key: "updated_at",
      dataType: "date",
      editable: false,
      addable: false,
      render: (row: CompanyType) => new Date(row.updated_at).toLocaleString(),
    },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <PageHeader title="Companies" />

      <TableComponent<CompanyType>
        dataPath="/companies"
        columns={columns}
        enableAdd={true}
        enableEdit={true}
        enableDelete={true}
        addButtonLabel="Add Company"
        filterConfig={{
          labelKey: "name",
          valueKey: "id",
          searchPlaceholder: "Search Companies",
        }}
      />
    </div>
  );
}

export default CompaniesPage;
