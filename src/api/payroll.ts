import type { PaginatedApiResponse, PaginationFilters, Payslip } from "@/types";
import client from "./client";

export type PayslipsFilter = PaginationFilters & {
  period?: string; // YYYY-MM
};

export const getEmployeePayslips = async (
  filters: PayslipsFilter,
): Promise<PaginatedApiResponse<Payslip>> => {
  const response = await client.get("/payroll-items/me", { params: filters });
  return response.data;
};
