"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { calculateRdaTargets, type WeightGoal } from "@/lib/rda/calculations";
import { submitWizardAction } from "../actions";

const initialState = { error: undefined as string | undefined };

type WizardFormProps = {
  defaultValues?: {
    age?: number | null;
    weight?: number | null;
    height?: number | null;
    gender?: string | null;
    workoutLevel?: string | null;
    weightGoal?: string | null;
  };
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
    >
      {pending ? "Saving..." : "Save my targets"}
    </button>
  );
}

export function WizardForm({ defaultValues }: WizardFormProps) {
  const [state, formAction] = useActionState(
    submitWizardAction,
    initialState,
  );
  const [age, setAge] = useState<string>(defaultValues?.age?.toString() ?? "");
  const [weight, setWeight] = useState<string>(
    defaultValues?.weight?.toString() ?? "",
  );
  const [height, setHeight] = useState<string>(
    defaultValues?.height?.toString() ?? "",
  );
  const [gender, setGender] = useState<string>(
    defaultValues?.gender ?? "female",
  );
  const [workoutLevel, setWorkoutLevel] = useState<string>(
    defaultValues?.workoutLevel ?? "light",
  );
  const [weightGoal, setWeightGoal] = useState<string>(
    defaultValues?.weightGoal ?? "maintain",
  );

  useEffect(() => {
    if (state?.error) {
      // Ensure error is visible by focusing the page top
      window?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state?.error]);

  const preview = useMemo(() => {
    const parsedAge = Number.parseFloat(age);
    const parsedWeight = Number.parseFloat(weight);
    const parsedHeight = height ? Number.parseFloat(height) : undefined;

    if (!Number.isFinite(parsedAge) || !Number.isFinite(parsedWeight)) {
      return null;
    }

    return calculateRdaTargets({
      age: parsedAge,
      gender: gender as any,
      weightKg: parsedWeight,
      heightCm: Number.isFinite(parsedHeight) ? parsedHeight : undefined,
      workoutLevel: workoutLevel as any,
      weightGoal: weightGoal as WeightGoal,
    });
  }, [age, weight, height, gender, workoutLevel, weightGoal]);

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl bg-white p-8 shadow-2xl shadow-slate-200"
    >
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Let’s personalize your daily targets
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          We’ll use this information to tune your calories and macronutrients.
          You can update these values anytime from your profile.
        </p>
      </div>

      {state?.error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Age</span>
          <input
            name="age"
            type="number"
            min={13}
            max={90}
            required
            value={age}
            onChange={(event) => setAge(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            placeholder="28"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Weight (kg)</span>
          <input
            name="weight"
            type="number"
            min={35}
            max={200}
            step={0.1}
            required
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            placeholder="65"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Height (cm) <span className="text-slate-400">(optional)</span>
          </span>
          <input
            name="height"
            type="number"
            min={120}
            max={220}
            step={0.5}
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            placeholder="170"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-slate-700">Gender</span>
          <div className="mt-1 flex gap-2">
            {[
              { label: "Female", value: "female" },
              { label: "Male", value: "male" },
              { label: "Other", value: "other" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-medium transition ${
                  gender === option.value
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={gender === option.value}
                  onChange={(event) => setGender(event.target.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">
            Workout Level
          </span>
          <select
            name="workoutLevel"
            value={workoutLevel}
            onChange={(event) => setWorkoutLevel(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            <option value="light">Light (1-2 workouts / week)</option>
            <option value="moderate">Moderate (3-4 workouts / week)</option>
            <option value="heavy">Heavy (5+ workouts / week)</option>
          </select>
        </label>

        <div className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Weight Goal</span>
          <div className="mt-1 grid gap-2 sm:grid-cols-3">
            {[
              { label: "Weight Loss", value: "loss" },
              { label: "Maintain Weight", value: "maintain" },
              { label: "Weight Gain", value: "gain" },
            ].map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-medium transition ${
                  weightGoal === option.value
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="weightGoal"
                  value={option.value}
                  checked={weightGoal === option.value}
                  onChange={(event) => setWeightGoal(event.target.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {preview ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-6 py-5">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
            Recommended daily targets
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-emerald-500">Calories</p>
              <p className="text-xl font-semibold text-emerald-700">
                {preview.calories.toLocaleString()} kcal
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-500">Protein</p>
              <p className="text-xl font-semibold text-emerald-700">
                {preview.protein} g
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-500">Carbs</p>
              <p className="text-xl font-semibold text-emerald-700">
                {preview.carbs} g
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-500">Fats</p>
              <p className="text-xl font-semibold text-emerald-700">
                {preview.fats} g
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-500">
          Enter your age and weight to preview daily nutrition targets.
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

