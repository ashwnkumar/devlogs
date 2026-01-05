import GridCard from "@/components/GridCard";
import QuickAddCard from "@/components/home/QuickAddCard";
import { Clock } from "lucide-react";
import React from "react";

function page() {
  return (
    <div className="w-full grid grid-cols-12 auto-rows-[87px] gap-6">
      <GridCard className="col-span-6 row-span-3">
        <QuickAddCard />
      </GridCard>
    </div>
  );
}

export default page;
