"use client";
import { CompanyType } from "@/types";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface CompanyContextType {
  companies: CompanyType[];
  loading: boolean;
  fetchCompanies: () => Promise<void>;
  addCompany: (
    companyData: Omit<
      CompanyType,
      "id" | "user_id" | "created_at" | "updated_at"
    >,
  ) => Promise<boolean>;
  editCompany: (
    id: string,
    companyData: Partial<
      Omit<CompanyType, "id" | "user_id" | "created_at" | "updated_at">
    >,
  ) => Promise<boolean>;
  deleteCompany: (id: string) => Promise<boolean>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCompanies = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch("/api/companies");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch companies");
      }

      const { data } = await response.json();
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const addCompany = async (
    companyData: Omit<
      CompanyType,
      "id" | "user_id" | "created_at" | "updated_at"
    >,
  ): Promise<boolean> => {
    const trimmedName = companyData.name.trim();
    if (!trimmedName) {
      toast.error("Company name cannot be empty");
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...companyData,
          name: trimmedName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add company");
      }

      // Add the new company to the local state
      setCompanies((prev) => [data.data, ...prev]);
      toast.success("Company added successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add company",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editCompany = async (
    id: string,
    companyData: Partial<
      Omit<CompanyType, "id" | "user_id" | "created_at" | "updated_at">
    >,
  ): Promise<boolean> => {
    if (companyData.name && !companyData.name.trim()) {
      toast.error("Company name cannot be empty");
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update company");
      }

      // Update the company in the local state
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === id ? { ...company, ...data.data } : company,
        ),
      );
      toast.success("Company updated successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update company",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete company");
      }

      // Remove the company from the local state
      setCompanies((prev) => prev.filter((company) => company.id !== id));
      toast.success("Company deleted successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete company",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCompanies();
    }
  }, [user?.id, fetchCompanies]);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        loading,
        fetchCompanies,
        addCompany,
        editCompany,
        deleteCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompanyContext must be used within an AppProvider");
  }
  return context;
};
