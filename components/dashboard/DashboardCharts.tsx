"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "react-calendar-heatmap/dist/styles.css";
import { ChartCard } from "./ChartCard";
import { subDays, format } from "date-fns";

// ── Dummy data (replace with real props from parent later)
const last7DaysTasks = [
  { date: "Jan 14", tasks: 3 },
  { date: "Jan 15", tasks: 1 },
  { date: "Jan 16", tasks: 5 },
  { date: "Jan 17", tasks: 2 },
  { date: "Jan 18", tasks: 4 },
  { date: "Jan 19", tasks: 0 },
  { date: "Jan 20", tasks: 2 },
];

const tasksByCategory = [
  { name: "UI", value: 18 },
  { name: "UI + Logic", value: 12 },
  { name: "Logic", value: 9 },
  { name: "Research", value: 6 },
  { name: "N/A", value: 3 },
];

export function DashboardCharts() {
  const endDate = new Date(); // today ~ Jan 20, 2026
  const startDate = subDays(endDate, 30); // ~ last 30 days

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Chart 1: Tasks last 7 days – BarChart */}
      <ChartCard
        title="Tasks Logged – Last 7 Days"
        description="Daily task count to spot your rhythm"
      >
        <ResponsiveContainer>
          <BarChart
            data={last7DaysTasks}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              opacity={0.4}
            />
            <XAxis dataKey="date" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            />
            <Bar
              dataKey="tasks"
              fill="var(--primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 2: Tasks by Category – Donut Chart */}
      <ChartCard
        title="Tasks by Category"
        description="How your effort is distributed"
      >
        <div className="h-[260px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={tasksByCategory}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {tasksByCategory.map((_, index) => (
                  <Cell key={index} fill={`var(--chart-${index + 1})`} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          {tasksByCategory.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: `var(--chart-${index + 1})` }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
