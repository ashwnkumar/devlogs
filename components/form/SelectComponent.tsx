import React from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

type Props = {
  label: string;
  description?: string;
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string
};

function SelectComponent({
  label,
  description,
  id,
  checked,
  onCheckedChange,
  className
}: Props) {
  return (
    <div className={`flex items-center gap-4 border w-full p-2 rounded-md ${className}`}>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="flex flex-col items-start">
        <span className="font-semibold ">{label}</span>
        {description && (
          <span className="font-light text-sm">{description}</span>
        )}
      </Label>
    </div>
  );
}

export default SelectComponent;
