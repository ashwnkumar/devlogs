"use client";
import { useAuth } from "@/context/AuthContext";
import { Bolt, LogOut, User2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function ProfileDropdown() {
  const { logout, user } = useAuth();
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

  const getInitials = (name: string) => {
    const names = name.split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase()).join("");
    return initials;
  };

  const userInitials = user?.name ? getInitials(user.name) : "UG";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-2" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <p>{user?.name}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p>{user?.email.substring(0, 15)}...</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user?.email}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href={"/profile"}
              className="w-full flex items-center gap-2 justify-start"
            >
              <User2 />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={"/settings?tab=profile"}
              className="w-full flex items-center gap-2 justify-start"
            >
              <Bolt />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="">
          <Button
            onClick={handleLogout}
            disabled={loading}
            variant="destructive"
            className="disabled:opacity-50 w-full justify-start"
          >
            <LogOut />
            {loading ? "Logging Out..." : "Logout"}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileDropdown;
