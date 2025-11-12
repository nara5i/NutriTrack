import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { LogFoodForm } from "./_components/LogFoodForm";
import { FoodLogsList } from "./_components/FoodLogsList";
import { Navigation } from "../_components/Navigation";

function formatDateRangeBoundary(date: Date, endOfDay = false) {
  const clone = new Date(date);
  if (endOfDay) {
    clone.setUTCHours(23, 59, 59, 999);
  } else {
    clone.setUTCHours(0, 0, 0, 0);
  }
  return clone.toISOString();
}

export default async function LogFoodPage() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirectTo=/log-food");
  }

  const today = new Date();
  const todayStartIso = formatDateRangeBoundary(today, false);
  const todayEndIso = formatDateRangeBoundary(today, true);

  const [{ data: foods }, { data: rdaTargets }, { data: foodLogs }] =
    await Promise.all([
      supabase
        .from("foods")
        .select(
          "id, name, brand, serving_size_grams, calories, protein, carbs, fats",
        )
        .order("name")
        .limit(50),
      supabase
        .from("rda_targets")
        .select(
          "calories_target, protein_target, carbs_target, fats_target, workout_level",
        )
        .eq("user_id", session.user.id)
        .maybeSingle(),
      supabase
        .from("food_logs")
        .select(
          "id, consumed_at, is_custom, custom_name, custom_serving_size_grams, quantity, calories, protein, carbs, fats, fiber, notes, foods(name, serving_size_grams, brand)",
        )
        .eq("user_id", session.user.id)
        .gte("consumed_at", todayStartIso)
        .lte("consumed_at", todayEndIso)
        .order("consumed_at", { ascending: false }),
    ]);

  const dailyTotals = foodLogs?.reduce(
    (totals, log) => {
      return {
        calories: totals.calories + Number(log.calories ?? 0),
        protein: totals.protein + Number(log.protein ?? 0),
        carbs: totals.carbs + Number(log.carbs ?? 0),
        fats: totals.fats + Number(log.fats ?? 0),
      };
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    },
  );

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <FoodLogsList logs={foodLogs ?? []} />
            <LogFoodForm foods={foods ?? []} />
          </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Today’s overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track how today’s meals stack up against your targets.
            </p>

            <dl className="mt-6 grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              {(["calories", "protein", "carbs", "fats"] as const).map(
                (macro) => {
                  const target =
                    macro === "calories"
                      ? rdaTargets?.calories_target
                      : macro === "protein"
                        ? rdaTargets?.protein_target
                        : macro === "carbs"
                          ? rdaTargets?.carbs_target
                          : rdaTargets?.fats_target;
                  const total = dailyTotals?.[macro] ?? 0;
                  const percentage = target
                    ? Math.min(100, Math.round((total / Number(target)) * 100))
                    : null;

                  return (
                    <div key={macro} className="space-y-2">
                      <div className="flex items-center justify-between text-xs uppercase text-slate-500">
                        <span>{macro}</span>
                        {target ? (
                          <span className="text-slate-400">
                            Target {Math.round(Number(target))}
                            {macro === "calories" ? " kcal" : " g"}
                          </span>
                        ) : (
                          <Link
                            href="/wizard"
                            className="text-emerald-500 hover:text-emerald-600"
                          >
                            Set target
                          </Link>
                        )}
                      </div>
                      <div className="text-lg font-semibold text-slate-900">
                        {Math.round(total)}
                        {macro === "calories" ? " kcal" : " g"}
                      </div>
                      {target ? (
                        <div className="h-1.5 rounded-full bg-slate-200">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500 transition-all"
                            style={{
                              width: `${percentage ?? 0}%`,
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                },
              )}
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Tips for accurate logging
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Use consistent serving sizes to compare entries.</li>
              <li>Custom foods are perfect for home-cooked meals.</li>
              <li>
                Prefer weights (grams) over volume where possible for precision.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}


