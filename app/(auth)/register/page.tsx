import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "./RegisterForm";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const session = await supabase.auth.getSession();

  if (session?.data?.session) {
    redirect("/");
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
