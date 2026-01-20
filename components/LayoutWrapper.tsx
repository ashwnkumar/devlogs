import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { GlobalProvider } from "@/context/GlobalContext";
import { CompanyProvider } from "@/context/CompanyContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { TaskProvider } from "@/context/TaskContext";

type Props = {
  children: React.ReactNode;
};

function LayoutWrapper({ children }: Props) {
  return (
    <AuthProvider>
      <CompanyProvider>
        <ProjectProvider>
          <TaskProvider>
            <GlobalProvider>
              <div className="flex min-h-screen flex-col">
                <nav>
                  <Navbar />
                </nav>
                <div className="flex flex-1">
                  <aside className="w-64 shrink-0">
                    <Sidebar />
                  </aside>
                  <div className="flex flex-col w-full">
                    <main className="flex-1 p-4">{children}</main>
                    <footer>
                      <Footer />
                    </footer>
                  </div>
                </div>
              </div>
            </GlobalProvider>
          </TaskProvider>
        </ProjectProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default LayoutWrapper;
