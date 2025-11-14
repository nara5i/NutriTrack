import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { Navigation } from "../_components/Navigation";
import { MacroChart } from "./_components/MacroChart";
import { TrendChart } from "./_components/TrendChart";

type FoodLogRow = {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  consumed_at: string;
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setUTCHours(23, 59, 59, 999);
  return copy;
}

function daysAgo(amount: number) {
  const date = new Date();
  date.setDate(date.getDate() - amount);
  return date;
}

function dateKey(value: Date | string) {
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
}

function formatLabel(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirectTo=/dashboard");
  }

  const rangeStartIso = startOfDay(daysAgo(6)).toISOString();
  const rangeEndIso = endOfDay(new Date()).toISOString();

  const [targetsResult, logsResult] = await Promise.all([
    supabase
      .from("rda_targets")
      .select(
        "calories_target, protein_target, carbs_target, fats_target, workout_level",
      )
      .eq("user_id", session.user.id)
      .maybeSingle(),
    supabase
      .from("food_logs")
      .select("calories, protein, carbs, fats, consumed_at")
      .eq("user_id", session.user.id)
      .gte("consumed_at", rangeStartIso)
      .lte("consumed_at", rangeEndIso)
      .order("consumed_at", { ascending: true }),
  ]);

  const targets = targetsResult.data ?? null;
  const logs = (logsResult.data as FoodLogRow[] | null) ?? [];
  const todayKey = dateKey(new Date());

  const todaysTotals = logs.reduce(
    (acc, entry) => {
      if (dateKey(entry.consumed_at) !== todayKey) {
        return acc;
      }

      return {
        calories: acc.calories + Number(entry.calories ?? 0),
        protein: acc.protein + Number(entry.protein ?? 0),
        carbs: acc.carbs + Number(entry.carbs ?? 0),
        fats: acc.fats + Number(entry.fats ?? 0),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );

  const dailyMap = logs.reduce(
    (map, entry) => {
      const key = dateKey(entry.consumed_at);
      if (!map.has(key)) {
        map.set(key, { calories: 0, protein: 0 });
      }
      const current = map.get(key)!;
      current.calories += Number(entry.calories ?? 0);
      current.protein += Number(entry.protein ?? 0);
      return map;
    },
    new Map<string, { calories: number; protein: number }>(),
  );

  const trendData = Array.from({ length: 7 }).map((_, index) => {
    const date = daysAgo(6 - index);
    const key = dateKey(date);
    const aggregate = dailyMap.get(key) ?? { calories: 0, protein: 0 };
    return {
      label: formatLabel(date),
      dateLabel: formatShortDate(date),
      calories: Number(aggregate.calories.toFixed(0)),
      protein: Number(aggregate.protein.toFixed(0)),
    };
  });

  const macros = [
    {
      label: "Calories",
      key: "calories" as const,
      unit: "kcal",
      total: todaysTotals.calories,
      target: targets?.calories_target ?? null,
    },
    {
      label: "Protein",
      key: "protein" as const,
      unit: "g",
      total: todaysTotals.protein,
      target: targets?.protein_target ?? null,
    },
    {
      label: "Carbs",
      key: "carbs" as const,
      unit: "g",
      total: todaysTotals.carbs,
      target: targets?.carbs_target ?? null,
    },
    {
      label: "Fats",
      key: "fats" as const,
      unit: "g",
      total: todaysTotals.fats,
      target: targets?.fats_target ?? null,
    },
  ];

  const hasTargets = Boolean(targets);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-3 rounded-3xl bg-white p-8 shadow-lg shadow-slate-200">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">
                NutriTrack Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                A quick snapshot of today’s intake compared to your goals.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/log-food"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                Log today’s food
              </Link>
              <Link
                href="/wizard"
                className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:border-emerald-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
              >
                Adjust targets
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {macros.map((macro) => {
              const percentage =
                macro.target && Number(macro.target) > 0
                  ? Math.min(100, Math.round((macro.total / Number(macro.target)) * 100))
                  : null;
              return (
                <div
                  key={macro.key}
                  className="rounded-2xl bg-white px-4 py-4 shadow-sm shadow-slate-200"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {macro.label}
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {Math.round(macro.total)}
                    {macro.unit}
                  </p>
                  {macro.target ? (
                    <>
                      <p className="text-xs text-slate-400">
                        Target {Math.round(Number(macro.target))}
                        {macro.unit}
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${percentage ?? 0}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <Link
                      href="/wizard"
                      className="mt-2 inline-block text-xs font-semibold uppercase text-emerald-600"
                    >
                      Set target
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {!hasTargets ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-5 py-4 text-sm text-emerald-700">
              You haven’t set your targets yet. Complete the{" "}
              <Link
                href="/wizard"
                className="font-semibold underline underline-offset-4"
              >
                RDA setup wizard
              </Link>{" "}
              to personalise your daily goals.
            </div>
          ) : null}
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
          <TrendChart data={trendData} />
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
          <MacroChart macros={macros} />
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Next steps</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Log meals throughout the day to keep this dashboard current.</li>
            <li>Adjust your RDA targets as goals change or activity shifts.</li>
            <li>Track your progress over time with the chart above.</li>
          </ul>
        </section>
      </div>
    </div>
    </>
  );
}

