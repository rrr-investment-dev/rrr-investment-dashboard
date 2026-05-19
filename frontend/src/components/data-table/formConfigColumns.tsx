import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { FormConfigApi } from "@/http/api";
import { Badge } from "@/components/ui/badge";
import {
  ToggleLeft,
  ToggleRight,
  GripVertical
} from "lucide-react";
import { DataTableRowActions } from "./row-actions";
import { DragHandleContext } from "./data-table";

const DragHandle = () => {
  const dragHandleProps = React.useContext(DragHandleContext);
  if (!dragHandleProps) return null;
  return (
    <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-blue-600 transition-colors">
      <GripVertical className="h-5 w-5" />
    </div>
  );
};

export const getFormConfigColumns = (
  onAction: (type: "view" | "edit" | "delete" | "toggleStatus", field: FormConfigApi) => void,
): ColumnDef<FormConfigApi>[] => [
    {
      id: "drag-handle",
      header: "",
      cell: () => <DragHandle />,
    },
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-slate-400">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "label",
      header: "Label",
      cell: ({ row }) => {
        const field = row.original;
        return (
          <div className="flex flex-col items-center text-center">
            <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{field.label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="capitalize bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-350 border-slate-200 dark:border-zinc-800 text-[10px] px-2 py-0"
        >
          {row.getValue("type")}
        </Badge>
      ),
    },
    {
      accessorKey: "required",
      header: "Required",
      cell: ({ row }) => {
        const isRequired = row.getValue("required");
        return isRequired ? (
          <Badge className="bg-rose-50/50 text-rose-600 border border-rose-100/60 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30 hover:bg-rose-100/50 hover:dark:bg-rose-950/35 shadow-none text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
            Required
          </Badge>
        ) : (
          <span className="text-[10px] text-slate-400 dark:text-zinc-550 font-bold uppercase tracking-tighter">
            Optional
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const field = row.original;
        return (
          <div className="flex justify-center">
            <Badge
              className={`border-none shadow-none text-[10px] font-bold uppercase ${field.isActive
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 dark:bg-emerald-500/10 dark:text-emerald-400 hover:dark:bg-emerald-500/20"
                : "bg-slate-100 text-slate-500 hover:bg-slate-100/80 dark:bg-zinc-800 dark:text-zinc-400 hover:dark:bg-zinc-800/80"
                }`}
            >
              {field.isActive ? "Active" : "Hidden"}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onAction={(type, item) => onAction(type as any, item as FormConfigApi)}
          viewPermission="website.contact.config.read"
          editPermission="website.contact.config.update"
          deletePermission="website.contact.config.delete"
          enableStatusToggle={true}
          statusLabels={{ active: "Hide from Website", inactive: "Show on Website" }}
        />
      ),
    },
  ];
