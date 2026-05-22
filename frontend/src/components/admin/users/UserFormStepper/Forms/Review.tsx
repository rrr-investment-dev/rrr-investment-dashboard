"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Check, Shield, UserCircle } from "lucide-react";
import { serializePermissions } from "@/utils/permissionUtils";

/* ---------------- Types ---------------- */

type ReviewProps = {
  userInfo: {
    usrId: string;
    fullName: string;
    email: string;
    mobile: string;
    role: string;
    roleName?: string;
    designation: string;
    image?: string;
  };
  permissions: {
    [key: string]: any;
  };
  goToStep: (step: number) => void;
  setIsValid?: (valid: boolean) => void;
  isEdit?: boolean;
};

import { getInitials } from "@/utils/userUtils";

/* ---------------- Component ---------------- */

export default function Review({
  userInfo,
  permissions,
  setIsValid,
  isEdit,
}: ReviewProps) {

  useEffect(() => {
    setIsValid?.(true);
  }, [setIsValid]);

  const roleName = userInfo.roleName || userInfo.role;

  return (
    <Card className="max-w-[1100px] rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Review Details</h2>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Please verify the information before updating the user."
            : "Please verify the information before creating the user."}
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* ================= USER INFO ================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">User Information</h3>
            </div>
          </div>

          <Separator className="opacity-50" />

          <div className="grid grid-cols-[1fr_auto_260px] gap-8">
            {/* Left details */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              <InfoRow label="User ID" value={userInfo.usrId} />
              <InfoRow label="Full Name" value={userInfo.fullName} />
              <InfoRow label="Email Address" value={userInfo.email} />
              <InfoRow label="Mobile Number" value={userInfo.mobile?.toString()} />
              <InfoRow label="Role" value={roleName} />
              <InfoRow label="Designation" value={userInfo.designation} />
            </div>

            {/* Content Divider */}
            <Separator orientation="vertical" className="hidden lg:block opacity-50" />

            {/* Avatar */}
            <div className="flex justify-center items-start">
              <Avatar className="h-40 w-40 border-2 shadow-sm rounded-full">
                <AvatarImage src={userInfo.image} className="object-cover" />
                <AvatarFallback className="text-4xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 rounded-full font-semibold">
                  {getInitials(userInfo.fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </section>

        {/* ================= PERMISSIONS ================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Permissions</h3>
            </div>
          </div>

          <Separator className="opacity-50" />

          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            {(() => {
              // Build a hierarchical tree of permissions from flat array
              const tree: Record<string, any> = {};
              const activeKeys = serializePermissions(permissions);
              let hasAny = activeKeys.length > 0;

              activeKeys.forEach((key) => {
                const parts = key.split('.');
                const moduleName = parts.shift() || "Unknown";
                const action = parts.pop() || "Unknown";

                if (!tree[moduleName]) tree[moduleName] = { actions: [], directSubMenus: {}, menus: {} };

                if (parts.length === 0) {
                  // Module-level action (e.g. admin.access)
                  tree[moduleName].actions.push(action);
                } else if (parts.length === 1) {
                  // Direct SubMenu OR Menu-level action if it matches a category
                  const name = parts[0];
                  if (!tree[moduleName].directSubMenus[name]) {
                    tree[moduleName].directSubMenus[name] = [];
                  }
                  tree[moduleName].directSubMenus[name].push(action);
                } else if (parts.length === 2) {
                  // Nested Menu Category (e.g. admin.userMgt.users.read)
                  const menu = parts[0];
                  const subMenu = parts[1];
                  if (!tree[moduleName].menus[menu]) {
                    tree[moduleName].menus[menu] = { actions: [], subMenus: {} };
                  }
                  if (!tree[moduleName].menus[menu].subMenus[subMenu]) {
                    tree[moduleName].menus[menu].subMenus[subMenu] = [];
                  }
                  tree[moduleName].menus[menu].subMenus[subMenu].push(action);
                }
              });

              // CLEANUP: Merge directSubMenus into menus if names match
              Object.values(tree).forEach((modProps: any) => {
                Object.keys(modProps.directSubMenus).forEach((name) => {
                  if (modProps.menus[name]) {
                    // Merge actions into the existing category
                    modProps.menus[name].actions.push(...modProps.directSubMenus[name]);
                    delete modProps.directSubMenus[name];
                  }
                });
              });

              if (!hasAny) {
                return (
                  <div className="col-span-full py-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-muted/30">
                    <p className="text-sm text-muted-foreground">No permissions selected.</p>
                  </div>
                );
              }

              const formatTitle = (text: string | null) => {
                if (!text) return "";
                return text
                  .replace(/([A-Z])/g, " $1")
                  .split(/[\s_]+/)
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(" ")
                  .trim();
              };

              const formatName = formatTitle;

              const ActionBadge = ({ action }: { action: string }) => {
                let colorClass = "text-slate-600 bg-slate-50 border-slate-200 dark:text-zinc-400 dark:bg-zinc-800/40 dark:border-zinc-700/50";
                let iconColor = "text-slate-400 dark:text-zinc-500";

                if (action === 'read' || action === 'access') {
                  colorClass = "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/40";
                  iconColor = "text-blue-500 dark:text-blue-400";
                } else if (action === 'create') {
                  colorClass = "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/40";
                  iconColor = "text-emerald-500 dark:text-emerald-400";
                } else if (action === 'update') {
                  colorClass = "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/40";
                  iconColor = "text-amber-500 dark:text-amber-400";
                } else if (action === 'delete') {
                  colorClass = "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/40";
                  iconColor = "text-rose-500 dark:text-rose-400";
                }

                return (
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${colorClass}`}>
                    <Check className={`h-3 w-3 ${iconColor}`} />
                    {formatName(action)}
                  </span>
                );
              };

              return Object.entries(tree).map(([moduleName, moduleProps]: [string, any]) => (
                <div key={moduleName} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary shadow-sm" />
                      {formatName(moduleName)}
                    </h4>
                    {moduleProps.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {moduleProps.actions.map((act: string) => <ActionBadge key={`mod-${act}`} action={act} />)}
                      </div>
                    )}
                  </div>

                  {/* Direct SubMenus (Overview, etc.) */}
                  {Object.entries(moduleProps.directSubMenus).map(([subMenuName, actions]: [string, any]) => {
                    // If both access and read exist, prioritize read to avoid redundancy
                    const filteredActions = actions.includes('read')
                      ? actions.filter((a: string) => a !== 'access')
                      : actions;

                    return (
                      <div key={subMenuName} className="p-4 hover:bg-slate-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-[13px] text-slate-700 dark:text-slate-300">{formatName(subMenuName)}</div>
                          <div className="flex gap-1.5 flex-wrap justify-end">
                            {filteredActions.map((act: string) => <ActionBadge key={`direct-${act}`} action={act} />)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Menu Categories */}
                  {Object.keys(moduleProps.menus).length > 0 && (
                    <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800/60 flex-1 border-t border-slate-100 dark:border-zinc-800/60">
                      {Object.entries(moduleProps.menus).map(([menuName, menuProps]: [string, any]) => (
                        <div key={menuName} className="p-4 hover:bg-slate-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-[13px] text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              {formatName(menuName)}
                            </div>
                            {menuProps.actions.length > 0 && (
                              <div className="flex gap-1.5 flex-wrap justify-end">
                                {menuProps.actions.map((act: string) => <ActionBadge key={`menu-${act}`} action={act} />)}
                              </div>
                            )}
                          </div>

                          {/* Submenus */}
                          {Object.keys(menuProps.subMenus).length > 0 && (
                            <div className="mt-3 flex flex-col gap-2 rounded-lg bg-slate-50/50 dark:bg-zinc-950/20 p-3 border border-slate-100 dark:border-zinc-800/60">
                              {Object.entries(menuProps.subMenus).map(([subMenuName, actions]: [string, any]) => (
                                <div key={subMenuName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 gap-x-4 border-b border-slate-100 dark:border-zinc-800/50 last:border-0 pb-2 last:pb-0">
                                  <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400 pl-1">{formatName(subMenuName)}</span>
                                  <div className="inline-flex flex-wrap items-center gap-1.5 justify-end">
                                    {actions.map((act: string) => <ActionBadge key={`sub-${act}`} action={act} />)}
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
              ));
            })()}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

/* ---------------- Helper ---------------- */

function InfoRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-base font-medium text-slate-900 dark:text-slate-100">{value || "-"}</div>
    </div>
  );
}
