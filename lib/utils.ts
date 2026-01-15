import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type DateFormat = "date" | "date-time" | "time";

export function formatDate(
  isoDate: string | null | undefined,
  format: DateFormat = "date-time"
): string {
  if (!isoDate) return "-";

  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    switch (format) {
      case "date":
        return `${day}/${month}/${year}`;
      case "time":
        return `${hours}:${minutes}:${seconds}`;
      case "date-time":
      default:
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
}

