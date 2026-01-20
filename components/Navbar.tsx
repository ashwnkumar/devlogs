"use client";
import { Code2, Plus } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useAuth } from "@/context/AuthContext";
import { WelcomeDialog } from "./WelcomeDialog";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function Navbar() {
  const { showWelcome, setShowWelcome, user } = useAuth();

  const init = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .select("metadata")
      .eq("id", user?.id)
      .single();
    if (error) return console.log("error", error);
    return data?.metadata?.is_onboarded;
  };

  useEffect(() => {
    if (user) {
      init().then((res) => {
        setShowWelcome(!res);
      });
    }
  }, [user]);
  return (
    <div className="w-full sticky top-0 shadow flex items-center justify-between bg-background z-30 px-4 py-2">
      <h1 className="flex items-center gap-2">
        <div className="bg-primary text-white flex items-center p-1 rounded">
          <Code2 />
        </div>
        <span className="font-semibold">DevLogs</span>
      </h1>

      <div className="flex items-center gap-4">
        {/* <Button>
          <Plus />
          Quick Log
        </Button> */}
        <Separator orientation="vertical" />
        <ProfileDropdown />
        <WelcomeDialog open={showWelcome} onOpenChange={setShowWelcome} />
      </div>
    </div>
  );
}

export default Navbar;
