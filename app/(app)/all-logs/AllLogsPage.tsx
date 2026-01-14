'use client'
import PageHeader from "@/components/PageHeader";
import { useState } from "react";
import AddLogDialog from "./AddLogDialog";

function AllLogsPage() {
const [open, setOpen] = useState<boolean>(true)
  
const headerActions = [
  {label: "Add Log", onClick: () => setOpen(true)}
]
  return (
    <div className="flex flex-col w-full h-full">
      <PageHeader title="All Logs" actions={headerActions} />
      <AddLogDialog open={open} onOpenChange={setOpen}/>
    </div>
  );
}

export default AllLogsPage;
