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
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Company Name
            </label>
            <p className="text-lg font-medium">{company.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Location
            </label>
            <p className="text-lg">{company.location}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Joined At
            </label>
            <p className="text-lg">
              {new Date(company.joined_at).toLocaleDateString()}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Left At
            </label>
            <p className="text-lg">
              {company.left_at
                ? new Date(company.left_at).toLocaleDateString()
                : "Currently working here"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Created At
            </label>
            <p className="text-lg">
              {new Date(company.created_at).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Last Updated
            </label>
            <p className="text-lg">
              {new Date(company.updated_at).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Company ID
            </label>
            <p className="text-lg font-mono text-sm">{company.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetailsPage;