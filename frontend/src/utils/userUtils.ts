export const getInitials = (name?: string) => {
  if (!name) return "U";
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || "U";
};
