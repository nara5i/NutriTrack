import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseCredentials } from "./env";

let browserClient: SupabaseClient | undefined;

export function getBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseCredentials();

  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey);
  }

  return browserClient;
}