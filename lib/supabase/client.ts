import { envConfig } from "@/config/envConfig";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
}
