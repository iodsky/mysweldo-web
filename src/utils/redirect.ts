import type { AccessType, Role } from "@/types";

export const getRedirectPath = (accessType: AccessType, role: Role): string => {
  if (accessType === "ADMIN") {
    switch (role) {
      case "HR":
        return "/hr/dashboard";
      case "SUPERUSER":
        return "/superuser/dashboard";
      case "PAYROLL":
        return "/payroll/dashboard";
      case "IT":
        return "/it/dashboard";
      case "SUPERVISOR":
        return "/supervisor/dashboard";
      default:
        return "/hr/dashboard";
    }
  }

  return "/employee/dashboard";
};
