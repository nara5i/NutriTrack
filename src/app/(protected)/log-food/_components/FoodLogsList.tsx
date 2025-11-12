"use client";

import { useActionState } from "react";
import { deleteFoodLogAction } from "../actions";

type FoodLogEntry = {
  id: string;
  consumed_at: string;
  is_custom: boolean;
  custom_name: string | null;
  custom_serving_size_grams: number | null;
  quantity: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  fiber: number | null;
  notes: string | null;
  foods: {
    name: string | null;
    serving_size_grams: number | null;
    brand: string | null;
  } | null;
};

type FoodLogsListProps = {
  logs: FoodLogEntry[];
};

const initialState = { error: undefined as string | undefined, success: undefined as string | undefined };

function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function FoodLogsList({ logs }: FoodLogsListProps) {
  const [state, formAction, pending] = useActionState(
    deleteFoodLogAction,
    initialState,
  );

  if (!logs.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No food logged yet today. Add your first meal to see it here.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl bg-white p-8 shadow-2xl shadow-slate-200">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Today’s meals</h2>
        <p className="mt-1 text-sm text-slate-500">
          Remove entries if you made a mistake — you can re-add them anytime.
        </p>
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

      <ul className="space-y-4">
        {logs.map((log) => {
          const name = log.is_custom
            ? log.custom_name ?? "Custom item"
            : log.foods?.name ?? "Food item";
          const brand = log.is_custom ? null : log.foods?.brand;
          const servingSize = log.is_custom
            ? log.custom_serving_size_grams
            : log.foods?.serving_size_grams;

          return (
            <li
              key={log.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-slate-900">
                    {name}
                  </span>
                  {brand ? (
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-wide text-slate-600">
                      {brand}
                    </span>
                  ) : null}
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    {formatTime(log.consumed_at)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs uppercase text-slate-500">
                  <span>
                    {Math.round(Number(log.calories ?? 0))} kcal •{" "}
                    {(Number(log.protein ?? 0)).toFixed(1)}g protein •{" "}
                    {(Number(log.carbs ?? 0)).toFixed(1)}g carbs •{" "}
                    {(Number(log.fats ?? 0)).toFixed(1)}g fats
                  </span>
                  {servingSize ? (
                    <span>{servingSize} g per serving</span>
                  ) : null}
                  {log.quantity ? (
                    <span>{Number(log.quantity)} servings</span>
                  ) : null}
                </div>
                {log.notes ? (
                  <p className="text-xs text-slate-500">Notes: {log.notes}</p>
                ) : null}
              </div>

              <form
                action={formAction}
                className="flex justify-end md:flex-col md:items-end"
              >
                <input type="hidden" name="logId" value={log.id} />
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl border border-rose-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:border-rose-200 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Removing..." : "Remove"}
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


