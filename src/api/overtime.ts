import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationFilters,
} from "../types";
import type { OvertimeRequest } from "../types/overtime";
import client from "./client";

export type OvertimeRequestDto = {
  date: string;
  reason?: string;
};

export const createOvertimeRequest = async (
  request: OvertimeRequestDto,
): Promise<ApiResponse<OvertimeRequest>> => {
  const response = await client.post("/overtime-requests", request);
  return response.data;
};

export const getOwnOvertimeRequests = async (
  pagination: PaginationFilters,
): Promise<PaginatedApiResponse<OvertimeRequest[]>> => {
  const response = await client.get("/overtime-requests/me", {
    params: pagination,
  });
  return response.data;
};

export const updateOvertimeRequest = async (
  id: string,
  request: OvertimeRequestDto,
): Promise<PaginatedApiResponse<OvertimeRequest>> => {
  const response = await client.put(`/overtime-requests/${id}`, request);
  return response.data;
};

export const deleteOvertimeRequest = async (id: string) => {
  const response = await client.delete(`/overtime-requests/${id}`);
  return response.data;
};
