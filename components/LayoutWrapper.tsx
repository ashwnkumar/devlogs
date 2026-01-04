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
        <main className="flex grow">{children}</main>
        <Footer />
      </AuthProvider>
    </div>
  );
}

export default LayoutWrapper;
