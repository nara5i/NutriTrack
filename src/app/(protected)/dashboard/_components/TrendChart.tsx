"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type TrendPoint = {
  label: string;
  dateLabel: string;
  calories: number;
  protein: number;
};

type TrendChartProps = {
  data: TrendPoint[];
  caloriesTarget?: number | null;
  proteinTarget?: number | null;
};

export function TrendChart({ data, caloriesTarget, proteinTarget }: TrendChartProps) {
  const hasCaloriesData = data.some((point) => point.calories > 0);
  const hasProteinData = data.some((point) => point.protein > 0);

  // Format data for recharts
  const chartData = data.map((point) => ({
    date: point.label,
    dateLabel: point.dateLabel,
    calories: Math.round(point.calories),
    protein: Math.round(point.protein),
  }));

  const caloriesMax = Math.max(
    ...chartData.map((d) => d.calories),
    caloriesTarget ?? 0,
    1000,
  );
  const proteinMax = Math.max(
    ...chartData.map((d) => d.protein),
    proteinTarget ?? 0,
    50,
  );

  return (
    <div className="space-y-8">
      {/* Calories Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Calories Trend (7 days)
          </h3>
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Calories (kcal)
          </span>
        </div>

        {!hasCaloriesData ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
            Log meals to see your calorie trend over the last 7 days.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                  domain={[0, caloriesMax]}
                  label={{
                    value: "Calories (kcal)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: "12px", fill: "#64748b" },
                  }}
                />
                {caloriesTarget && (
                  <ReferenceLine
                    y={caloriesTarget}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    label={{
                      value: "Target",
                      position: "right",
                      style: { fontSize: "11px", fill: "#f59e0b" },
                    }}
                  />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ color: "#1e293b", fontWeight: 600 }}
                  formatter={(value: number) => [`${value} kcal`, "Calories"]}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Protein Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Protein Trend (7 days)
          </h3>
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Protein (g)
          </span>
        </div>

        {!hasProteinData ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
            Log meals to see your protein trend over the last 7 days.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                  domain={[0, proteinMax]}
                  label={{
                    value: "Protein (g)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: "12px", fill: "#64748b" },
                  }}
                />
                {proteinTarget && (
                  <ReferenceLine
                    y={proteinTarget}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    label={{
                      value: "Target",
                      position: "right",
                      style: { fontSize: "11px", fill: "#f59e0b" },
                    }}
                  />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ color: "#1e293b", fontWeight: 600 }}
                  formatter={(value: number) => [`${value} g`, "Protein"]}
                />
                <Line
                  type="monotone"
                  dataKey="protein"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ fill: "#0ea5e9", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
