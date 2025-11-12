import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
