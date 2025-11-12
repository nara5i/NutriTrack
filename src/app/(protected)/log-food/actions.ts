"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type LogFoodState = {
  error?: string;
  success?: string;
};

function parseNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return parsed;
}

function parseDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length === 0) {
    return new Date();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
}

export async function logFoodAction(
  _prevState: LogFoodState | undefined,
  formData: FormData,
): Promise<LogFoodState> {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to log food." };
  }

  const mode = formData.get("mode");
  const notes =
    typeof formData.get("notes") === "string"
      ? (formData.get("notes") as string)
      : null;

  const consumedAt = parseDate(formData.get("consumedAt"));
  if (!consumedAt) {
    return { error: "Please provide a valid date and time." };
  }

  if (mode === "existing") {
    const foodId =
      typeof formData.get("foodId") === "string"
        ? (formData.get("foodId") as string)
        : null;
    const quantity = parseNumber(formData.get("quantity"));

    if (!foodId || !quantity) {
      return { error: "Please choose a food and quantity." };
    }

    const { data: food, error: fetchError } = await supabase
      .from("foods")
      .select(
        "id, name, serving_size_grams, calories, protein, carbs, fats, fiber",
      )
      .eq("id", foodId)
      .maybeSingle();

    if (fetchError) {
      return { error: fetchError.message };
    }

    if (!food) {
      return { error: "Selected food item was not found." };
    }

    const calories = Number(food.calories) * quantity;
    const protein = Number(food.protein) * quantity;
    const carbs = Number(food.carbs) * quantity;
    const fats = Number(food.fats) * quantity;
    const fiber =
      food.fiber !== null && food.fiber !== undefined
        ? Number(food.fiber) * quantity
        : null;

    const { error: insertError } = await supabase.from("food_logs").insert({
      user_id: user.id,
      food_id: food.id,
      is_custom: false,
      quantity,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      consumed_at: consumedAt.toISOString(),
      notes,
    });

    if (insertError) {
      return { error: insertError.message };
    }

    revalidatePath("/log-food");
    revalidatePath("/dashboard");
    return { success: "Food entry logged." };
  }

  if (mode === "custom") {
    const name =
      typeof formData.get("customName") === "string"
        ? (formData.get("customName") as string).trim()
        : "";
    const calories = parseNumber(formData.get("customCalories"));
    const protein = parseNumber(formData.get("customProtein"));
    const carbs = parseNumber(formData.get("customCarbs"));
    const fats = parseNumber(formData.get("customFats"));
    const fiber = parseNumber(formData.get("customFiber"));
    const servingSize = parseNumber(formData.get("customServingSize"));

    if (!name || !calories || protein === undefined || carbs === undefined) {
      return {
        error:
          "Please provide a name along with calories, protein, carbs, and fats.",
      };
    }

    if (fats === undefined) {
      return { error: "Please provide fats for custom entries." };
    }

    const { error: insertError } = await supabase.from("food_logs").insert({
      user_id: user.id,
      is_custom: true,
      custom_name: name,
      custom_serving_size_grams: servingSize ?? null,
      quantity: 1,
      calories,
      protein,
      carbs,
      fats,
      fiber: fiber ?? null,
      consumed_at: consumedAt.toISOString(),
      notes,
    });

    if (insertError) {
      return { error: insertError.message };
    }

    revalidatePath("/log-food");
    revalidatePath("/dashboard");
    return { success: "Custom food logged." };
  }

  return { error: "Please select how you want to log your food." };
}

export async function deleteFoodLogAction(
  _prevState: LogFoodState | undefined,
  formData: FormData,
): Promise<LogFoodState> {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/log-food");
  }

  const logId =
    typeof formData.get("logId") === "string"
      ? (formData.get("logId") as string)
      : null;

  if (!logId) {
    return { error: "Invalid food log entry." };
  }

  const { error } = await supabase
    .from("food_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", user!.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/log-food");
  revalidatePath("/dashboard");
  return { success: "Food entry removed." };
}


