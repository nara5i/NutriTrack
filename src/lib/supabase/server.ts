import { cookies } from "next/headers";
import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseCredentials } from "./env";

export const getServerSupabaseClient = cache(async () => {
  const { url, anonKey } = getSupabaseCredentials();

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set({
          name,
          value,
          ...options,
        });
      },
      remove(name, options) {
        cookieStore.delete({
          name,
          ...options,
        });
      },
    },
  });
});

