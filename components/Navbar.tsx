"use client";
import { Button } from "./ui/button";
import { Code2, Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { useState } from "react";

function Navbar() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogout = async () => {
    setLoading(true);
    const res = await logout();
    if (res.success) {
      setLoading(false);
      toast.success("Logged out successfully");
      redirect("/login");
    } else {
      setLoading(false);
      toast.error(res.error?.message || "Logout failed");
    }
  };
  return (
    <div className="w-full sticky top-0 shadow flex items-center justify-center bg-background z-50 ">
      <div className="w-full max-w-7xl  py-2 flex items-center justify-between">
        <h1 className="flex items-center gap-2">
          <div className="bg-foreground text-background flex items-center p-1 rounded">
            <Code2 />
          </div>
          <span>DevLogs</span>
        </h1>
        <Button
          onClick={handleLogout}
          disabled={loading}
          variant="destructive"
          size="icon"
          className="disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <LogOut />}
        </Button>
      </div>
    </div>
  );
}

export default Navbar;
