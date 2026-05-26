import { useMemo } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUserWithPermissionById, fetchAllPermissions, type Permission, BACKEND_URL } from "@/http/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/userUtils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Mail, Phone, Shield, User, ArrowLeft, Plus, Minus, XCircle, CheckCircle2 } from "lucide-react";

const formatDate = (raw?: string) => {
  if (!raw) return "-";
  const date = new Date(raw);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ViewUserDetails = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const { state } = useLocation();
  const { data: userData, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserWithPermissionById(userId!),
    enabled: !!userId,
  });

  const { data: availablePermissions = [], isLoading: isPermsLoading } = useQuery({
    queryKey: ["allPermissions"],
    queryFn: fetchAllPermissions,
    staleTime: 1000 * 60 * 30,
  });

  const permissionMap = useMemo(() => {
    const map = new Map<string, Permission>();
    if (Array.isArray(availablePermissions)) {
      availablePermissions.forEach((p: Permission) => {
        if (p?._id) map.set(p._id, p);
      });
    }
    return map;
  }, [availablePermissions]);

  const consolidatedPermissions = useMemo(() => {
    const rawPerms = userData?.permissions;
    if (!Array.isArray(rawPerms)) return [];
    return rawPerms.map((p: any) => {
      if (typeof p === "object" && (p.module || p.key)) return p as Permission;
      const id = typeof p === "string" ? p : p?._id;
      if (!id) return null;
      return permissionMap.get(id) || (typeof p === "object" ? p : { _id: id, name: id } as Permission);
    }).filter((p): p is Permission => !!p);
  }, [userData?.permissions, permissionMap]);

  const permissionTree = useMemo(() => {
    if (consolidatedPermissions.length === 0) return null;
    const tree: Record<string, {
      actions: Permission[];
      menus: Record<string, { actions: Permission[]; subMenus: Record<string, Permission[]> }>;
      directSubMenus: Record<string, Permission[]>;
    }> = {};

    consolidatedPermissions.forEach((p) => {
      if (!p) return;
      const moduleName = p.module || "General Access";
      const menu = p.menu || "";
      const subMenu = p.subMenu || "";
      if (!tree[moduleName]) tree[moduleName] = { actions: [], menus: {}, directSubMenus: {} };
      if (!menu && !subMenu) {
        tree[moduleName].actions.push(p);
      } else if (!menu && subMenu) {
        if (!tree[moduleName].directSubMenus[subMenu]) tree[moduleName].directSubMenus[subMenu] = [];
        tree[moduleName].directSubMenus[subMenu].push(p);
      } else if (menu) {
        if (!tree[moduleName].menus[menu]) tree[moduleName].menus[menu] = { actions: [], subMenus: {} };
        if (!subMenu) {
          tree[moduleName].menus[menu].actions.push(p);
        } else {
          if (!tree[moduleName].menus[menu].subMenus[subMenu]) tree[moduleName].menus[menu].subMenus[subMenu] = [];
          tree[moduleName].menus[menu].subMenus[subMenu].push(p);
        }
      }
    });
    return tree;
  }, [consolidatedPermissions]);

  const mappedOverrides = useMemo(() => {
    if (!userData?.permissionOverride) return null;
    const mapIdsToPerms = (perms: any[]) => perms.map(p => {
      if (typeof p === "object" && (p.module || p.key)) return p as Permission;
      const id = typeof p === "string" ? p : p._id;
      return permissionMap.get(id) || (typeof p === "object" ? p : { _id: id, name: id } as Permission);
    });
    return {
      granted: mapIdsToPerms(userData.permissionOverride.grantedPermissions || []),
      revoked: mapIdsToPerms(userData.permissionOverride.revokedPermissions || []),
    };
  }, [userData?.permissionOverride, permissionMap]);

  const roleName = typeof userData?.role === "object"
    ? (userData.role?.displayRoleName || (userData.role as any)?.name || (userData.role as any)?.roleType)
    : (userData?.role || "-");

  const userIdDisplay = userData?.usr_id || (userData as any)?.usrId || "-";
  const userMobile = userData?.mobile || "-";
  const joinedDate = formatDate(userData?.createdAt || (userData as any)?.date);
  const isFullDataLoading = isUserLoading || isPermsLoading;

  const formatName = (name: string) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1").trim();
  };

  const ActionBadge = ({ perm }: { perm: Permission }) => {
    const action = perm.action?.toLowerCase() || "";
    let colorClass = "text-slate-600 bg-slate-50 border-slate-200 dark:text-zinc-400 dark:bg-zinc-800/50 dark:border-zinc-700/60";
    let iconColor = "text-slate-400 dark:text-zinc-500";

    const label = action
      ? action.charAt(0).toUpperCase() + action.slice(1)
      : (perm.label || formatName(perm.name || perm.action || perm.key || ""));

    if (action === "read" || action === "access" || action === "view") {
      colorClass = "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/40";
      iconColor = "text-blue-500 dark:text-blue-400";
    } else if (action === "create" || action === "add") {
      colorClass = "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/40";
      iconColor = "text-emerald-500 dark:text-emerald-400";
    } else if (action === "update" || action === "edit") {
      colorClass = "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/40";
      iconColor = "text-amber-500 dark:text-amber-400";
    } else if (action === "delete" || action === "remove") {
      colorClass = "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/40";
      iconColor = "text-rose-500 dark:text-rose-400";
    }

    return (
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${colorClass}`}>
        <CheckCircle2 className={`h-3 w-3 ${iconColor}`} />
        {label}
      </span>
    );
  };

  if (isFullDataLoading) {
    return (
      <div className="w-full space-y-6 px-4 pb-10 pt-6 sm:px-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isUserError || !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
        <XCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold">Error loading user details</h2>
        <p className="text-muted-foreground">The user might not exist or there was a server error.</p>
        <Button onClick={() => navigate("/dashboard/admin/userMgt/user")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 px-4 pb-10 pt-6 sm:px-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="flex flex-row items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-sm"
            onClick={() => navigate("/dashboard/admin/userMgt/user")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">User Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">View user data and access permissions in one place.</p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* User Info Card */}
        <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="p-6 lg:p-8">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <User className="h-5 w-5 text-primary" />
              User Info
            </h2>
            <p className="text-sm text-muted-foreground">Personal and user details for this user.</p>

            <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
              {/* Avatar Column */}
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700/60 bg-slate-50 dark:bg-zinc-800/40 p-5">
                  <div className="relative">
                     <Avatar className="h-28 w-28 border-2 border-white dark:border-zinc-700 shadow-sm">
                       <AvatarImage src={userData.image ? (userData.image.startsWith("http") ? userData.image : `${BACKEND_URL}${userData.image}`) : undefined} className="object-cover" />
                       <AvatarFallback className="text-3xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold">
                        {getInitials(userData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-1.5 right-1.5 h-5 w-5 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm ${userData.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{userData.name ?? "-"}</h2>
                    <p className="text-sm text-muted-foreground">{userData.designation ?? "-"}</p>
                  </div>
                </div>
              </div>

              {/* Details Column */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-700/60 bg-slate-50 dark:bg-zinc-800/40 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">User ID</div>
                      <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{userIdDisplay}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`px-3 py-0.5 text-sm font-semibold ${userData.isActive
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                        : "border-rose-200 dark:border-rose-800 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                        }`}
                    >
                      {userData.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <Separator className="my-6 bg-slate-200 dark:bg-zinc-700/60" />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={userData.email} />
                    <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={userMobile} />
                    <InfoRow icon={<Shield className="h-4 w-4" />} label="Role" value={roleName} />
                    <InfoRow icon={<Calendar className="h-4 w-4" />} label="Create At" value={joinedDate} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Permissions Card */}
        <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Shield className="h-5 w-5 text-primary" />
                Access Permissions
              </h2>
              <p className="text-sm text-muted-foreground">Roles and access levels assigned to this user across different modules.</p>
            </div>

            {!permissionTree || Object.keys(permissionTree).length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/20">
                <Shield className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">No permissions found for this user.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 mt-6">
                {Object.entries(permissionTree).map(([moduleName, moduleProps]) => (
                  <div key={moduleName} className="rounded-xl border border-slate-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 shadow-sm overflow-hidden flex flex-col h-full">
                    {/* Module Header */}
                    <div className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700/60 px-4 py-3 flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary shadow-sm" />
                        {formatName(moduleName)}
                      </h4>
                      {moduleProps.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {moduleProps.actions.map((p) => <ActionBadge key={p._id} perm={p} />)}
                        </div>
                      )}
                    </div>

                    {/* Direct SubMenus */}
                    {Object.keys(moduleProps.directSubMenus).length > 0 && (
                      <div className="p-4 space-y-3 bg-slate-50/30 dark:bg-zinc-900/20 border-b border-slate-100 dark:border-zinc-800">
                        {Object.entries(moduleProps.directSubMenus).map(([subMenuName, perms]) => (
                          <div key={subMenuName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 gap-x-4 border-b border-slate-100 dark:border-zinc-800 last:border-0 pb-2 last:pb-0">
                            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 pl-1">{formatName(subMenuName)}</span>
                            <div className="inline-flex flex-wrap items-center gap-1.5 justify-end">
                              {perms.map((p) => <ActionBadge key={p._id} perm={p} />)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Menus and Submenus */}
                    {Object.keys(moduleProps.menus).length > 0 && (
                      <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800 flex-1">
                        {Object.entries(moduleProps.menus).map(([menuName, menuProps]) => (
                          <div key={menuName} className="p-4 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            <div className="flex items-center justify-between gap-4">
                              <div className="font-semibold text-[13px] text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                {formatName(menuName)}
                              </div>
                              {menuProps.actions.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap justify-end">
                                  {menuProps.actions.map((p) => <ActionBadge key={p._id} perm={p} />)}
                                </div>
                              )}
                            </div>

                            {Object.keys(menuProps.subMenus).length > 0 && (
                              <div className="mt-3 flex flex-col gap-2 rounded-lg bg-slate-50/50 dark:bg-zinc-900/30 p-3 border border-slate-100 dark:border-zinc-800">
                                {Object.entries(menuProps.subMenus).map(([subMenuName, perms]) => (
                                  <div key={subMenuName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 gap-x-4 border-b border-slate-100 dark:border-zinc-800 last:border-0 pb-2 last:pb-0">
                                    <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400 pl-1">{formatName(subMenuName)}</span>
                                    <div className="inline-flex flex-wrap items-center gap-1.5 justify-end">
                                      {perms.map((p) => <ActionBadge key={p._id} perm={p} />)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ViewUserDetails;

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{value || "-"}</div>
    </div>
  );
}
