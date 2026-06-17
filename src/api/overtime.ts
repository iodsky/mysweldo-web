import type {
  ApiResponse,
  OvertimeRequest,
  OvertimeRequestDto,
  PaginatedApiResponse,
  PaginationFilters,
  RequestStatus,
} from "@/types";
import client from "./client";

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
): Promise<ApiResponse<OvertimeRequest>> => {
  const response = await client.put(`/overtime-requests/${id}`, request);
  return response.data;
};

export const deleteOvertimeRequest = async (id: string) => {
  const response = await client.delete(`/overtime-requests/${id}`);
  return response.data;
};

export type OvertimeRequestsFilters = PaginationFilters & {
  startDate?: string;
  endDate?: string;
};

export const getAllOvertimeRequests = async (
  filers: OvertimeRequestsFilters,
): Promise<PaginatedApiResponse<OvertimeRequest[]>> => {
  const response = await client.get("/overtime-requests", { params: filers });
  return response.data;
};

export const updateOvertimeRequestStatus = async (
  id: string,
  status: RequestStatus,
): Promise<ApiResponse<OvertimeRequest>> => {
  const response = await client.patch(`/overtime-requests/${id}/status`, null, {
    params: { status },
  });
  return response.data;
};
