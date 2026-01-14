"use client";

import React, { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

type BaseOption = Record<string, any>;

type Props<T extends BaseOption> = {
  label?: string;
  title?: string;
  required?: boolean;
  error?: string;
  options: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  value?: T[keyof T] | string;
  placeholder?: string;
  renderOption?: (option: T) => ReactNode;
  onValueChange?: (value: string) => void;
  className?: string;
};

function CustomSelect<T extends BaseOption>({
  label,
  title = "Options",
  required,
  error,
  options,
  labelKey = 'name',
  valueKey = 'id',
  value,
  placeholder = "Click to select an option",
  renderOption,
  onValueChange,
  className = "w-[180px]",
}: Props<T>) {
  const hasError = !!error;
  const selectedValue = value !== undefined ? String(value) : undefined;

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <div className="relative w-full">
        <Select value={selectedValue} onValueChange={onValueChange}>
          <SelectTrigger
            className={`w-full
              ${hasError ? "border-destructive focus:ring-destructive" : ""}
            `}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>{title}</SelectLabel>

              {options.map((option) => {
                const optionValue = String(option[valueKey]);
                const optionLabel = String(option[labelKey]);

                return (
                  <SelectItem key={optionValue} value={optionValue}>
                    {renderOption ? renderOption(option) : optionLabel}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Error icon */}
        {hasError && (
          <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-destructive pointer-events-none" />
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

export default CustomSelect;
