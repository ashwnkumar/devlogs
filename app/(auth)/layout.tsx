import { AuthProvider } from "@/context/AuthContext";
import React from "react";
import "../globals.css";
import { Toaster } from "sonner";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right"/>
      </body>
    </html>
  );
}

export default AuthLayout;
