import { LucideIcon } from "lucide-react";

export type TableColumn<T extends object> = {
  label: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
};

export type TableActions<T extends object = object> = {
  label?: string;
  onClick: (row: T) => void;
  icon?: LucideIcon;
};

export type TableComponentProps<T extends object> = {
  title: string;
  data?: T[];
  columns: TableColumn<T>[];
  actions?: TableActions[]; // Deprecated but still supported
  emptyMessage?: string;
  dataPath?: string;
  revalidate?: number | string;
  filterConfig: {
    data?: unknown[];
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
    onSave: (data: Partial<T>) => void,
    onCancel: () => void,
  ) => React.ReactNode; // Override form
};
