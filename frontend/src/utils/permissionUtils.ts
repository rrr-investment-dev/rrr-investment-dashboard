/**
 * Converts a flat array of permission strings (like ["admin.access", "admin.overview.read"])
 * into a nested object (like { admin: { access: true, overview: { read: true } } })
 * so it can be easily managed by React Hook Form using dot notation.
 */
export const parsePermissions = (permissions: string[] = []): Record<string, any> => {
  const result: Record<string, any> = {};

  permissions.forEach((key) => {
    if (!key) return;
    const parts = key.split(".");
    let current = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = true;
      } else {
        if (!current[part] || typeof current[part] !== "object") {
          current[part] = {};
        }
        current = current[part];
      }
    }
  });

  return result;
};

/**
 * Converts a potentially nested object (from React Hook Form state)
 * into a flat array of "dot.notation.keys" where the value is true.
 */
export const serializePermissions = (obj: any, prefix = ''): string[] => {
  let activeKeys: string[] = [];

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (typeof value === "object" && value !== null) {
      // Recursively flatten if it's an object
      activeKeys = [...activeKeys, ...serializePermissions(value, path)];
    } else if (value === true) {
      // Add key to array if value is true
      activeKeys.push(path);
    }
  }

  // Automatically ensure parent .access keys are present if any child action is selected
  if (prefix === '') {
    const finalKeys = new Set(activeKeys);

    activeKeys.forEach((key) => {
      const parts = key.split(".");
      // Only generate .access keys for parent levels:
      // i=1 -> Module level (e.g. "admin.access")
      // i=2 -> Menu level (e.g. "admin.userManagement.access")
      // We stop at parts.length - 2 to ensure we don't add .access to the SubMenu itself.
      for (let i = 1; i < parts.length - 1; i++) {
        if (i > 2) break; // Safety: we don't have categories deeper than level 2
        const parentPath = parts.slice(0, i).join(".");
        finalKeys.add(`${parentPath}.access`);
      }
    });
    return Array.from(finalKeys).sort();
  }

  return activeKeys;
};
