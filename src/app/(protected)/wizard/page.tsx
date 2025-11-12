import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { WizardForm } from "./_components/WizardForm";
import { Navigation } from "../_components/Navigation";

export default async function WizardPage() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirectTo=/wizard");
  }

  const { data: targets } = await supabase
    .from("rda_targets")
    .select(
      "age, gender, weight_kg, height_cm, workout_level, calories_target, protein_target, carbs_target, fats_target",
    )
    .eq("user_id", session.user.id)
    .maybeSingle();

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <WizardForm
          defaultValues={{
            age: targets?.age,
            gender: targets?.gender,
            weight: targets?.weight_kg,
            height: targets?.height_cm,
            workoutLevel: targets?.workout_level,
          }}
        />

        <aside className="space-y-6 rounded-3xl bg-white p-8 shadow-2xl shadow-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              How we calculate your goals
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              We apply the Mifflin-St Jeor equation to estimate your basal
              metabolic rate, then adjust for your activity level. Macros split
              as 30% protein, 45% carbs, and 25% fats.
            </p>
          </div>

          {targets ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-6 py-5">
              <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
                Current saved targets
              </p>
              <dl className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase text-emerald-500">
                    Calories
                  </dt>
                  <dd className="text-base font-semibold text-emerald-700">
                    {Math.round(targets.calories_target).toLocaleString()} kcal
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-emerald-500">
                    Protein
                  </dt>
                  <dd className="text-base font-semibold text-emerald-700">
                    {Math.round(targets.protein_target)} g
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-emerald-500">Carbs</dt>
                  <dd className="text-base font-semibold text-emerald-700">
                    {Math.round(targets.carbs_target)} g
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-emerald-500">Fats</dt>
                  <dd className="text-base font-semibold text-emerald-700">
                    {Math.round(targets.fats_target)} g
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-600">
              We’ll save your personalised targets once you complete the form.
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Need to tweak later?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              You can revisit this wizard anytime from the dashboard to adjust
              your weight, goals, or activity level.
            </p>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}

