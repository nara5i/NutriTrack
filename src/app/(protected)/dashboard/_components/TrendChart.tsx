"use client";

type TrendPoint = {
  label: string;
  dateLabel: string;
  calories: number;
  protein: number;
};

type TrendChartProps = {
  data: TrendPoint[];
};

export function TrendChart({ data }: TrendChartProps) {
  const points = data.length ? data : [];
  const maxValue = Math.max(
    ...points.map((point) => Math.max(point.calories, point.protein)),
    1,
  );

  const chartWidth = 100;
  const chartHeight = 80;
  const chartTop = 5;
  const chartBottom = chartTop + chartHeight;
  const xStep =
    points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;

  function buildPoints(key: "calories" | "protein") {
    if (!points.length) {
      return "";
    }
    return points
      .map((point, index) => {
        const x = index * xStep;
        const value = point[key];
        const y = chartBottom - (value / maxValue) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");
  }

  if (!points.some((point) => point.calories > 0 || point.protein > 0)) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Log meals to see your calorie and protein trend over the last 7 days.
      </div>
    );
  }

  const caloriesPoints = buildPoints("calories");
  const proteinPoints = buildPoints("protein");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">
          7-day Calorie & Protein Trend
        </h3>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Calories
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Protein
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
        <div className="relative h-64 w-full">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartTop + chartHeight + 5}`}
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = chartBottom - (percent / 100) * chartHeight;
              const value = Math.round((percent / 100) * maxValue);
              return (
                <g key={percent}>
                  <line
                    x1={0}
                    x2={chartWidth}
                    y1={y}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth={0.4}
                    strokeDasharray="2 2"
                  />
                  <text
                    x={chartWidth}
                    y={y - 1}
                    textAnchor="end"
                    fontSize={4}
                    fill="#94a3b8"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Calories line */}
            <polyline
              points={caloriesPoints}
              fill="none"
              stroke="#10b981"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Protein line */}
            <polyline
              points={proteinPoints}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Points */}
            {points.map((point, index) => {
              const x = index * xStep;
              const caloriesY = chartBottom - (point.calories / maxValue) * chartHeight;
              const proteinY = chartBottom - (point.protein / maxValue) * chartHeight;
              return (
                <g key={point.label}>
                  <circle cx={x} cy={caloriesY} r={1.2} fill="#10b981" />
                  <circle cx={x} cy={proteinY} r={1.2} fill="#0ea5e9" />
                </g>
              );
            })}
          </svg>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
          {points.map((point) => (
            <div key={point.label}>
              <p className="font-semibold text-slate-700">{point.label}</p>
              <p>{point.dateLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


