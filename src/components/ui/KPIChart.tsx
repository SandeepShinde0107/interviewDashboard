import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Row = { date: string; completed: number; noShow: number; scheduled: number };

export function KPIChart({ data }: { data: Row[] }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-sm mb-6">
      <h3 className="text-white font-semibold mb-3">Interview Breakdown</h3>
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#cbd5e1" }} />
            <YAxis tick={{ fill: "#cbd5e1" }} />
            <Tooltip wrapperStyle={{ background: "#0b1220", borderRadius: 6, color: "#fff" }} />
            <Legend formatter={(val) => <span style={{ color: "#cbd5e1" }}>{val}</span>} />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
            <Bar dataKey="noShow" fill="#ef4444" name="No-Show" />
            <Bar dataKey="scheduled" fill="#3b82f6" name="Scheduled" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
