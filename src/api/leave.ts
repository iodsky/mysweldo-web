import axios from "axios";
import type {
  ApiError,
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
  try {
    const reponse = await client.get("/leave-credits");
    return reponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export const getOwnLeaveRequests = async (
  filters: PaginationFilters,
): Promise<PaginatedApiResponse<LeaveRequest[]>> => {
  try {
    const response = await client.get("/leave-requests/me", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export type CreateLeaveRequest = {
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  note?: string;
};

export const createLeaveRequest = async (
  request: CreateLeaveRequest,
): Promise<ApiResponse<LeaveRequest>> => {
  try {
    const response = await client.post("/leave-requests", request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};
