"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "./row-actions";
import { Badge } from "@/components/ui/badge";
import type { PostApi } from "@/http/api";
import { ExternalLink } from "lucide-react";

export const postColumns = (
  onAction: (type: "view" | "edit" | "delete" | "restore" | "toggleStatus", post: PostApi) => void,
): ColumnDef<PostApi>[] => [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const image = row.original.image;
        return (
          <div className="flex justify-center">
            {image ? (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm">
                <img
                  src={`http://localhost:3000${image}`}
                  alt={row.original.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center rounded-lg text-slate-400 dark:text-zinc-500 text-[10px] font-bold border border-slate-200 dark:border-zinc-700/60">
                NO IMG
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: "platform",
      header: "Platform",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant="outline" className="capitalize px-2.5 py-1 font-bold text-[10px] bg-slate-50 border-slate-200 text-slate-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
            {row.original.platform}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "link",
      header: "External Link",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <a
            href={row.original.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-colors group"
          >
            <span className="max-w-[120px] truncate underline underline-offset-4 decoration-blue-200 group-hover:decoration-blue-600 dark:decoration-blue-900/50 dark:group-hover:decoration-blue-400">View Source</span>
            <ExternalLink className="w-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status?.toLowerCase();
        const isPublished = status === "published";

        return (
          <div className="flex justify-center">
            <Badge
              className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider min-w-[100px] justify-center transition-all shadow-none border ${
                isPublished
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:dark:bg-emerald-500/20"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 hover:dark:bg-amber-500/20"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full mr-2 ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isPublished ? "Published" : "Unpublished"}
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
          onAction={(type, item) => onAction(type, item as PostApi)}
          viewPermission="website.posts.read"
          editPermission="website.posts.update"
          deletePermission="website.posts.delete"
        />
      ),
    },
  ];
