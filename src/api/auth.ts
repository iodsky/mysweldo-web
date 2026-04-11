import client from "./client";
import type { ApiResponse, LoginResponse } from "./types";

export type Role = "EMPLOYEE" | "ADMIN";

type LoginCredentials = {
  email: string;
  password: string;
  role: Role;
};

export const login = async (
  credentials: LoginCredentials,
): Promise<ApiResponse<LoginResponse>> => {
  const response = await client.post("/auth/login", credentials);
  return response.data;
};
