"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

// Dnd Kit Imports
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Create a context for drag handle props
export const DragHandleContext = React.createContext<any>(null);

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchKey?: string;

  enablePagination?: boolean;

  onReorder?: (data: TData[]) => void;
  extraFilters?: React.ReactNode;
}

// Draggable Row Component
function DraggableRow({ row, children, isDraggable }: { row: any, children: React.ReactNode, isDraggable: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.original._id || row.id,
    disabled: !isDraggable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    position: isDragging ? 'relative' : undefined,
    zIndex: isDragging ? 10 : undefined,
    backgroundColor: isDragging ? 'var(--slate-50)' : undefined,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`border-border hover:bg-muted/30 transition-colors ${isDragging ? "shadow-lg" : ""}`}
    >
      <DragHandleContext.Provider value={isDraggable ? { ...attributes, ...listeners } : null}>
        {children}
      </DragHandleContext.Provider>
    </TableRow>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  enableSearch = true,
  enablePagination = true,
  onReorder,
  extraFilters,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Dnd Kit Setup
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active && over && active.id !== over.id && onReorder) {
      const oldIndex = data.findIndex((item: any) => (item._id || item.id) === active.id);
      const newIndex = data.findIndex((item: any) => (item._id || item.id) === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(data, oldIndex, newIndex));
      }
    }
  }

  const rowIds = React.useMemo(() => 
    data.map((item: any) => item._id || item.id), 
    [data]
  );

  return (
    <div className="space-y-4">
      {(enableSearch || extraFilters) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {enableSearch ? (
            <div className="relative w-full max-w-sm group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder={searchPlaceholder ?? "Search..."}
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 h-10 bg-card border-border hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl font-medium"
              />
            </div>
          ) : <div />}
          
          {extraFilters && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {extraFilters}
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-center font-bold text-foreground/80 text-xs uppercase tracking-wider h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                <SortableContext
                  items={rowIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} isDraggable={!!onReorder}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4 text-foreground/70 font-medium text-center">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </DraggableRow>
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400 font-medium">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {enablePagination && (
        <div className="flex h-10 items-center justify-end gap-10 px-2">
          <div className="flex flex-row items-center gap-2 whitespace-nowrap">
            <span className="text-sm text-muted-foreground leading-none">Rows per page</span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[72px] px-2">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent side="top" align="start" className="z-50">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground whitespace-nowrap leading-none">
            Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of <span className="font-medium">{table.getPageCount()}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
