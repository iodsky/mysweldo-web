import axios from "axios";
import type {
  ApiError,
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
  try {
    const response = await client.post("/overtime-requests", request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export const getOwnOvertimeRequests = async (
  pagination: PaginationFilters,
): Promise<PaginatedApiResponse<OvertimeRequest[]>> => {
  try {
    const response = await client.get("/overtime-requests/me", {
      params: pagination,
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

export const updateOvertimeRequest = async (
  id: string,
  request: OvertimeRequestDto,
): Promise<PaginatedApiResponse<OvertimeRequest>> => {
  try {
    const response = await client.put(`/overtime-requests/${id}`, request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export const deleteOvertimeRequest = async (id: string) => {
  try {
    const response = await client.delete(`/overtime-requests/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};
