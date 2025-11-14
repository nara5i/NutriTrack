type SupabaseCredentials = {
  url: string;
  anonKey: string;
};

function normalizeUrl(value: string | undefined | null) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return parsed.origin + parsed.pathname.replace(/\/+$/, "");
  } catch {
    return undefined;
  }
}

export function getSupabaseCredentials(): SupabaseCredentials {
  const supabaseUrl = normalizeUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
  );
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}


