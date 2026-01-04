import { AuthProvider } from "@/context/AuthContext";
import React from "react";
import "../globals.css";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

export default AuthLayout;
