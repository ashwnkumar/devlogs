"use client";
import NoData from "@/components/NoData";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/context/GlobalContext";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import CompanyCard from "./ProjectCard";

function ProjectPage() {
  const { companies } = useGlobal();
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);

  // Memoize filtered companies to avoid unnecessary re-computations
  const filteredCompanies = useMemo(() => {
    if (selectedCompanyIds.length === 0) return companies;
    return companies.filter((company) =>
      selectedCompanyIds.includes(company.id)
    );
  }, [selectedCompanyIds, companies]);

  const toggleCompany = (id: string) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const clearFilters = () => setSelectedCompanyIds([]);

  const isAllSelected = selectedCompanyIds.length === 0;

  return (
    <div className="flex flex-col w-full h-full gap-8">
      <PageHeader
        title="Projects"
        description="Manage the projects you've contributed to"
      />

      {/* Filters Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            Filter by company:
          </span>
          {selectedCompanyIds.length > 0 && (
            <Button
              variant={"link"}
              onClick={clearFilters}
              className="text-destructive "
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear filters ({selectedCompanyIds.length})
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className={`rounded px-2 py-1 ${
              isAllSelected
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-accent"
            }`}
            onClick={clearFilters}
          >
            All Projects
          </button>

          {/* Company filter badges */}
          {companies?.map((company) => {
            const isSelected = selectedCompanyIds.includes(company.id);

            return (
              <button
                key={company.id}
                className={`rounded px-2 py-1 ${
                  isSelected
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent"
                }`}
                onClick={() => toggleCompany(company.id)}
              >
                {company.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyCard company={company} key={company.id} />
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <NoData
            title="No Projects Found"
            description={
              selectedCompanyIds.length > 0
                ? "No projects match the selected filters."
                : "You haven't joined any companies yet. Add a company to get started."
            }
          />
        </div>
      )}
    </div>
  );
}

export default ProjectPage;
