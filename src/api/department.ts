import axios from "axios";
import type { ApiError, Department, PaginatedApiResponse } from "../types";
import client from "./client";

export const getAllDepartments = async (): Promise<
  PaginatedApiResponse<Department[]>
> => {
  try {
    const response = await client.get("/departments");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};
