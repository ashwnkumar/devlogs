"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  label: string;
  className?: string;
  required?: boolean;
  value?: Date | null;
  onChange?: (date: Date | undefined) => void;
};

export function DatePicker({
  label,
  className,
  required,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const handleDateChange = (date: Date | undefined) => {
    if (onChange) {
      onChange(date);
    }
    setOpen(false);
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      <Label htmlFor="date" className="px-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-between font-normal"
          >
            {value
              ? value instanceof Date
                ? value.toLocaleDateString()
                : new Date(value).toLocaleDateString()
              : "Select a date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            onSelect={(date) => {
              handleDateChange(date);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
