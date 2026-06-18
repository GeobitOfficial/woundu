import type { UserRole } from "@/types";

export const SUPER_ADMIN_ROLE: UserRole = "super_admin";

export function isSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === SUPER_ADMIN_ROLE;
}

export const POST_LOGIN_DEFAULT_PATH = "/cuenta";
export const SUPER_ADMIN_POST_LOGIN_PATH = "/admin";

export function getPostLoginRedirectPath(
  role: UserRole | null | undefined,
  fallback = POST_LOGIN_DEFAULT_PATH,
): string {
  return isSuperAdmin(role) ? SUPER_ADMIN_POST_LOGIN_PATH : fallback;
}

export function getRoleLabel(role: UserRole | null | undefined): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Administrador";
    case "seller":
      return "Vendedor";
    case "buyer":
      return "Comprador";
    default:
      return "Usuario";
  }
}

export function canAccessSellerFeatures(
  role: UserRole | null | undefined,
): boolean {
  return role === "seller" || role === "admin" || role === "super_admin";
}

export function canAccessBuyerFeatures(
  role: UserRole | null | undefined,
): boolean {
  return role === "buyer";
}
