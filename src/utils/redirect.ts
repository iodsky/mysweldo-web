import type { AccessType, Role } from "@/types";

export const getRedirectPath = (accessType: AccessType, role: Role): string => {
  if (accessType === "ADMIN") {
    switch (role) {
      case "HR":
      case "SUPERUSER":
        return "/hr/dashboard";
      case "PAYROLL":
        return "/payroll/dashboard";
      case "IT":
        return "/it/dashboard";
      case "SUPERVISOR":
        return "/supervisor/team";
      default:
        return "/hr/dashboard";
    }
  }

  return "/employee/profile";
};
