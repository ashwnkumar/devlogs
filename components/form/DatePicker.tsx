"use client";

import * as React from "react";
import { ChevronDownIcon, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  className?: string;
  required?: boolean;
  value?: Date | null;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  error?: string;
};

export function DatePicker({
  label,
  className,
  required,
  value,
  onChange,
  disabled,
  error,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const hasError = !!error;

  const handleDateChange = (date: Date | undefined) => {
    if (onChange) {
      onChange(date);
    }
    setOpen(false);
  };

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <Label htmlFor="date" className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger disabled={disabled} asChild>
            <Button
              variant="outline"
              id="date"
              className={cn(
                "w-full justify-between font-normal",
                hasError &&
                  "border-destructive focus-visible:ring-destructive focus-visible:ring-2 focus-visible:ring-offset-2",
              )}
            >
              {value
                ? value instanceof Date
                  ? new Intl.DateTimeFormat("en-GB", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }).format(value)
                  : new Intl.DateTimeFormat("en-GB", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }).format(new Date(value))
                : "Select a date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              captionLayout="dropdown"
              onSelect={(date) => {
                handleDateChange(date);
              }}
            />
          </PopoverContent>
        </Popover>

        {/* Error icon overlay */}
        {hasError && (
          <AlertCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
