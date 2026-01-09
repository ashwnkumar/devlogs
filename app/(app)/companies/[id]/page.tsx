"use client";

import PageHeader from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/client";
import { CompanyType } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function CompanyDetailsPage() {
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<CompanyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("id", companyId)
          .single();

        if (error) {
          setError(error.message);
        } else {
          setCompany(data);
        }
      } catch {
        setError("Failed to fetch company data");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const viewData = [
    {
      label: "Company Name",
      value: <span className="text-lg font-medium">{company?.name}</span>,
    },
    {
      label: "Location",
      value: <span className="text-lg">{company?.location}</span>,
    },
    {
      label: "Joined At",
      value: (
        <span className="text-lg">
          {company?.joined_at ? new Date(company.joined_at).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      label: "Left At",
      value: (
        <span className="text-lg">
          {company?.left_at
            ? new Date(company.left_at).toLocaleDateString()
            : "Currently working here"}
        </span>
      ),
    },
    {
      label: "Created At",
      value: (
        <span className="text-lg">
          {company?.created_at ? new Date(company.created_at).toLocaleString() : "N/A"}
        </span>
      ),
    },
    {
      label: "Last Updated",
      value: (
        <span className="text-lg">
          {company?.updated_at ? new Date(company.updated_at).toLocaleString() : "N/A"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full gap-8">
        <PageHeader title="Loading..." />
        <div className="flex items-center justify-center">
          <p>Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full h-full gap-8">
        <PageHeader title="Error" />
        <div className="flex items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col w-full h-full gap-8">
        <PageHeader title="Company Not Found" />
        <div className="flex items-center justify-center">
          <p>Company not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-8">
      <PageHeader
        title={company.name}
        description={`Company details for ${company.name}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {viewData.map((item, idx) => (
          <div key={idx}>
            <label className="text-sm font-medium text-muted-foreground">
              {item.label}
            </label>
            <p>{item.value || "NA"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompanyDetailsPage;
