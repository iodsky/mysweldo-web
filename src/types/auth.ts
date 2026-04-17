export type Role =
  | "HR"
  | "EMPLOYEE"
  | "PAYROLL"
  | "IT"
  | "SUPERUSER"
  | "SUPERVISOR";

export type User = {
  id: string;
  email: string;
  employeeId: string;
  role: Role;
  createdAt: string;
  updatedAt?: string;
};

export type AccessType = "EMPLOYEE" | "ADMIN";

export type AuthSession = {
  user: User;
  accessType: AccessType;
  token: string;
};

export type AccessToken = {
  token: string;
};

export type AuthenticatedUser = {
  user: User;
  accessType: AccessType;
};
