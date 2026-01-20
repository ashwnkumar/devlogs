"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flame, Clock, Calendar, ListChecks } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import ChecklistCard from "@/components/dashboard/ChecklistCard";

function DashboardPage() {
  const stats = {
    streak: 7,
    hoursThisWeek: 24.5,
    hoursAllTime: 156.8,
    tasksThisWeek: 12,
  };
  const statItems = [
    {
      title: "Daily Streak",
      value: stats.streak === 0 ? "—" : stats.streak,
      unit: stats.streak === 1 ? "day" : "days",
      icon: <Flame />,
      description:
        stats.streak === 0
          ? "Log today to start your streak"
          : stats.streak === 1
            ? "Keep it going tomorrow!"
            : "Solid consistency — nice work",
    },
    {
      title: "This Week",
      value: `${stats.hoursThisWeek.toFixed(1)}h`,
      icon: <Clock />,
      description:
        stats.hoursThisWeek === 0
          ? "No hours logged yet this week"
          : "Keep the momentum going",
    },
    {
      title: "All Time",
      value: `${stats.hoursAllTime.toFixed(1)}h`,
      icon: <Calendar />,
      description:
        stats.hoursAllTime === 0
          ? "Your journey starts here"
          : "Time invested in your craft",
    },
    {
      title: "Tasks This Week",
      value: stats.tasksThisWeek,
      icon: <ListChecks />,
      description:
        stats.tasksThisWeek === 0
          ? "No tasks logged yet"
          : stats.tasksThisWeek === 1
            ? "One task down — more to come"
            : "Solid output this week",
    },
  ];

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard (test data)
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your work, see your focus evolve.
        </p>
      </div>

      <ChecklistCard />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {statItems.map((item, index) => (
          <Card
            key={index}
            className="transition-all hover:shadow-md duration-300 ease-in-out "
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <div className="aspect-square flex items-center justify-center p-2 bg-primary/10 rounded-full text-primary">
                {item.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.value}
                {item.unit && (
                  <span className="text-lg font-normal text-muted-foreground ml-1">
                    {item.unit}
                  </span>
                )}
              </div>
              <CardDescription className="mt-1">
                {item.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      <DashboardCharts />
    </div>
  );
}

export default DashboardPage;
