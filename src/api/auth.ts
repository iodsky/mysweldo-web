import axios from "axios";
import client from "./client";
import type {
  AccessType,
  ApiError,
  ApiResponse,
  AuthSession,
  AuthenticatedUser,
} from "../types";

type LoginCredentials = {
  email: string;
  password: string;
  accessType: AccessType;
};

export const login = async (
  credentials: LoginCredentials,
): Promise<ApiResponse<AuthSession>> => {
  try {
    const response = await client.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await client.post("/auth/logout");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export const me = async (): Promise<ApiResponse<AuthenticatedUser>> => {
  try {
    const response = await client.get("/auth/me");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};
