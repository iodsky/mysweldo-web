import client from "./client";
import type {
  ApiResponse,
  Employee,
  EmployeeDto,
  EmploymentStatus,
  PaginatedApiResponse,
  PaginationFilters,
} from "../types";
import type { EmployeeBasic } from "@/types";

export const getAuthenticatedEmployee = async (): Promise<
  ApiResponse<Employee>
> => {
  const response = await client.get("/employees/me");
  return response.data;
};

type GetAllEmployeesFilters = PaginationFilters & {
  department?: string;
  supervisor?: number;
  status?: EmploymentStatus;
};

export const getAllEmployees = async (
  filters: GetAllEmployeesFilters,
): Promise<PaginatedApiResponse<EmployeeBasic[]>> => {
  const response = await client.get("/employees", { params: filters });
  return response.data;
};

export const getEmployeeById = async (
  id: number,
): Promise<ApiResponse<Employee>> => {
  const response = await client.get(`/employees/${id}`);
  return response.data;
};

export const createEmployee = async (
  request: EmployeeDto,
): Promise<ApiResponse<Employee>> => {
  const response = await client.post("/employees", request);
  return response.data;
};

export const updateEmployee = async (
  id: number,
  request: EmployeeDto,
): Promise<ApiResponse<Employee>> => {
  const response = await client.put(`/employees/${id}`, request);
  return response.data;
};

export const updateEmployeeStatus = async (
  id: number,
  status: EmploymentStatus,
): Promise<ApiResponse<void>> => {
  const response = await client.patch(`/employees/${id}/status`, null, {
    params: { status },
  });
  return response.data;
};
