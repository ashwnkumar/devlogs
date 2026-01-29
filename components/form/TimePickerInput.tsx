"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TimePickerInputProps = {
  label?: string;
  className?: string;
  required?: boolean;
  value: Date | null;
  onChange: (newTime: Date | null) => void;
  error?: string;
  disabled?: boolean;
};

/**
 * Convert a Date object to a time string in "HH:mm" format
 * @param date - The Date object to convert
 * @returns Time string in "HH:mm" format, or empty string if date is null
 */
export const dateToTimeString = (date: Date | null): string => {
  if (!date) return "";
  try {
    return format(date, "HH:mm");
  } catch (error) {
    console.error("Error formatting date to time string:", error);
    return "";
  }
};

/**
 * Convert a time string in "HH:mm" format to a Date object
 * @param timeStr - The time string to convert
 * @returns Date object with the specified time, or null if timeStr is empty
 */
export const timeStringToDate = (timeStr: string): Date | null => {
  if (!timeStr) return null;
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch (error) {
    console.error("Error converting time string to date:", error);
    return null;
  }
};

export function TimePickerInput({
  label,
  className,
  required,
  value,
  onChange,
  error,
  disabled,
}: TimePickerInputProps) {
  const hasError = !!error;
  const timeValue = dateToTimeString(value);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeStr = e.target.value;
    const newDate = timeStringToDate(newTimeStr);
    onChange(newDate);
  };

  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      {label && (
        <Label htmlFor="time-input" className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <input
          id="time-input"
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          disabled={disabled}
          aria-label={label || "Time input"}
          aria-invalid={hasError}
          aria-describedby={hasError ? "time-input-error" : undefined}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasError &&
              "border-destructive focus-visible:ring-destructive focus-visible:ring-2 focus-visible:ring-offset-2",
          )}
        />

        {/* Error icon overlay with tooltip */}
        {hasError && (
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive cursor-help"
                aria-hidden="true"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{error}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          id="time-input-error"
          className="text-sm text-destructive flex items-center gap-1 mt-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
