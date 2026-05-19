export const can = (
  user: { permissions: string[] } | null,
  permission: string
): boolean => {
  return !!user?.permissions?.includes(permission);
};
