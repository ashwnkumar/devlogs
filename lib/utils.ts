import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type DateFormat = "date" | "date-time" | "time";

export function formatDate(
  isoDate: string | null | undefined,
  format: DateFormat = "date-time",
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

/**
 * Converts a Date object to datetime-local input format (YYYY-MM-DDTHH:mm)
 * Uses local timezone, not UTC
 * @param date - The Date object to convert
 * @returns String in YYYY-MM-DDTHH:mm format, or empty string if date is null/undefined
 */
export function toDateTimeLocalString(date: Date | null | undefined): string {
  if (!date) return "";

  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error("Error converting date to datetime-local format:", error);
    return "";
  }
}

/**
 * Check if a task type is a system Holiday or Leave type
 */
export function isHolidayOrLeave(taskTypeName: string): boolean {
  const normalized = taskTypeName.toLowerCase().trim();
  return normalized === "holiday" || normalized === "on leave";
}

/**
 * Create full-day time range using company working hours
 * @param date - The date for the log
 * @param workStart - Company work start time (HH:MM:SS format)
 * @param workEnd - Company work end time (HH:MM:SS format)
 * @returns Object with start and end Date objects
 */
export function createFullDayTimeRange(
  date: Date,
  workStart: string = "09:00:00",
  workEnd: string = "18:00:00",
): { start: Date; end: Date } {
  const [startHours, startMinutes, startSeconds] = workStart
    .split(":")
    .map(Number);
  const [endHours, endMinutes, endSeconds] = workEnd.split(":").map(Number);

  const start = new Date(date);
  start.setHours(startHours, startMinutes, startSeconds || 0, 0);

  const end = new Date(date);
  end.setHours(endHours, endMinutes, endSeconds || 0, 0);

  return { start, end };
}
