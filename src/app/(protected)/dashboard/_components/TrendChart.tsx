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
} from "recharts";

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
  const hasData = data.some((point) => point.calories > 0 || point.protein > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
        Log meals to see your calorie and protein trend over the last 7 days.
      </div>
    );
  }

  // Format data for recharts
  const chartData = data.map((point) => ({
    date: point.label,
    calories: Math.round(point.calories),
    protein: Math.round(point.protein),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">
          7-day Calorie & Protein Trend
        </h3>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Calories (kcal)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Protein (g)
          </span>
        </div>
      </div>

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
              label={{
                value: "Value",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: "12px", fill: "#64748b" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "#1e293b", fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
            />
            <Line
              type="monotone"
              dataKey="calories"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Calories (kcal)"
            />
            <Line
              type="monotone"
              dataKey="protein"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ fill: "#0ea5e9", r: 4 }}
              activeDot={{ r: 6 }}
              name="Protein (g)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
