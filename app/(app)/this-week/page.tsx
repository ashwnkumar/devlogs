import ComingSoon from "@/components/ComingSoon";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "This Week",
  description:
    "View your work summary for this week in DevLogs. Track weekly progress, time distribution, and completed tasks.",
};

function page() {
  return (
    <div>
      <ComingSoon />
    </div>
  );
}

export default page;
