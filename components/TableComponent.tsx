"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TableActions, TableColumn } from "@/types";
import { Ban, EllipsisVertical } from "lucide-react";
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

type TableComponentProps<T extends object> = {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableActions[];
  viewPath?: string
};

function TableComponent<T extends object>({
  data,
  columns,
  actions = [],
  viewPath
}: TableComponentProps<T>) {
  const router = useRouter();
  const [view, setView] = useState<boolean>(false);
  const [selected, setSelected] = useState<T>({} as T);

  const handleRowClick = (row: T) =>{
    if (viewPath) {
      router.push(`/${viewPath}/${row.id}`)
    } else {
      handleViewDetails(row)
    }
  }
  
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
          <EmptyDescription>
            No data found. Add a company to get started or please try again
            later.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            {columns.map((col, colIdx) => (
              <TableHead key={String(col.key) || colIdx}>{col.label}</TableHead>
            ))}
            {actions.length > 0 && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIdx) => (
            <TableRow onClick={() => handleRowClick(row)} key={rowIdx}>
              <TableCell>{rowIdx + 1}</TableCell>
              {columns.map((col) => (
                <TableCell key={String(col.key)}>
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </TableCell>
              ))}
              {actions.length > 0 && (
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
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
                  {col.render ? col.render(selected as T) : selected[col.key]}
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
