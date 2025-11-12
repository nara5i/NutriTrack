"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import {
  calculateRdaTargets,
  type Gender,
  type WorkoutLevel,
} from "@/lib/rda/calculations";

type WizardState = {
  error?: string;
};

function parseNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function submitWizardAction(
  _prevState: WizardState | undefined,
  formData: FormData,
) {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to continue." };
  }

  const age = parseNumber(formData.get("age"));
  const weight = parseNumber(formData.get("weight"));
  const height = parseNumber(formData.get("height"));
  const gender = formData.get("gender") as Gender | null;
  const workoutLevel = formData.get("workoutLevel") as WorkoutLevel | null;

  if (
    !age ||
    !weight ||
    !gender ||
    !workoutLevel ||
    Number.isNaN(age) ||
    Number.isNaN(weight)
  ) {
    return { error: "Please fill in all required fields." };
  }

  const targets = calculateRdaTargets({
    age,
    gender,
    weightKg: weight,
    heightCm: height,
    workoutLevel,
  });

  const { error } = await supabase
    .from("rda_targets")
    .upsert(
      {
        user_id: user.id,
        age,
        gender,
        weight_kg: weight,
        height_cm: height ?? null,
        workout_level: workoutLevel,
        calories_target: targets.calories,
        protein_target: targets.protein,
        carbs_target: targets.carbs,
        fats_target: targets.fats,
      },
      {
        onConflict: "user_id",
      },
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

