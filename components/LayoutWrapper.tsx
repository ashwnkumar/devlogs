import { AuthProvider } from "@/context/AuthContext";
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

type Props = { children: React.ReactNode };

function LayoutWrapper({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthProvider>
        <Navbar />
        <main className="flex grow w-full justify-center p-5">
          <div className="w-full max-w-7xl">{children}</div>
        </main>
        <Footer />
      </AuthProvider>
    </div>
  );
}

export default LayoutWrapper;
