import { createBrowserClient } from "@supabase/ssr";
import { envConfig } from "../envConfig";

export function createClient() {
  return createBrowserClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
}
