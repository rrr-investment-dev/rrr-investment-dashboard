import type { ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "./row-actions";
import { Badge } from "@/components/ui/badge";

export type UserRoleType = {
  id: string;
  roleUID: string;
  roleName: string;
  description: string;
  isActive: boolean;
};

export const roleTypeColumns = (
  onAction: (type: "view" | "edit" | "delete" | "restore" | "toggleStatus", row: UserRoleType) => void,
): ColumnDef<UserRoleType>[] => [
    {
      accessorKey: "roleUID",
      header: "Role UID",
    },
    {
      accessorKey: "roleName",
      header: "Role Name",
    },
    {
      accessorKey: "description",
      header: () => <div className="text-center">Description</div>,
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[400px] mx-auto text-center truncate-text">
            {description.length > 40 ? `${description.substring(0, 40)}...` : description}
          </div>
        );
      },
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
          viewPermission="admin.userManagement.userType.read"
          editPermission="admin.userManagement.userType.update"
          deletePermission="admin.userManagement.userType.delete"
        />
      ),
    },
  ];
