"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Ban, EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { TableActions, TableColumn } from "@/types";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type TableComponentProps<T extends object> = {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableActions[];
};

function TableComponent<T extends object>({
  data,
  columns,
  actions = [],
}: TableComponentProps<T>) {
  if (data.length === 0) {
    return (
      <Empty className="w-full h-full bg-linear-to-b from-muted to-background ">
        <EmptyHeader>
          <EmptyMedia variant={"icon"}>
            <Ban />
          </EmptyMedia>
          <EmptyTitle>404 :/</EmptyTitle>
          <EmptyDescription>
            No data found. Add a company to get started or please try again
            later.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant={"default"}>Add Company</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
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
          <TableRow key={(row as any).id ?? rowIdx}>
            <TableCell>{rowIdx + 1}</TableCell>
            {columns.map((col) => (
              <TableCell key={String(col.key)}>
                {col.render ? col.render(row) : (row as any)[col.key]}
              </TableCell>
            ))}
            {actions.length > 0 && (
              <TableCell>
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
  );
}

export default TableComponent;
