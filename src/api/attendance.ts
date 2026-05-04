import type {
  ApiResponse,
  Attendance,
  PaginatedApiResponse,
  PaginationFilters,
} from "../types";
import client from "./client";

export const clockIn = async (): Promise<ApiResponse<Attendance>> => {
  const response = await client.post("/attendances/clock-in");
  return response.data;
};

export const clockOut = async (): Promise<ApiResponse<Attendance>> => {
  const response = await client.patch("/attendances/clock-out");
  return response.data;
};

export type AttendanceFilters = PaginationFilters & {
  startDate?: string;
  endDate?: string;
};

export const getOwnAttendances = async (
  params: AttendanceFilters,
): Promise<PaginatedApiResponse<Attendance>> => {
  const response = await client.get("/attendances/me", { params });
  return response.data;
};

export const getAllAttendances = async (
  filters: AttendanceFilters,
): Promise<PaginatedApiResponse<Attendance>> => {
  const response = await client.get("/attendances", { params: filters });
  return response.data;
};

export const getEmployeeAttendances = async (
  id: number,
  filters: AttendanceFilters,
): Promise<PaginatedApiResponse<Attendance>> => {
  const response = await client.get(`/attendances/employee/${id}`, {
    params: filters,
  });
  return response.data;
};

export type AttendanceDto = Pick<
  Attendance,
  "employeeId" | "date" | "timeIn" | "timeOut"
>;

export const createAttendance = async (
  attendance: AttendanceDto,
): Promise<ApiResponse<Attendance>> => {
  const response = await client.post("/attendances", attendance);
  return response.data;
};

export const updateAttendance = async (
  id: string,
  attendance: AttendanceDto,
) => {
  const response = await client.patch(`/attendances/${id}`, attendance);
  return response.data;
};
