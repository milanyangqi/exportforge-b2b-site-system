import type { Permission, RoleKey } from "@/types/site";

const allPermissions: Permission[] = [
  "products:view",
  "products:create",
  "products:edit",
  "products:delete",
  "products:publish",
  "articles:view",
  "articles:create",
  "articles:edit",
  "articles:delete",
  "articles:publish",
  "leads:view",
  "leads:assign",
  "leads:status",
  "leads:export",
  "users:manage",
  "themes:manage",
  "settings:manage",
  "ai:configure",
  "ai:generate"
];

export const roles: Record<RoleKey, { label: string; permissions: Permission[] }> = {
  "super-admin": { label: "Super Admin", permissions: allPermissions },
  admin: {
    label: "Admin",
    permissions: allPermissions.filter((permission) => !["users:manage", "ai:configure"].includes(permission))
  },
  editor: {
    label: "Editor",
    permissions: ["products:view", "products:create", "products:edit", "articles:view", "articles:create", "articles:edit", "ai:generate"]
  },
  sales: {
    label: "Sales",
    permissions: ["leads:view", "leads:assign", "leads:status", "leads:export", "products:view"]
  },
  viewer: {
    label: "Viewer",
    permissions: ["products:view", "articles:view", "leads:view"]
  }
};

export function can(role: RoleKey, permission: Permission) {
  return roles[role].permissions.includes(permission);
}
