import * as LucideIcons from "lucide-react";

// Helper to format camelCase strings into Title Case (e.g., "userManagement" -> "User Management")
// Helper to format strings into Title Case (e.g., "userManagement" or "website management" -> "User Management")
export const formatTitle = (text: string | null) => {
  if (!text) return "";
  return text
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .split(/[\s_]+/)           // Split by space or underscore
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
};

export interface PermissionNode {
  _id: string;
  key: string;
  module: string;
  menu: string | null;
  subMenu: string | null;
  action: string;
  order: number;
  path: string | null;
  icon?: string;
  isActive?: boolean;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: any;
  permission?: string;
  items?: NavItem[];
}

export const buildDynamicSidebar = (
  permissions: PermissionNode[],
  userPermissions?: string[]
): NavItem[] => {
  if (!Array.isArray(permissions)) {
    console.error("buildDynamicSidebar: permissions is not an array", permissions);
    return [];
  }

  const sidebar: NavItem[] = [];

  // Helper to check if a permission is allowed
  const isAllowed = (permissionKey?: string) => {
    if (!userPermissions) return true;
    if (!permissionKey) return true;
    return Array.isArray(userPermissions) && userPermissions.includes(permissionKey);
  };

  // 1. Sort all permissions by the 'order' field first
  const sortedPerms = [...permissions].sort((a, b) => (a.order || 0) - (b.order || 0));

  // 2. Identify all root modules (where both menu and subMenu are null, and path exists)
  // We only care about 'access' or 'read' actions for navigation
  const modules = sortedPerms.filter(
    (p) =>
      p.path !== null &&
      p.menu === null &&
      p.subMenu === null &&
      (p.action === "access" || p.action === "read")
  );

  modules.forEach((modPerm) => {
    // Skip if user doesn't have permission
    if (!isAllowed(modPerm.key)) return;

    // Safely map string icon name to actual Lucide component
    const IconComponent =
      modPerm.icon && (LucideIcons as any)[modPerm.icon]
        ? (LucideIcons as any)[modPerm.icon]
        : LucideIcons.Circle; // Fallback icon

    const moduleNode: NavItem = {
      title: formatTitle(modPerm.module),
      url: modPerm.path as string,
      icon: IconComponent,
      permission: modPerm.key,
      items: [],
    };

    // 3. Find Level 2 items under this module:
    // This includes Direct SubMenus (menu = null, subMenu = something) 
    // AND Menus (menu = something, subMenu = null)
    const directSubMenus = sortedPerms.filter(
      (p) =>
        p.path !== null &&
        p.module === modPerm.module &&
        p.menu === null &&
        p.subMenu !== null &&
        (p.action === "access" || p.action === "read")
    );
    const menus = sortedPerms.filter(
      (p) =>
        p.path !== null &&
        p.module === modPerm.module &&
        p.menu !== null &&
        p.subMenu === null &&
        (p.action === "access" || p.action === "read")
    );

    // Combine them and sort by order
    const level2Perms = [...directSubMenus, ...menus].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    level2Perms.forEach((l2Perm) => {
      // Skip if user doesn't have permission
      if (!isAllowed(l2Perm.key)) return;

      const isDirectSubMenu = l2Perm.menu === null;
      const titleStr = isDirectSubMenu ? l2Perm.subMenu : l2Perm.menu;

      const l2Node: NavItem = {
        title: formatTitle(titleStr),
        url: l2Perm.path as string,
        permission: l2Perm.key,
      };

      if (!isDirectSubMenu) {
        // If it's a Menu category, find its Level 3 SubMenus
        const subMenus = sortedPerms
          .filter(
            (p) =>
              p.path !== null &&
              p.module === modPerm.module &&
              p.menu === l2Perm.menu &&
              p.subMenu !== null &&
              (p.action === "access" || p.action === "read")
          )
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const filteredSubMenus = subMenus.filter(subPerm => isAllowed(subPerm.key));

        if (filteredSubMenus.length > 0) {
          l2Node.items = filteredSubMenus.map((subPerm) => ({
            title: formatTitle(subPerm.subMenu),
            url: subPerm.path as string,
            permission: subPerm.key,
          }));
        }
      }

      moduleNode.items!.push(l2Node);
    });

    // Clean up empty items arrays if it has no children
    if (moduleNode.items?.length === 0) {
      delete moduleNode.items;
    }

    sidebar.push(moduleNode);
  });

  return sidebar;
};

