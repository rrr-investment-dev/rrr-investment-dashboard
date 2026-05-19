import type { ColumnDef } from "@tanstack/react-table";
import type { InquiryApi } from "@/http/api";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "./row-actions";

export const getInquiryColumns = (
  onAction: (type: "view" | "edit" | "delete" | "toggleStatus", field: InquiryApi) => void,
): ColumnDef<InquiryApi>[] => [
    {
      id: "sender",
      header: "Sender Details",
      cell: ({ row }) => {
        const inquiry = row.original;
        // Attempt to extract common fields like name, email
        const name = inquiry.responses.fullName || inquiry.responses.name || inquiry.responses.firstName || "Anonymous Sender";
        const email = inquiry.responses.email || inquiry.responses.emailAddress || "-";

        return (
          <div className="flex flex-col items-center text-center">
            <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{name}</span>
            <span className="text-xs text-slate-500 dark:text-zinc-450">{email}</span>
          </div>
        );
      },
    },
    {
      id: "details",
      header: "Summary",
      cell: ({ row }) => {
        const responses = row.original.responses || {};
        // Just show how many fields they filled
        const count = Object.keys(responses).length;
        return (
          <div className="flex justify-center">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{count} fields submitted</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex justify-center">
            <Badge
              className={`shadow-none text-[10px] font-bold uppercase ${
                status === "unread"
                  ? "bg-rose-50/50 text-rose-600 border border-rose-100/60 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30 hover:bg-rose-100/50 hover:dark:bg-rose-950/35"
                  : "bg-emerald-50/50 text-emerald-600 border border-emerald-100/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30 hover:bg-emerald-100/50 hover:dark:bg-emerald-950/35"
              }`}
            >
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Received On",
      cell: ({ row }) => {
        return (
          <div className="flex justify-center text-center">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-350">
              {new Date(row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
            </span>
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
          onAction={(type, item) => onAction(type as any, item as InquiryApi)}
          viewPermission="website.contact.inquiry.read"
          deletePermission="website.contact.inquiry.delete"
          enableStatusToggle={true}
          statusLabels={{ active: "Mark as Unread", inactive: "Mark as Read" }}
        />
      ),
    },
  ];
