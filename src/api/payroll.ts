import axios from "axios";
import type {
  ApiError,
  PaginatedApiResponse,
  PaginationFilters,
  Payslip,
} from "../types";
import client from "./client";

export type PayslipsFilter = PaginationFilters & {
  period?: string; // YYYY-MM
};

export const getEmployeePayslips = async (
  filters: PayslipsFilter,
): Promise<PaginatedApiResponse<Payslip>> => {
  try {
    const response = await client.get("/payroll-items/me", { params: filters });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};
