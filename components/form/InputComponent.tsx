"use client";

import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // added
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type Props = {
  label?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  type?: string;
} & (
  | React.InputHTMLAttributes<HTMLInputElement>
  | React.TextareaHTMLAttributes<HTMLTextAreaElement>
);

export default function InputComponent({
  label,
  error,
  required,
  type = "text",
  className = "",
  inputClassName = "",
  ...props
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const isTextarea = type === "textarea";
  const inputType = isPassword && showPassword ? "text" : type;
  const hasError = !!error;

  // Only show password toggle for actual password inputs (not textarea)
  const showToggle = isPassword && !isTextarea;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        {isTextarea ? (
          <Textarea
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={`
              ${inputClassName}
              ${
                hasError
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              ${
                (props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)
                  .className || ""
              }
            `.trim()}
          />
        ) : (
          <Input
            type={inputType}
            className={`
              ${inputClassName}
              ${
                hasError
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              ${showToggle ? "pr-10" : ""}
              ${
                (props as React.InputHTMLAttributes<HTMLInputElement>)
                  .className || ""
              }
              ${
                hasError
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              ${showToggle ? "pr-10" : ""}
              ${
                (props as React.InputHTMLAttributes<HTMLInputElement>)
                  .className || ""
              }
            `.trim()}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {/* Password toggle */}
        {showToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Error icon – only on regular inputs */}
        {hasError && !isTextarea && (
          <AlertCircle
            className={`absolute top-2.5 h-4 w-4 text-destructive pointer-events-none ${
              showToggle ? "right-10" : "right-3"
            }`}
          />
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
