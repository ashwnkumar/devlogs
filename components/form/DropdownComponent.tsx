"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

type BaseOption = Record<string, any>;

export interface DropdownComponentProps<T extends BaseOption> {
  label?: string;
  required?: boolean;
  error?: string;
  options: T[] | undefined;
  labelKey?: keyof T;
  valueKey?: keyof T;
  value?: string | number | null;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  addOptionLabel?: string; // optional customization
  canAdd?: boolean;
}

export function DropdownComponent<T extends BaseOption>({
  label,
  required = false,
  error,
  options,
  labelKey = "label" as keyof T,
  valueKey = "value" as keyof T,
  value,
  onValueChange,
  placeholder = "Select option...",
  className = "w-full",
  addOptionLabel = "Add Option",
  canAdd = false,
}: DropdownComponentProps<T>) {
  const [open, setOpen] = React.useState(false);
  const hasError = !!error;

  // Normalize value to string (handles number | string | null)
  const selectedValue = value != null ? String(value) : "";

  const selectedOption = options?.find(
    (opt) => String(opt[valueKey]) === selectedValue,
  );

  const displayText = selectedOption
    ? String(selectedOption[labelKey])
    : placeholder;

  return (
    <div className={cn("flex flex-col gap-1 ", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="dropdownComponent"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                hasError &&
                  "border-destructive relative focus-visible:ring-destructive focus-visible:ring-2 focus-visible:ring-offset-2",
                !hasError && "focus-visible:ring-ring",
              )}
            >
              <span className="truncate  text-start w-[85%]">
                {displayText}
              </span>
              <div className="absolute right-2 bg-background">
                <ChevronsUpDown className="shrink-0 opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent className=" p-0" align="end">
            <Command>
              <CommandInput placeholder="Search..." className="h-9" />
              <CommandList>
                <CommandEmpty>No option found.</CommandEmpty>
                <CommandGroup>
                  {options?.map((option) => {
                    const optValue = String(option[valueKey]);
                    const optLabel = String(option[labelKey]);

                    return (
                      <CommandItem
                        key={optValue}
                        value={optValue}
                        keywords={[optLabel]}
                        onSelect={(currentValue) => {
                          const newValue =
                            currentValue === selectedValue ? "" : currentValue;
                          onValueChange?.(newValue);
                          setOpen(false);
                        }}
                        className="w-full flex items-center justify-between"
                      >
                        <Check
                          className={cn(
                            selectedValue === optValue
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {optLabel}
                      </CommandItem>
                    );
                  })}
                  {canAdd && (
                    <>
                      <CommandSeparator />

                      <CommandItem
                        onSelect={() => {
                          // You can handle "add new" logic here (e.g. open modal, call callback, etc.)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {addOptionLabel}
                      </CommandItem>
                    </>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Error icon overlay */}
        {hasError && (
          <AlertCircle className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5 mt-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
