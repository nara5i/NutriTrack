import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { getSupabaseCredentials } from "./env";

export type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export function createSupabaseRouteClient(
  request: NextRequest,
  pendingCookies: PendingCookie[],
) {
  const { url, anonKey } = getSupabaseCredentials();

  return createServerClient(url, anonKey, {
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


