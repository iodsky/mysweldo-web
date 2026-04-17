import axios from "axios";
import client from "./client";
import type { ApiError, ApiResponse, Employee } from "../types";

export const getEmployeeProfile = async (): Promise<ApiResponse<Employee>> => {
  try {
    const response = await client.get("/employees/me");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};
