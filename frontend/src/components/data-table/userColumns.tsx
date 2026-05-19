"use client";

import type { ColumnDef } from "@tanstack/react-table";
// import { Checkbox } from "@/components/ui/checkbox";
import { DataTableRowActions } from "./row-actions";
import { Badge } from "@/components/ui/badge";

export type User = {
  id: string;
  usrId: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  designation?: string;
  isActive?: boolean;
};

export const userColumns = (
  onAction: (type: "view" | "edit" | "delete" | "restore" | "toggleStatus", user: unknown) => void,
): ColumnDef<User>[] => [
    //   {
    //     id: "select",
    //     header: ({ table }) => (
    //       <Checkbox
    //         checked={table.getIsAllPageRowsSelected()}
    //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       />
    //     ),
    //     cell: ({ row }) => (
    //       <Checkbox
    //         checked={row.getIsSelected()}
    //         onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    //   },
    {
      accessorKey: "usrId",
      header: "USER ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "designation",
      header: "Designation",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive;

        return (
          <Badge
            className={
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:dark:bg-emerald-500/20 min-w-20 justify-center shadow-none"
                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50/80 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 hover:dark:bg-rose-500/20 min-w-20 justify-center shadow-none"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onAction={onAction}
          viewPermission="admin.userManagement.users.read"
          editPermission="admin.userManagement.users.update"
          deletePermission="admin.userManagement.users.delete"
        />
      ),
    },
  ];
