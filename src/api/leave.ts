import type {
  ApiResponse,
  LeaveCreditDto,
  EmployeeLeaveCredit,
  LeaveCredit,
  LeaveRequest,
  LeaveRequestDto,
  PaginatedApiResponse,
  PaginationFilters,
  RequestStatus,
} from "@/types";
import client from "./client";

export const getOwnLeaveCredits = async (): Promise<
  ApiResponse<LeaveCredit[]>
> => {
  const reponse = await client.get("/leave-credits/me");
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

export const getAllLeaveRequest = async (
  filters: PaginationFilters,
): Promise<PaginatedApiResponse<LeaveRequest[]>> => {
  const response = await client.get("/leave-requests", { params: filters });
  return response.data;
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

export const updateLeaveStatus = async (
  id: string,
  status: RequestStatus,
): Promise<ApiResponse<LeaveRequest>> => {
  const response = await client.patch(`/leave-requests/${id}/status`, null, {
    params: { status },
  });
  return response.data;
};

export const deleteLeaveRequest = async (
  id: string,
): Promise<ApiResponse<void>> => {
  const response = await client.delete(`/leave-requests/${id}`);
  return response.data;
};

export const getAllLeaveCredits = async (
  filters: PaginationFilters,
): Promise<PaginatedApiResponse<EmployeeLeaveCredit[]>> => {
  const response = await client.get("/leave-credits", { params: filters });
  return response.data;
};

export const createLeaveCredits = async (
  request: LeaveCreditDto,
): Promise<ApiResponse<LeaveCredit>> => {
  const response = await client.post("/leave-credits", request);
  return response.data;
};
