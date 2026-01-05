"use client";
import { Code2, Plus } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

function Navbar() {
  return (
    <div className="w-full sticky top-0 shadow flex items-center justify-between bg-background z-50 px-4 py-2">
      <h1 className="flex items-center gap-2">
        <div className="bg-foreground text-background flex items-center p-1 rounded">
          <Code2 />
        </div>
        <span>DevLogs</span>
      </h1>

      <div className="flex items-center gap-4">
        <Button>
          <Plus />
          Quick Log
        </Button>
        <Separator orientation="vertical" />
        <ProfileDropdown />
      </div>
    </div>
  );
}

export default Navbar;
