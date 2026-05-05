import type { ApiResponse, Department } from "@/types";
import client from "./client";

export const getAllDepartments = async (): Promise<
  ApiResponse<Department[]>
> => {
  const response = await client.get("/departments/options");
  return response.data;
};
