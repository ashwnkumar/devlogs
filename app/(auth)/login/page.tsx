import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to DevLogs to access your work logs, track productivity, and manage your development tasks across projects.",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function Page() {
  const supabase = await createClient();
  const session = await supabase.auth.getSession();

  if (session?.data?.session) {
    redirect("/");
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
