import { NextRequest, NextResponse } from "next/server";
import { applyPendingCookies, createSupabaseRouteClient, type PendingCookie } from "@/lib/supabase/route";

export async function POST(request: NextRequest) {
  const pendingCookies: PendingCookie[] = [];
  const supabase = createSupabaseRouteClient(request, pendingCookies);

  await supabase.auth.signOut();

  const response = NextResponse.json({ success: true });
  applyPendingCookies(response, pendingCookies);

  return response;
}

