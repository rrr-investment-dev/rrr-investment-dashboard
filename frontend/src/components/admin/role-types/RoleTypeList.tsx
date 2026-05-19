import { DataTable } from "@/components/data-table/data-table";
import { roleTypeColumns } from "@/components/data-table/roleTypeColumns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllRoles, changeStatusOfRoleType } from "@/http/api";

type ActionType = "view" | "edit" | "delete" | "restore" | "toggleStatus";

const RoleTypeList = () => {
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>("delete");
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["roleTypes"],
    queryFn: fetchAllRoles,
  });

  const filteredData = useMemo(() => {
    if (statusFilter === "all") return data;
    return data.filter((role: any) => 
      statusFilter === "active" ? role.isActive : !role.isActive
    );
  }, [data, statusFilter]);

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => changeStatusOfRoleType(id, isActive),
    onSuccess: (_, { id, isActive }) => {
      const message = isActive ? "Role restored successfully." : "Role deleted successfully.";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["roleTypes"] });
      queryClient.invalidateQueries({ queryKey: ["activeRoles"] });
      queryClient.invalidateQueries({ queryKey: ["role", id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  });

  if (isLoading) {
    return <div>Loading roles...</div>;
  }

  if (isError) {
    toast.error("Failed to load roles");
    return <div>Failed to load roles</div>;
  }

  const handleRowAction = (type: ActionType, role: any) => {
    setSelectedRole(role);
    setActionType(type);

    if (type === "view") {
      navigate(`/dashboard/admin/userMgt/roleType/${role.id}`, {
        state: { role },
      });
      return;
    }

    if (type === "edit") {
      navigate(`/dashboard/admin/userMgt/roleType/${role.id}/edit`);
      return;
    }

    if (type === "delete" || type === "restore" || type === "toggleStatus") {
      setOpen(true);
    }
  };

  const handleConfirmAction = () => {
    const newStatus = actionType === "restore" || actionType === "toggleStatus" ? !selectedRole?.isActive : false;

    if (selectedRole?.id) {
      statusMutation.mutate({ id: selectedRole.id, isActive: newStatus });
    }

    setOpen(false);
  };

  return (
    <>
      <DataTable
        columns={roleTypeColumns(handleRowAction)}
        data={filteredData}
        enableSearch={true}
        enablePagination={true}
        searchPlaceholder="Search roles..."
        searchKey="roleName"
        extraFilters={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-card border-border rounded-xl">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className={`flex items-center gap-2 ${actionType === "restore" ? "text-green-600" : "text-red-600"
                }`}
            >
              {actionType === "restore" ? (
                <RefreshCw className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              {actionType === "restore" ? "Restore Role" : "Delete Role"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "restore" ? (
                <>
                  Are you sure you want to restore <b>{selectedRole?.roleName}</b>? This will re-enable the role and restore its permissions and access.
                </>
              ) : (
                <>
                  Are you sure you want to delete <b>{selectedRole?.roleName}</b>? This role will no longer be available or assignable to users.
                  You can restore this role later if needed.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={actionType === "restore" ? "default" : "destructive"}
              className={actionType === "restore" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              onClick={handleConfirmAction}
            >
              {actionType === "restore" ? "Confirm Restore" : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoleTypeList;
