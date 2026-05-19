"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Card, CardHeader, CardContent } from "@/components/ui/card";

/* ---------------- Types ---------------- */

type PermissionFormValues = {
  permissions: {
    [key: string]: boolean;
  };
};

type Props = {
  setIsValid?: (valid: boolean) => void;
  initialPermissions?: any;
  onDataChange?: (data: any) => void;
  availablePermissions: any[];
};

/* ---------------- Component ---------------- */

const formatTitle = (text: string | null) => {
  if (!text) return "";
  return text
    .replace(/([A-Z])/g, " $1")
    .split(/[\s_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
};

export default function SharedPermissionForm({ setIsValid, initialPermissions, onDataChange, availablePermissions }: Props) {

  const groupedPermissions = useMemo(() => {
    const modules: Record<string, any> = {};

    availablePermissions.forEach((p) => {
      const { module, menu, subMenu, key, action, label, order } = p;
      if (!module) return;

      if (!modules[module]) {
        modules[module] = {
          module,
          label: formatTitle(module),
          accessKey: null,
          order: order || 0,
          directSubMenus: {}, // menu is null, subMenu is not null
          menus: {}           // menu is not null
        };
      }

      // Case 1: Root Module Action (e.g., admin.access)
      if (!menu && !subMenu) {
        if (action === "access") {
          modules[module].accessKey = key;
          modules[module].order = order || 0; // Prioritize module-level permission order
        }
        return;
      }

      // Case 2: Direct SubMenu (e.g., admin.overview.read)
      if (!menu && subMenu) {
        if (!modules[module].directSubMenus[subMenu]) {
          modules[module].directSubMenus[subMenu] = { subMenu, label: formatTitle(subMenu), order: order || 0, actions: [] };
        }
        modules[module].directSubMenus[subMenu].actions.push({ key, label: action || label });
        return;
      }

      // Case 3: Menu Category (e.g., admin.userManagement)
      if (menu) {
        if (!modules[module].menus[menu]) {
          modules[module].menus[menu] = { menu, label: formatTitle(menu), order: order || 0, accessKey: null, actions: [], subMenus: {} };
        }

        if (!subMenu) {
          if (action === "access") {
            modules[module].menus[menu].accessKey = key;
          } else {
            modules[module].menus[menu].actions.push({ key, label: action || label });
          }
        } else {
          if (!modules[module].menus[menu].subMenus[subMenu]) {
            modules[module].menus[menu].subMenus[subMenu] = { subMenu, label: formatTitle(subMenu), order: order || 0, actions: [] };
          }
          modules[module].menus[menu].subMenus[subMenu].actions.push({ key, label: action || label });
        }
      }
    });

    // Convert objects to arrays and SORT by order
    return Object.values(modules)
      .map(m => ({
        ...m,
        directSubMenus: Object.values(m.directSubMenus).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
        menus: Object.values(m.menus)
          .map((mn: any) => ({
            ...mn,
            subMenus: Object.values(mn.subMenus).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          }))
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      }))
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  }, [availablePermissions]);

  const form = useForm<PermissionFormValues>({
    defaultValues: {
      permissions: initialPermissions || {},
    },
  });

  const { control, setValue, watch, reset } = form;

  /* Force reset when initialPermissions change (important for edit mode) */
  useEffect(() => {
    if (initialPermissions) {
      reset({ permissions: initialPermissions });
    }
  }, [initialPermissions, reset]);

  /* Permissions step is OPTIONAL → always valid */
  useEffect(() => {
    setIsValid?.(true);
  }, [setIsValid]);

  useEffect(() => {
    const subscription = watch((formValues: any) => {
      if (onDataChange) {
        onDataChange(formValues.permissions);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  const grantFullModuleAccess = (moduleConfig: any, enabled: boolean) => {
    if (moduleConfig.accessKey) {
      setValue(`permissions.${moduleConfig.accessKey}` as any, enabled, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }

    moduleConfig.directSubMenus?.forEach((subMenu: any) => {
      subMenu.actions?.forEach((action: any) => {
        setValue(`permissions.${action.key}` as any, enabled);
      });
    });

    moduleConfig.menus?.forEach((menu: any) => {
      if (menu.accessKey) {
        setValue(`permissions.${menu.accessKey}` as any, enabled);
      }
      menu.actions?.forEach((action: any) => {
        setValue(`permissions.${action.key}` as any, enabled);
      });
      menu.subMenus?.forEach((subMenu: any) => {
        subMenu.actions?.forEach((action: any) => {
          setValue(`permissions.${action.key}` as any, enabled);
        });
      });
    });
  };

  return (
    <Card className="max-w-[900px] rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-linear-to-br from-white to-slate-50/50 dark:from-zinc-900 dark:to-zinc-950/80 shadow-xs">
      <CardHeader>
        <h2 className="text-xl font-semibold">Role Permissions</h2>
        <p className="text-sm text-muted-foreground">
          Expand each module and select the specific permissions required for this role.
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <Accordion type="multiple" className="space-y-4">
            {groupedPermissions.map((moduleConfig: any) => (
              <AccordionItem key={moduleConfig.module} value={moduleConfig.module} className="border border-slate-200/60 dark:border-zinc-800/80 rounded-lg px-4 bg-muted/20">
                {/* ---------------- Module Header ---------------- */}
                <AccordionTrigger className="text-base font-medium py-4 hover:no-underline">
                  <div className="flex flex-1 items-center justify-between pr-4">
                    <span className="font-semibold text-primary">{moduleConfig.label}</span>

                    {/* Full Module Permission Toggle */}
                    <div
                      className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-md border border-slate-200/60 dark:border-zinc-800 shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(() => {
                        const currentPerms = watch(`permissions`) || {};

                        const getNestedValue = (obj: any, path: string) => {
                          if (!path) return false;
                          const parts = path.split('.');
                          // The path is "admin.access", but `currentPerms` starts *below* "permissions" 
                          // as we watched `permissions`. 
                          // Wait, if path is "admin.access", and currentPerms is { admin: { access: true } },
                          // then splitting and reducing works.
                          return parts.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj) || false;
                        };

                        let isAllChecked = true;

                        // Evaluate if the module has everything checked
                        if (moduleConfig.accessKey && !getNestedValue(currentPerms, moduleConfig.accessKey)) isAllChecked = false;

                        moduleConfig.directSubMenus?.forEach((subMenu: any) => {
                          subMenu.actions?.forEach((action: any) => {
                            if (!getNestedValue(currentPerms, action.key)) isAllChecked = false;
                          });
                        });

                        moduleConfig.menus?.forEach((menu: any) => {
                          if (menu.accessKey && !getNestedValue(currentPerms, menu.accessKey)) isAllChecked = false;
                          menu.actions?.forEach((action: any) => {
                            if (!getNestedValue(currentPerms, action.key)) isAllChecked = false;
                          });
                          menu.subMenus?.forEach((subMenu: any) => {
                            subMenu.actions?.forEach((action: any) => {
                              if (!getNestedValue(currentPerms, action.key)) isAllChecked = false;
                            });
                          });
                        });

                        return (
                          <Checkbox
                            checked={isAllChecked}
                            onCheckedChange={(checked) =>
                              grantFullModuleAccess(moduleConfig, Boolean(checked))
                            }
                          />
                        );
                      })()}
                      <span className="text-sm font-medium text-muted-foreground">
                        Select All
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="space-y-6 pb-6 pt-2">
                  {/* Module Access Key */}
                  {moduleConfig.accessKey && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-lg">
                      <FormField
                        control={control}
                        name={`permissions.${moduleConfig.accessKey}` as any}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                            </FormControl>
                            <span className="font-medium text-sm leading-none">Allow Module Access (Menu Visibility)</span>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Direct SubMenus (menu = null, subMenu = something) */}
                  {moduleConfig.directSubMenus?.map((subMenu: any) => (
                    <div key={subMenu.subMenu} className="rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 dark:bg-zinc-900/80 px-4 py-3 border-b border-slate-200/60 dark:border-zinc-800 flex items-center justify-between">
                        <span className="font-semibold text-sm">{subMenu.label}</span>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {subMenu.actions.map((action: any) => (
                            <FormField
                              key={action.key}
                              control={control}
                              name={`permissions.${action.key}` as any}
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value || false}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <span className="capitalize text-sm font-medium">
                                    {action.label}
                                  </span>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Menus Loop */}
                  {moduleConfig.menus?.map((menu: any) => (
                    <div key={menu.menu} className="rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-sm">
                      <div className="bg-muted/30 dark:bg-zinc-900/80 px-4 py-3 border-b border-slate-200/60 dark:border-zinc-800 flex items-center justify-between">
                        <span className="font-semibold text-sm">{menu.label}</span>
                        {menu.accessKey && (
                          <FormField
                            control={control}
                            name={`permissions.${menu.accessKey}` as any}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                                </FormControl>
                                <span className="text-xs font-medium">Menu Visibility</span>
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Menu direct actions */}
                        {menu.actions && menu.actions.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {menu.actions.map((action: any) => (
                              <FormField
                                key={action.key}
                                control={control}
                                name={`permissions.${action.key}` as any}
                                render={({ field }) => (
                                  <FormItem className="flex items-center gap-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value || false}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <span className="capitalize text-sm font-medium">
                                      {action.label}
                                    </span>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        )}

                        {/* SubMenus Loop */}
                        {menu.subMenus?.map((subMenu: any) => (
                          <div key={subMenu.subMenu} className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">{subMenu.label}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {subMenu.actions.map((action: any) => (
                                <FormField
                                  key={action.key}
                                  control={control}
                                  name={`permissions.${action.key}` as any}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value || false}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <span className="capitalize text-sm font-medium">
                                        {action.label}
                                      </span>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Form>
      </CardContent>
    </Card>
  );
}
