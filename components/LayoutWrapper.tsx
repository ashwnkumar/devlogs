import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { GlobalProvider } from "@/context/GlobalContext";

type Props = {
  children: React.ReactNode;
};

function LayoutWrapper({ children }: Props) {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default LayoutWrapper;
