import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, ShieldCheck, ArrowLeft, Info, FileText, Calendar, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchRoleTypeById } from "@/http/api";

type Permission = {
    name: string;
    _id: string;
    key: string;
    module: string;
    menu: string | null;
    subMenu: string | null;
    action: string;
    label: string;
    description: string;
};

type RoleDetails = {
    id?: string;
    roleUID?: string;
    roleName?: string;
    description?: string;
    isActive?: boolean;
    permissions?: Permission[];
    createdAt?: string;
};




const ViewRoleTypeDetails = () => {
    const navigate = useNavigate();
    const { roleTypeId } = useParams();

    const { data: roleDetails, isLoading, isError } = useQuery<RoleDetails>({
        queryKey: ["role", roleTypeId],
        queryFn: () => fetchRoleTypeById(roleTypeId!),
        enabled: !!roleTypeId,
    });

    const permissionTree = useMemo(() => {
        if (!roleDetails?.permissions) return null;

        const tree: Record<string, {
            actions: Permission[],
            menus: Record<string, { actions: Permission[], subMenus: Record<string, Permission[]> }>,
            directSubMenus: Record<string, Permission[]>
        }> = {};

        roleDetails.permissions.forEach((p) => {
            if (!p) return;
            const moduleName = p.module || "General";
            const menu = p.menu || "";
            const subMenu = p.subMenu || "";

            if (!tree[moduleName]) tree[moduleName] = { actions: [], menus: {}, directSubMenus: {} };

            if (!menu && !subMenu) {
                // Module-level action (e.g. admin.access)
                tree[moduleName].actions.push(p);
            } else if (!menu && subMenu) {
                // Direct SubMenu (e.g. website.posts.read)
                if (!tree[moduleName].directSubMenus[subMenu]) {
                    tree[moduleName].directSubMenus[subMenu] = [];
                }
                tree[moduleName].directSubMenus[subMenu].push(p);
            } else if (menu) {
                // Menu Category (e.g. admin.userManagement)
                if (!tree[moduleName].menus[menu]) {
                    tree[moduleName].menus[menu] = { actions: [], subMenus: {} };
                }
                if (!subMenu) {
                    tree[moduleName].menus[menu].actions.push(p);
                } else {
                    if (!tree[moduleName].menus[menu].subMenus[subMenu]) {
                        tree[moduleName].menus[menu].subMenus[subMenu] = [];
                    }
                    tree[moduleName].menus[menu].subMenus[subMenu].push(p);
                }
            }
        });

        return tree;
    }, [roleDetails?.permissions]);

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 animate-pulse text-muted-foreground/30" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading role details...</p>
                </div>
            </div>
        );
    }

    if (isError || !roleDetails) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 text-center">
                <Info className="h-10 w-10 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Failed to Load Role</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">Something went wrong while fetching the role details. Please try again or go back to the list.</p>
                <Button variant="outline" className="mt-6" onClick={() => navigate("/dashboard/admin/userMgt/roleType")}>Go Back</Button>
            </div>
        );
    }

    const data = roleDetails;

    const formattedDate = data.createdAt
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(data.createdAt))
        : "N/A";

    const formatName = (name: string) => {
        if (!name) return "";
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim();
    };

    const ActionBadge = ({ perm }: { perm: Permission }) => {
        const action = perm.action?.toLowerCase() || "";
        let colorClass = "text-slate-600 bg-slate-50 border-slate-200 dark:text-zinc-400 dark:bg-zinc-800/40 dark:border-zinc-700/50";
        let iconColor = "text-slate-400 dark:text-zinc-500";

        const label = action ? action.charAt(0).toUpperCase() + action.slice(1) : (perm.label || formatName(perm.name || perm.action || perm.key));

        if (action === 'read' || action === 'access' || action === 'view') {
            colorClass = "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/40";
            iconColor = "text-blue-500 dark:text-blue-400";
        } else if (action === 'create' || action === 'add') {
            colorClass = "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/40";
            iconColor = "text-emerald-500 dark:text-emerald-400";
        } else if (action === 'update' || action === 'edit') {
            colorClass = "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/40";
            iconColor = "text-amber-500 dark:text-amber-400";
        } else if (action === 'delete' || action === 'remove') {
            colorClass = "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/40";
            iconColor = "text-rose-500 dark:text-rose-400";
        }

        return (
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${colorClass} shadow-xs`}>
                <CheckCircle2 className={`h-3 w-3 ${iconColor}`} />
                {label}
            </span>
        );
    };

    return (
        <div className="w-full space-y-6 px-4 pb-10 pt-6 sm:px-6">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div className="flex flex-row items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                        onClick={() => navigate("/dashboard/admin/userMgt/roleType")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Role Details
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            View role information and its assigned permissions across the system.
                        </p>
                    </div>
                </div>
            </header>

            <div className="space-y-6">
                <Card className="overflow-hidden rounded-2xl border border-slate-100/50 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 shadow-sm backdrop-blur">
                    <div className="p-6 lg:p-8">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Role Info
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Details defining this role within the system.
                        </p>

                        <div className="mt-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-950/20 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-1">
                                        Role UID
                                    </div>
                                    <div className="text-base font-semibold tracking-tight text-slate-800 dark:text-slate-200">
                                        {data.roleUID ?? "-"}
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`px-3 py-0.5 text-sm font-bold ${data.isActive
                                        ? "border-emerald-200/60 bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                        : "border-red-200/60 bg-red-100/80 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                        }`}
                                >
                                    {data.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>

                            <Separator className="my-6 border-slate-200 dark:border-zinc-800/60" />

                            <div className="grid gap-6 sm:grid-cols-2">
                                <InfoRow
                                    label="Role Name"
                                    value={data.roleName}
                                    icon={<Shield className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
                                />
                                <InfoRow
                                    label="Status"
                                    value={data.isActive ? "Active" : "Inactive"}
                                    icon={<CheckCircle2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
                                />
                                <div className="sm:col-span-2">
                                    <InfoRow
                                        label="Description"
                                        value={data.description}
                                        icon={<FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
                                    />
                                </div>
                                <InfoRow
                                    label="Created At"
                                    value={formattedDate}
                                    icon={<Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
                                />
                                {/* <InfoRow
                                    label="Total Users"
                                    value="12"
                                    icon={<Info className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
                                /> */}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="overflow-hidden rounded-2xl border border-slate-100/50 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 shadow-sm backdrop-blur">
                    <div className="p-6 lg:p-8">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Default Access Permissions
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                These permissions are assigned to this role by default and define its base access across the system.
                            </p>
                        </div>

                        {!permissionTree || Object.keys(permissionTree).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/10 dark:bg-zinc-900/10 text-center">
                                <Shield className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">No Permissions Configured</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">This role type does not have any specific module permissions defined yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 mt-6">
                                {Object.entries(permissionTree).map(([moduleName, moduleProps]) => (
                                    <div key={moduleName} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col h-full">
                                        {/* Module Header */}
                                        <div className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 shadow-sm" />
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
                                            <div className="p-4 space-y-3 bg-slate-50/30 dark:bg-zinc-900/10 border-b border-slate-200 dark:border-zinc-800">
                                                {Object.entries(moduleProps.directSubMenus).map(([subMenuName, perms]) => (
                                                    <div key={subMenuName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 gap-x-4 border-b border-slate-100 dark:border-zinc-800/60 last:border-0 pb-2 last:pb-0">
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
                                            <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800/60 flex-1">
                                                {Object.entries(moduleProps.menus).map(([menuName, menuProps]) => (
                                                    <div key={menuName} className="p-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
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

                                                        {/* Submenus */}
                                                        {Object.keys(menuProps.subMenus).length > 0 && (
                                                            <div className="mt-3 flex flex-col gap-2 rounded-lg bg-slate-50/50 dark:bg-zinc-950/20 p-3 border border-slate-200/50 dark:border-zinc-800/60">
                                                                {Object.entries(menuProps.subMenus).map(([subMenuName, perms]) => (
                                                                    <div key={subMenuName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 gap-x-4 border-b border-slate-100 dark:border-zinc-800/50 last:border-0 pb-2 last:pb-0">
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

export default ViewRoleTypeDetails;

function InfoRow({
    icon,
    label,
    value,
}: {
    icon?: React.ReactNode;
    label: string;
    value?: string;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {icon}
                <span className="font-semibold text-slate-500 dark:text-slate-400">{label}</span>
            </div>
            <div className="mt-1 text-base font-bold text-slate-700 dark:text-slate-200">{value || "-"}</div>
        </div>
    );
}

