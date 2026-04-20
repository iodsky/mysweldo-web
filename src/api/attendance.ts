import axios from "axios";
import type {
  ApiError,
  ApiResponse,
  Attendance,
  PaginatedApiResponse,
} from "../types";
import client from "./client";

export const clockIn = async (): Promise<ApiResponse<Attendance>> => {
  try {
    const response = await client.post("/attendances/clock-in");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export const clockOut = async (): Promise<ApiResponse<Attendance>> => {
  try {
    const response = await client.patch("/attendances/clock-out");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};

export type AttendanceFilters = {
  pageNo: number;
  limit: number;
  startDate?: string;
  endDate?: string;
};

export const getEmployeeAttendances = async (
  params: AttendanceFilters,
): Promise<PaginatedApiResponse<Attendance>> => {
  try {
    const response = await client.get("/attendances/me", { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};
