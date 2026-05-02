import type {
  ApiResponse,
  LeaveCredit,
  LeaveRequest,
  LeaveType,
  PaginatedApiResponse,
  PaginationFilters,
} from "../types";
import client from "./client";

export const getOwnLeaveCredits = async (): Promise<
  ApiResponse<LeaveCredit[]>
> => {
  const reponse = await client.get("/leave-credits");
  return reponse.data;
};

export const getOwnLeaveRequests = async (
  filters: PaginationFilters,
): Promise<PaginatedApiResponse<LeaveRequest[]>> => {
  const response = await client.get("/leave-requests/me", {
    params: filters,
  });
  return response.data;
};

export type LeaveRequestDto = {
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  note?: string;
};

export const createLeaveRequest = async (
  request: LeaveRequestDto,
): Promise<ApiResponse<LeaveRequest>> => {
  const response = await client.post("/leave-requests", request);
  return response.data;
};

export const updateLeaveRequest = async (
  id: string,
  request: LeaveRequestDto,
): Promise<ApiResponse<LeaveRequest>> => {
  const response = await client.put(`/leave-requests/${id}`, request);
  return response.data;
};

export const deleteLeaveRequest = async (
  id: string,
): Promise<ApiResponse<void>> => {
  const response = await client.delete(`/leave-requests/${id}`);
  return response.data;
};
