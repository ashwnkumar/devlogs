"use client";

import { useAuth } from "@/context/AuthContext";
import { useGlobal } from "@/context/GlobalContext";
import { ProjectType } from "@/types";
import { useEffect, useState } from "react";

function AllLogsPage() {
  const { user } = useAuth();
  const { projects: userProjects } = useGlobal();
  const [projects, setProjects] = useState<ProjectType[]>([]);

  useEffect(() => {
    const filteredProjects = userProjects.filter(
      (p) => p.company_id === user?.current_company
    );

    setProjects(filteredProjects);
  }, [user?.current_company, userProjects]);


  return <div>AllLogsPage</div>;
}

export default AllLogsPage;
