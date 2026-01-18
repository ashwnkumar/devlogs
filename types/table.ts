import { LucideIcon } from "lucide-react";

export type TableColumn<T extends object> = {
  label: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;

  // New metadata fields for form generation
  dataType?:
    | "text"
    | "number"
    | "date"
    | "boolean"
    | "select"
    | "email"
    | "time"
    | "url";
  editable?: boolean; // Default: true - controls edit form inclusion
  addable?: boolean; // Default: true - controls add form inclusion
  required?: boolean; // Default: false
  options?: Array<{ label: string; value: string | number }>; // For select type
  placeholder?: string;
  defaultValue?: any; // Default value for add form
  validation?: {
    min?: number; // For number/date
    max?: number; // For number/date
    minLength?: number; // For text
    maxLength?: number; // For text
    pattern?: RegExp; // For text
    customValidator?: (value: any) => string | null; // Returns error message or null
  };
};

export type TableActions = {
  label?: string;
  onClick: (row: any) => void;
  icon?: LucideIcon;
};

export type TableComponentProps<T extends object> = {
  data?: T[];
  columns: TableColumn<T>[];
  actions?: TableActions[]; // Deprecated but still supported
  emptyMessage?: string;
  dataPath?: string;
  revalidate?: number | string;
  filterConfig: {
    data?: any[];
    label?: string;
    labelKey?: string;
    valueKey?: string;
    searchPlaceholder?: string;
  };

  // New props for add/edit/delete functionality
  enableAdd?: boolean; // Default: true if dataPath exists
  enableEdit?: boolean; // Default: true if dataPath exists
  enableDelete?: boolean; // Default: true if dataPath exists
  idField?: string; // Default: "id"
  addButtonLabel?: string; // Default: "Add"
  onAddSuccess?: (row: T) => void; // Optional callback
  onEditSuccess?: (row: T) => void; // Optional callback
  onDeleteSuccess?: (row: T) => void; // Optional callback
  customForm?: (
    mode: "add" | "edit",
    row: T | null,
    onSave: (data: any) => void,
    onCancel: () => void,
  ) => React.ReactNode; // Override form
};
