import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md duration-300 ease-in-out  ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-1">
        <div className="h-70 w-full">{children}</div>
      </CardContent>
    </Card>
  );
}
