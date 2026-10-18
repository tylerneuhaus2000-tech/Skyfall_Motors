export const staffRoles = ["salesperson", "mechanic", "race_director"] as const;

export type StaffRole = (typeof staffRoles)[number];

export const adminPermissions = [
  "overview",
  "inventory",
  "orders",
  "customers",
  "test_drives",
  "reviews",
  "waitlist",
  "workshop",
  "races",
  "marketing",
  "team",
  "audit",
  "settings",
  "inquiries",
] as const;

export type AdminPermission = (typeof adminPermissions)[number];

const rolePermissions: Record<StaffRole, readonly AdminPermission[]> = {
  salesperson: [
    "overview",
    "inventory",
    "orders",
    "customers",
    "test_drives",
    "reviews",
    "waitlist",
    "inquiries",
  ],
  mechanic: ["overview", "workshop"],
  race_director: ["overview", "races"],
};

export function isStaffRole(value: unknown): value is StaffRole {
  return staffRoles.includes(value as StaffRole);
}

export function hasAdminPermission(
  role: "customer" | "owner" | "staff",
  staffRole: StaffRole | null,
  permission: AdminPermission,
) {
  if (role === "owner") return true;
  if (role !== "staff" || !staffRole) return false;
  return rolePermissions[staffRole].includes(permission);
}

export function permissionsForAccount(
  role: "customer" | "owner" | "staff",
  staffRole: StaffRole | null,
) {
  return adminPermissions.filter((permission) =>
    hasAdminPermission(role, staffRole, permission),
  );
}
