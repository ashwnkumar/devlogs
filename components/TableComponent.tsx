"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { TableActions, TableColumn } from "@/types";
import { Ban, EllipsisVertical } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DropdownComponent } from "./form/DropdownComponent";
import InputComponent from "./form/InputComponent";

// ── Simple useDebounce hook (you can also extract it to hooks/useDebounce.ts)
function useDebounce<T>(value: T, delayMs: number = 450): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

type TableComponentProps<T extends object> = {
  data?: T[];
  columns: TableColumn<T>[];
  actions?: TableActions[];
  viewPath?: string;
  emptyMessage?: string;
  dataPath?: string;
  revalidate?: number | string;
  filterConfig: {
    data: any[];
    label: string;
    labelKey: string;
    valueKey: string;
    searchPlaceholder: string;
  };
};

function TableComponent<T extends object>({
  filterConfig,
  data: initialData,
  columns,
  actions = [],
  viewPath,
  emptyMessage,
  dataPath,
  revalidate,
}: TableComponentProps<T>) {
  const router = useRouter();
  const [view, setView] = useState(false);
  const [selected, setSelected] = useState<T>({} as T);
  const [tableData, setTableData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // ← This is the debounced value we actually use for fetching
  const debouncedSearch = useDebounce(search, 500);

  const showControls =
    (!!filterConfig?.data?.length && !!filterConfig.valueKey) ||
    tableData.length > 0;

  const fetchData = async () => {
    if (!dataPath) return;

    setLoading(true);
    let url = dataPath;

    // Only add params if they have meaningful values
    const params = new URLSearchParams();
    if (filter) params.set("f", filter);
    if (debouncedSearch) params.set("q", debouncedSearch);

    if (params.size > 0) {
      url += `?${params.toString()}`;
    }

    try {
      const response = await fetch(`/api${url}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch data");
      }

      const result = await response.json();
      setTableData(result.data || result || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Refetch when these change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revalidate, filter, debouncedSearch, dataPath]);

  const handleRowClick = (row: T) => {
    if (viewPath) {
      router.push(`/${viewPath}/${(row as any).id}`);
    } else {
      setSelected(row);
      setView(true);
    }
  };

  return (
    <div className="space-y-4">
      {showControls && (
        <div className="w-full flex items-center justify-between mb-4">
          <InputComponent
            className="w-1/3"
            label={filterConfig.searchPlaceholder}
            placeholder={filterConfig.searchPlaceholder}
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
          <div className="flex items-end gap-2">
            <DropdownComponent
              options={filterConfig.data}
              label={filterConfig.label}
              labelKey={filterConfig.labelKey}
              valueKey={filterConfig.valueKey}
              value={filter}
              onValueChange={setFilter}
              placeholder={filterConfig.label}
              className="w-64 min-w-[180px]"
            />
            {filter && (
              <Button variant="destructive" onClick={() => setFilter("")}>
                Clear filter
              </Button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                {columns.map((col, i) => (
                  <TableHead key={String(col.key) || i}>{col.label}</TableHead>
                ))}
                {actions.length > 0 && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                  {columns.map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-4 w-full max-w-[240px]" />
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : tableData.length === 0 ? (
        <div className="space-y-6">
          <Empty className="min-h-[400px] bg-linear-to-b from-muted/50 to-background">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Ban className="h-12 w-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No Data Found</EmptyTitle>
              {emptyMessage && (
                <EmptyDescription>{emptyMessage}</EmptyDescription>
              )}
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                {columns.map((col, i) => (
                  <TableHead key={String(col.key) || i}>{col.label}</TableHead>
                ))}
                {actions.length > 0 && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  className="cursor-pointer hover:bg-muted/60 transition-colors"
                  onClick={() => handleRowClick(row)}
                >
                  <TableCell>{rowIdx + 1}</TableCell>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render
                        ? col.render(row)
                        : (row as any)[col.key as string]}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <EllipsisVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {actions.map((action, idx) => (
                            <DropdownMenuItem key={idx} asChild>
                              <button
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm"
                                onClick={() => action.onClick?.(row)}
                              >
                                {action.icon && (
                                  <action.icon className="h-4 w-4" />
                                )}
                                {action.label}
                              </button>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Sheet open={view} onOpenChange={setView}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Details</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                {columns.map((col) => (
                  <div key={String(col.key)} className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      {col.label}
                    </div>
                    <div className="text-base">
                      {col.render
                        ? col.render(selected)
                        : (selected as any)[col.key as string]}
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}

export default TableComponent;
