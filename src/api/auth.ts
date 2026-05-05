import client from "./client";
import type {
  AccessType,
  ApiResponse,
  AuthSession,
  AuthenticatedUser,
} from "@/types";

export type LoginCredentials = {
  email: string;
  password: string;
  accessType: AccessType;
};

export const login = async (
  credentials: LoginCredentials,
): Promise<ApiResponse<AuthSession>> => {
  const response = await client.post("/auth/login", credentials);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await client.post("/auth/logout");
};

export const me = async (): Promise<ApiResponse<AuthenticatedUser>> => {
  const response = await client.get("/auth/me");
  return response.data;
};
