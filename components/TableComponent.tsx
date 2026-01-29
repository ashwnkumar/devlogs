"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TableActions, TableColumn } from "@/types";
import { Ban, Edit, EllipsisVertical, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Skeleton } from "./ui/skeleton";

type TableComponentProps<T extends object & { id: string | number }> = {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableActions<T>[];
  viewPath?: string;
  onEdit: (row: T, idx?: string) => void;
  onDelete: (row: T, idx?: string) => void;
  loading?: boolean;
  hideEdit?: boolean;
  hideDelete?: boolean;
  disableClick?: boolean;
};

function TableComponent<T extends object & { id: string | number }>({
  data,
  columns,
  actions = [],
  viewPath,
  onEdit,
  hideEdit = false,
  hideDelete = false,
  onDelete,
  loading,
  disableClick = false,
}: TableComponentProps<T>) {
  const router = useRouter();
  const [view, setView] = useState<boolean>(false);
  const [selected, setSelected] = useState<T>({} as T);

  const handleRowClick = (row: T) => {
    if (viewPath) {
      router.push(`/${viewPath}/${row.id}`);
    } else {
      handleViewDetails(row);
    }
  };

  const handleViewDetails = (row: T) => {
    setView(true);
    setSelected(row);
  };

  if (data.length === 0) {
    return (
      <Empty className="w-full h-full bg-linear-to-b from-muted to-background ">
        <EmptyHeader>
          <EmptyMedia variant={"icon"}>
            <Ban />
          </EmptyMedia>
          <EmptyTitle>No Data Found</EmptyTitle>
          <EmptyDescription>No data found.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <>
      {loading ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              {columns.map((col, i) => (
                <TableHead key={String(col.key) || i}>{col.label}</TableHead>
              ))}
              {actions.length > 0 && <TableHead>Actions</TableHead>}
              <TableHead>Actions</TableHead>
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
                    <Skeleton className="h-4 w-full max-w-60" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              {columns.map((col, colIdx) => (
                <TableHead
                  key={String(col.key) || colIdx}
                  style={
                    col.width
                      ? {
                          width: col.width,
                          minWidth: col.width,
                          maxWidth: col.width,
                        }
                      : undefined
                  }
                >
                  {col.label}
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIdx) => (
              <TableRow
                onClick={() => (disableClick ? null : handleRowClick(row))}
                key={rowIdx}
              >
                <TableCell>{rowIdx + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    style={
                      col.width
                        ? {
                            width: col.width,
                            minWidth: col.width,
                            maxWidth: col.width,
                          }
                        : undefined
                    }
                  >
                    {col.render
                      ? col.render(row, rowIdx)
                      : String(
                          (row as Record<string, unknown>)[col.key as string] ??
                            "",
                        )}
                  </TableCell>
                ))}
                {/* {actions.length > 0 && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"outline"} size={"icon"}>
                          <EllipsisVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40" align="end">
                        {actions.map((action, actionIdx) => (
                          <DropdownMenuItem key={actionIdx} asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => action.onClick(row)}
                            >
                              {action.icon && <action.icon />}
                              {action.label}
                            </Button>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )} */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {!hideEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(row, String(rowIdx))}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}

                    {!hideDelete && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(row, String(rowIdx))}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Sheet open={view} onOpenChange={setView}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle asChild>
              <h3 className="text-2xl">Details</h3>
            </SheetTitle>
          </SheetHeader>
          <div className="w-full h-full flex flex-col items-center justify-start p-4 gap-4">
            {columns.map((col) => (
              <div
                key={String(col.key)}
                className="flex items-start flex-col w-full"
              >
                <p className="font-medium text-sm">{col.label}:</p>
                <p className="text-lg font-light">
                  {col.render
                    ? col.render(selected as T, 0)
                    : String(
                        (selected as Record<string, unknown>)[
                          col.key as string
                        ] ?? "",
                      )}
                </p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default TableComponent;
