"use client";

type MacroData = {
  label: string;
  total: number;
  target: number | null;
  unit: string;
};

type MacroChartProps = {
  macros: MacroData[];
};

export function MacroChart({ macros }: MacroChartProps) {
  const maxValue = Math.max(
    ...macros.map((m) => Math.max(m.total, m.target ?? 0)),
    100,
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Daily Progress</h3>
      <div className="space-y-6">
        {macros.map((macro) => {
          const percentage =
            macro.target && macro.target > 0
              ? Math.min(100, (macro.total / macro.target) * 100)
              : 0;
          const barWidth = (macro.total / maxValue) * 100;
          const targetBarWidth =
            macro.target && macro.target > 0
              ? (macro.target / maxValue) * 100
              : 0;

          return (
            <div key={macro.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  {macro.label}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600">
                    {Math.round(macro.total)}
                    {macro.unit}
                  </span>
                  {macro.target ? (
                    <span className="text-slate-400">
                      / {Math.round(macro.target)}
                      {macro.unit}
                    </span>
                  ) : null}
                  {macro.target ? (
                    <span
                      className={`text-xs font-semibold ${
                        percentage >= 100
                          ? "text-emerald-600"
                          : percentage >= 75
                            ? "text-amber-600"
                            : "text-slate-500"
                      }`}
                    >
                      {Math.round(percentage)}%
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="relative h-8 rounded-lg bg-slate-100 overflow-hidden">
                {/* Target indicator line */}
                {macro.target && targetBarWidth < 100 ? (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 opacity-50 z-10"
                    style={{ left: `${targetBarWidth}%` }}
                  />
                ) : null}
                {/* Progress bar */}
                <div
                  className={`h-full rounded-lg transition-all ${
                    percentage >= 100
                      ? "bg-emerald-500"
                      : percentage >= 75
                        ? "bg-amber-500"
                        : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, barWidth)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

