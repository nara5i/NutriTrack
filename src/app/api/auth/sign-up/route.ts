import { NextRequest, NextResponse } from "next/server";
import { applyPendingCookies, createSupabaseRouteClient, type PendingCookie } from "@/lib/supabase/route";

const requiredMessage = "Email and password are required.";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }

  const email = isNonEmptyString((body as Record<string, unknown>)?.email)
    ? (body as Record<string, unknown>).email.trim()
    : "";
  const password = isNonEmptyString((body as Record<string, unknown>)?.password)
    ? (body as Record<string, unknown>).password
    : "";

  if (!email || !password) {
    return NextResponse.json({ error: requiredMessage }, { status: 400 });
  }

  const pendingCookies: PendingCookie[] = [];
  const supabase = createSupabaseRouteClient(request, pendingCookies);

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user && data.session) {
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert({ id: data.user.id }, { onConflict: "id" });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message ?? "Failed to create user profile." },
        { status: 500 },
      );
    }
  }

  const requiresConfirmation = !data.session;
  const response = NextResponse.json({ success: true, requiresConfirmation });
  applyPendingCookies(response, pendingCookies);

  return response;
}


