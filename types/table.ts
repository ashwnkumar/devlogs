import { LucideIcon } from "lucide-react";

export type TableColumn<T extends object> = {
  label: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
};

export type TableActions = {
  label?: string;
  onClick: (row: any) => void;
  icon?: LucideIcon;
};
