"use client";

import { useActionState, useState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { logFoodAction } from "../actions";

type FoodOption = {
  id: string;
  name: string;
  brand: string | null;
  serving_size_grams: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type Mode = "existing" | "custom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
    >
      {pending ? "Saving..." : "Add to log"}
    </button>
  );
}

type LogFoodFormProps = {
  foods: FoodOption[];
};

const initialState = { error: undefined as string | undefined, success: undefined as string | undefined };

export function LogFoodForm({ foods }: LogFoodFormProps) {
  const [mode, setMode] = useState<Mode>("existing");
  const [selectedFoodId, setSelectedFoodId] = useState<string>(
    foods[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState("1");
  const [searchQuery, setSearchQuery] = useState(
    foods[0]?.name ?? "",
  );
  const [showResults, setShowResults] = useState(false);

  const [state, formAction, pending] = useActionState(
    logFoodAction,
    initialState,
  );

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) {
      return foods;
    }
    const query = searchQuery.toLowerCase();
    return foods.filter(
      (food) =>
        food.name.toLowerCase().includes(query) ||
        food.brand?.toLowerCase().includes(query),
    );
  }, [foods, searchQuery]);

  const currentFood = foods.find((food) => food.id === selectedFoodId);
  const quantityNumber = Number.parseFloat(quantity);
  const validQuantity = Number.isFinite(quantityNumber) ? quantityNumber : 0;

  const handleFoodSelect = (foodId: string) => {
    setSelectedFoodId(foodId);
    setSearchQuery(
      foods.find((f) => f.id === foodId)?.name ?? "",
    );
    setShowResults(false);
  };

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl bg-white p-8 shadow-2xl shadow-slate-200"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Log today’s meal
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose an item from the database or add a custom meal.
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm font-medium text-slate-600">
          {(["existing", "custom"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`rounded-lg px-3 py-2 transition ${
                mode === option
                  ? "bg-emerald-500 text-white shadow shadow-emerald-200"
                  : "hover:bg-white hover:text-emerald-600"
              }`}
            >
              {option === "existing" ? "Food database" : "Custom entry"}
            </button>
          ))}
        </div>
      </div>

      <input type="hidden" name="mode" value={mode} />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">
            When did you have this?
          </span>
          <input
            type="datetime-local"
            name="consumedAt"
            defaultValue={new Date().toISOString().slice(0, 16)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        {mode === "existing" ? (
          <>
            <label className="relative block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                Food from NutriTrack database
              </span>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => {
                    setShowResults(true);
                    if (!searchQuery) {
                      setSearchQuery("");
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding to allow click on results
                    setTimeout(() => {
                      setShowResults(false);
                      // Reset to selected food name if search is cleared
                      if (!searchQuery.trim()) {
                        setSearchQuery(foods.find((f) => f.id === selectedFoodId)?.name ?? "");
                      }
                    }, 200);
                  }}
                  placeholder="Search for food..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
                <input
                  type="hidden"
                  name="foodId"
                  value={selectedFoodId}
                />
                {showResults && filteredFoods.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {filteredFoods.map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => handleFoodSelect(food.id)}
                        className="w-full px-4 py-3 text-left text-sm text-slate-900 hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none"
                      >
                        <div className="font-medium">{food.name}</div>
                        {food.brand && (
                          <div className="text-xs text-slate-500">{food.brand}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {showResults && searchQuery && filteredFoods.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-lg">
                    No foods found matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Quantity (servings)
              </span>
              <input
                type="number"
                name="quantity"
                min={0.1}
                step={0.1}
                required
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-6 py-5 text-sm text-slate-600">
              {currentFood ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-700">
                    {currentFood.name}
                    {currentFood.brand ? ` • ${currentFood.brand}` : ""}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-emerald-500">
                    Per serving ({currentFood.serving_size_grams ?? 100} g)
                  </p>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-[11px] uppercase text-emerald-500">
                        Calories
                      </p>
                      <p className="text-base font-semibold text-emerald-700">
                        {Number.isFinite(quantityNumber)
                          ? (currentFood.calories * validQuantity).toFixed(0)
                          : "—"}{" "}
                        kcal
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase text-emerald-500">
                        Protein
                      </p>
                      <p className="text-base font-semibold text-emerald-700">
                        {Number.isFinite(quantityNumber)
                          ? (currentFood.protein * validQuantity).toFixed(1)
                          : "—"}{" "}
                        g
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase text-emerald-500">
                        Carbs
                      </p>
                      <p className="text-base font-semibold text-emerald-700">
                        {Number.isFinite(quantityNumber)
                          ? (currentFood.carbs * validQuantity).toFixed(1)
                          : "—"}{" "}
                        g
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase text-emerald-500">
                        Fats
                      </p>
                      <p className="text-base font-semibold text-emerald-700">
                        {Number.isFinite(quantityNumber)
                          ? (currentFood.fats * validQuantity).toFixed(1)
                          : "—"}{" "}
                        g
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Select a food item to preview macros.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                Food name
              </span>
              <input
                type="text"
                name="customName"
                placeholder="Home-made protein bowl"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Serving size (grams)
              </span>
              <input
                type="number"
                step={0.1}
                name="customServingSize"
                placeholder="250"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Calories
              </span>
              <input
                type="number"
                name="customCalories"
                min={0}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Protein (g)
              </span>
              <input
                type="number"
                name="customProtein"
                min={0}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Carbs (g)
              </span>
              <input
                type="number"
                name="customCarbs"
                min={0}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Fats (g)
              </span>
              <input
                type="number"
                name="customFats"
                min={0}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Fibre (g) <span className="text-slate-400">(optional)</span>
              </span>
              <input
                type="number"
                name="customFiber"
                min={0}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </>
        )}

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">
            Notes <span className="text-slate-400">(optional)</span>
          </span>
          <textarea
            name="notes"
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            placeholder="e.g., Post-workout meal"
          />
        </label>
      </div>

      {state.error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {state.success}
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}


