'use client'
import PageHeader from "@/components/PageHeader";
import { useRouter } from "next/navigation";

function AllLogsPage() {

  
  return (
    <div className="flex flex-col w-full h-full">
      <PageHeader title="All Logs"  />
    </div>
  );
}

export default AllLogsPage;
