import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

export type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseRouteClient(
  request: NextRequest,
  pendingCookies: PendingCookie[],
) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map(({ name, value }) => ({
          name,
          value,
        }));
      },
      setAll(cookies) {
        pendingCookies.push(...cookies);
      },
    },
  });
}

export function applyPendingCookies(
  response: NextResponse,
  pendingCookies: PendingCookie[],
) {
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set({
      name,
      value,
      path: options?.path ?? "/",
      sameSite: (options?.sameSite as "lax" | "strict" | "none") ?? "lax",
      httpOnly: options?.httpOnly ?? true,
      secure: options?.secure ?? process.env.NODE_ENV === "production",
      ...options,
    });
  }
}


