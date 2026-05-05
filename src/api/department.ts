import type { ApiResponse, DepartmentBasic } from "@/types";
import client from "./client";

export const getAllDepartments = async (): Promise<
  ApiResponse<DepartmentBasic[]>
> => {
  const response = await client.get("/departments/options");
  return response.data;
};
