import React, { useRef, useState, useCallback } from "react";
import { Upload, X, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FileCategory =
  | "images"
  | "pdf"
  | "excel"
  | "word"
  | "csv"
  | "text"
  | "all";

type FileUploadProps = {
  id?: string;
  accept?: FileCategory | FileCategory[];
  /** Maximum number of files that can be uploaded at once */
  limit?: number;
  maxSizeMB?: number; // optional: per file size limit
  error?: string;
  disabled?: boolean;
  multiple?: boolean; // still useful as a fallback/override
  onChange?: (files: File[]) => void;
  className?: string;
};

const ACCEPT_MAP: Record<FileCategory, string> = {
  images: "image/png,image/jpeg,image/jpg,image/gif,image/svg+xml",
  pdf: "application/pdf",
  excel:
    "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  word: "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  csv: "text/csv",
  text: "text/plain",
  all: "*/*",
};

const DEFAULT_LIMIT = 1;

export default function FileUpload({
  id = "file-upload",
  accept = "all",
  limit = DEFAULT_LIMIT,
  maxSizeMB,
  error,
  disabled = false,
  multiple = true,
  onChange,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasError = Boolean(error);
  const isAtLimit = files.length >= limit;
  const canUploadMore = !disabled && !isAtLimit;

  const resolvedAccept = Array.isArray(accept)
    ? accept.map((type) => ACCEPT_MAP[type]).join(",")
    : ACCEPT_MAP[accept];

  const getDisplayAccept = () => {
    if (Array.isArray(accept)) return accept.join(", ").toUpperCase();
    return accept;
  };

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0 || disabled) return;

      const validFiles: File[] = [];
      const currentCount = files.length;

      for (const file of newFiles) {
        if (currentCount + validFiles.length >= limit) break;

        // Optional: size validation
        if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
          // You could collect errors here instead of silently skipping
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      const updated = [...files, ...validFiles].slice(0, limit);
      setFiles(updated);
      onChange?.(updated);
    },
    [files, limit, disabled, maxSizeMB, onChange],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ""; // reset input so same file can be re-selected
  };

  const handleRemove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onChange?.(updated);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const triggerFileSelect = () => {
    if (canUploadMore && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div
        className={cn(
          "relative w-full rounded-xl border-2 border-dashed transition-all",
          "bg-neutral-50/40 dark:bg-neutral-900/30",
          canUploadMore
            ? dragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/40 cursor-pointer"
            : "border-muted-foreground/20 bg-muted/30 opacity-65 cursor-not-allowed",
          hasError && "border-destructive/60 bg-destructive/5",
        )}
        onClick={canUploadMore ? triggerFileSelect : undefined}
        onDragEnter={canUploadMore ? handleDrag : undefined}
        onDragOver={canUploadMore ? handleDrag : undefined}
        onDragLeave={canUploadMore ? handleDrag : undefined}
        onDrop={canUploadMore ? handleDrop : undefined}
      >
        <label
          htmlFor={id}
          className={cn(
            "flex flex-col items-center justify-center w-full min-h-[180px] px-6 py-10",
            "select-none pointer-events-none",
          )}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-muted p-4">
              <Upload
                className={cn("h-7 w-7", hasError && "text-destructive")}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-base font-medium">
                {isAtLimit ? (
                  <>Maximum files reached ({limit})</>
                ) : (
                  <>Click or drag & drop to upload</>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: {getDisplayAccept()}
                {maxSizeMB ? ` • Max ${maxSizeMB}MB per file` : ""}
              </p>
            </div>
          </div>
        </label>

        <input
          id={id}
          type="file"
          accept={resolvedAccept}
          multiple={multiple && limit > 1}
          disabled={disabled || !canUploadMore}
          ref={inputRef}
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {/* Selected files preview */}
      {files.length > 0 && (
        <div className="space-y-2 pt-1">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3.5 py-2.5 text-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {hasError && (
        <p className="text-sm text-destructive font-semibold">{error}</p>
      )}
    </div>
  );
}
