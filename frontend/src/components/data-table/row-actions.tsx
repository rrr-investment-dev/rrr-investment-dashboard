"use client";

import type { Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { can } from "@/auth/can";

type Props<TData> = {
  row: Row<TData>;
  onAction: (type: "view" | "edit" | "delete" | "restore" | "toggleStatus", row: TData) => void;
  viewPermission?: string;
  editPermission?: string;
  deletePermission?: string;
  enableStatusToggle?: boolean;
  statusLabels?: { active: string; inactive: string };
};

export function DataTableRowActions<TData>({
  row,
  onAction,
  viewPermission,
  editPermission,
  deletePermission,
  enableStatusToggle,
  statusLabels = { active: "Deactivate", inactive: "Activate" },
}: Props<TData>) {
  const { user } = useAuth();

  const isActive = (row.original as any).isActive !== false;

  // If a permission key is provided, check it — otherwise show the button
  const canView = viewPermission ? can(user, viewPermission) : true;
  const canEdit = editPermission ? can(user, editPermission) : true;
  const canDelete = deletePermission ? can(user, deletePermission) : true;

  if (!canView && !canEdit && !canDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canView && (
          <DropdownMenuItem onClick={() => onAction("view", row.original)}>
            View
          </DropdownMenuItem>
        )}
        {canEdit && (
          <DropdownMenuItem onClick={() => onAction("edit", row.original)}>
            Edit
          </DropdownMenuItem>
        )}
        {canEdit && (row.original as any).status && ((row.original as any).status === "published" || (row.original as any).status === "unpublished") && (
          <DropdownMenuItem
            onClick={() => onAction("toggleStatus", row.original)}
            className={(row.original as any).status?.toLowerCase() === "published"
              ? "text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:text-amber-500 dark:focus:text-amber-450 dark:focus:bg-amber-950/35"
              : "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:text-emerald-500 dark:focus:text-emerald-450 dark:focus:bg-emerald-950/35"
            }
          >
            {(row.original as any).status?.toLowerCase() === "published" ? "Mark as Unpublished" : "Mark as Published"}
          </DropdownMenuItem>
        )}
        {canEdit && (row.original as any).status && ((row.original as any).status === "read" || (row.original as any).status === "unread") && (
          <DropdownMenuItem
            onClick={() => onAction("toggleStatus", row.original)}
            className={(row.original as any).status?.toLowerCase() === "unread"
              ? "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:text-emerald-500 dark:focus:text-emerald-450 dark:focus:bg-emerald-950/35"
              : "text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:text-amber-500 dark:focus:text-amber-450 dark:focus:bg-amber-950/35"
            }
          >
            {(row.original as any).status?.toLowerCase() === "unread" ? "Mark as Read" : "Mark as Unread"}
          </DropdownMenuItem>
        )}
        {canEdit && enableStatusToggle && (row.original as any).isActive !== undefined && (
          <DropdownMenuItem
            onClick={() => onAction("toggleStatus", row.original)}
            className={(row.original as any).isActive
              ? "text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:text-amber-500 dark:focus:text-amber-450 dark:focus:bg-amber-950/35"
              : "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:text-emerald-500 dark:focus:text-emerald-450 dark:focus:bg-emerald-950/35"
            }
          >
            {(row.original as any).isActive ? statusLabels.active : statusLabels.inactive}
          </DropdownMenuItem>
        )}
        {canDelete && isActive && (
          <DropdownMenuItem
            onClick={() => onAction("delete", row.original)}
            className="text-red-650 focus:text-red-650 focus:bg-red-50 dark:text-red-400 dark:focus:text-red-300 dark:focus:bg-red-950/35"
          >
            Delete
          </DropdownMenuItem>
        )}
        {canDelete && !isActive && (
          <DropdownMenuItem
            onClick={() => onAction("restore", row.original)}
            className="text-green-650 focus:text-green-650 focus:bg-green-50 dark:text-emerald-400 dark:focus:text-emerald-300 dark:focus:bg-emerald-950/35"
          >
            Restore
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
