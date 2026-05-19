import { DataTable } from "@/components/data-table/data-table";
import { userColumns } from "@/components/data-table/userColumns";
import { fetchUsers, changeStatusOfUser } from "@/http/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

type ActionType = "view" | "edit" | "delete" | "restore" | "toggleStatus";

interface User {
  id: string;
  usrId: string;
  name: string;
  role?: string | { roleName?: string };
  designation?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

const UsersList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [designationFilter, setDesignationFilter] = useState<string>("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const uniqueRoles = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((u: any) => typeof u.role === 'object' ? u.role?.roleName : u.role).filter(Boolean))) as string[];
  }, [data]);

  const uniqueDesignations = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((u: any) => u.designation).filter(Boolean))) as string[];
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((user: any) => {
      // 1. Check Status
      const statusMatch = statusFilter === "all" || 
        (statusFilter === "active" ? user.isActive : !user.isActive);
      
      // 2. Check Role
      const userRole = typeof user.role === 'object' ? user.role?.roleName : user.role;
      const roleMatch = roleFilter === "all" || userRole === roleFilter;

      // 3. Check Designation
      const designationMatch = designationFilter === "all" || user.designation === designationFilter;

      return statusMatch && roleMatch && designationMatch;
    });
  }, [data, statusFilter, roleFilter, designationFilter]);

  const mutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      changeStatusOfUser(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      toast.success(
        `User ${selectedUser?.name} ${variables.isActive ? "restored" : "deleted"
        } successfully.`
      );
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    },
  });

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (isError) {
    toast.error("Failed to load users");
    return <div>Failed to load users</div>;
  }

  const handleRowAction = (type: ActionType, user: unknown) => {
    setSelectedUser(user as User);
    setActionType(type);

    if (type === "view") {
      navigate(`/dashboard/admin/userMgt/user/${(user as User).id}`, {
        state: { user },
      });
      return;
    }

    if (type === "edit") {
      navigate(`/dashboard/admin/userMgt/user/${(user as User).id}/edit`, {
        state: { user },
      });
      return;
    }

    if (type === "delete" || type === "restore" || type === "toggleStatus") {
      setOpen(true);
    }
  };

  const handleConfirmAction = () => {
    if (!selectedUser) return;
    const newStatus = actionType === "restore" || actionType === "toggleStatus" ? !selectedUser?.isActive : false;

    mutation.mutate({
      id: selectedUser.id,
      isActive: newStatus,
    });
  };

  return (
    <>
      <DataTable
        columns={userColumns(handleRowAction)}
        data={filteredData}
        enableSearch={true}
        enablePagination={true}
        searchPlaceholder="Search Users..."
        extraFilters={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-card border-border rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {uniqueRoles.length > 0 && (
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px] bg-card border-border rounded-xl">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map((role: string) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {uniqueDesignations.length > 0 && (
              <Select value={designationFilter} onValueChange={setDesignationFilter}>
                <SelectTrigger className="w-[160px] bg-card border-border rounded-xl">
                  <SelectValue placeholder="Designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designations</SelectItem>
                  {uniqueDesignations.map((desig: string) => (
                    <SelectItem key={desig} value={desig}>{desig}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
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
              {actionType === "restore" ? "Restore User" : "Delete User"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "restore" ? (
                <>
                  Are you sure you want to restore <b>{selectedUser?.name}</b>? This will re-enable their account and access privileges.
                </>
              ) : (
                <>
                  Are you sure you want to delete <b>{selectedUser?.name}</b>? This user will no longer be able to log in or access the system.
                  You can restore this user later if needed.
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
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                actionType === "restore" ? "Confirm Restore" : "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersList;
