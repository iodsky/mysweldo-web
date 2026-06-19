import type {
  ApiResponse,
  Department,
  DepartmentBasic,
  DepartmentDto,
  DepartmentUpdateDto,
  PaginatedApiResponse,
  PaginationFilters,
} from "@/types";
import client from "./client";

export const getAllDepartments = async (): Promise<
  ApiResponse<DepartmentBasic[]>
> => {
  const response = await client.get("/departments/options");
  return response.data;
};

export const getDepartments = async (
  filters: PaginationFilters,
): Promise<PaginatedApiResponse<Department[]>> => {
  const response = await client.get("/departments", { params: filters });
  return response.data;
};

export const createDepartment = async (
  request: DepartmentDto,
): Promise<ApiResponse<Department>> => {
  const response = await client.post("/departments", request);
  return response.data;
};

export const updateDepartment = async (
  id: string,
  request: DepartmentUpdateDto,
): Promise<ApiResponse<Department>> => {
  const response = await client.put(`/departments/${id}`, request);
  return response.data;
};

export const deleteDepartment = async (
  id: string,
): Promise<ApiResponse<void>> => {
  const response = await client.delete(`/departments/${id}`);
  return response.data;
};
