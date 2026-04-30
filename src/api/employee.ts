import axios from "axios";
import client from "./client";
import type {
  ApiError,
  ApiResponse,
  Employee,
  EmployeeDto,
  EmploymentStatus,
  PaginatedApiResponse,
  PaginationFilters,
} from "../types";
import type { EmployeeBasic } from "../types/employee";

export const getAuthenticatedEmployee = async (): Promise<
  ApiResponse<Employee>
> => {
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

type GetAllEmployeesFilters = PaginationFilters & {
  department?: string;
  supervisor?: number;
  status?: EmploymentStatus;
};

export const getAllEmployees = async (
  filters: GetAllEmployeesFilters,
): Promise<PaginatedApiResponse<EmployeeBasic[]>> => {
  try {
    const response = await client.get("/employees", { params: filters });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export const getEmployeeById = async (
  id: number,
): Promise<ApiResponse<Employee>> => {
  try {
    const response = await client.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export const createEmployee = async (
  request: EmployeeDto,
): Promise<ApiResponse<Employee>> => {
  try {
    const response = await client.post("/employees", request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export const updateEmployee = async (
  id: number,
  request: EmployeeDto,
): Promise<ApiResponse<Employee>> => {
  try {
    const response = await client.put(`/employees/${id}`, request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export const deleteEmployee = async (
  id: number,
): Promise<ApiResponse<void>> => {
  try {
    const response = await client.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};
