"use client";
import { Button } from "./ui/button";
import { Code2, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { redirect } from "next/navigation";

function Navbar() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      toast.success("Logged out successfully");
      redirect("/login");
    } else {
      toast.error(res.error?.message || "Logout failed");
    }
  };
  return (
    <div className="w-full sticky top-0 px-4 py-2 flex items-center justify-between shadow">
      <h1 className="flex items-center gap-2">
        <div className="bg-foreground text-background flex items-center p-1 rounded">
          <Code2 />
        </div>
        <span>DevLogs</span>
      </h1>
      <Button onClick={handleLogout} variant="destructive" size="icon">
        <LogOut />
      </Button>
    </div>
  );
}

export default Navbar;
