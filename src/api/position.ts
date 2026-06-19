import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationFilters,
  Position,
  PositionBasic,
  PositionDto,
  PositionUpdateDto,
} from "@/types";
import client from "./client";

export const getAllPositions = async (): Promise<
  ApiResponse<PositionBasic[]>
> => {
  const response = await client.get("/positions/options");
  return response.data;
};

export const getPositions = async (
  filters: PaginationFilters,
): Promise<PaginatedApiResponse<Position[]>> => {
  const response = await client.get("/positions", { params: filters });
  return response.data;
};

export const createPosition = async (
  request: PositionDto,
): Promise<ApiResponse<Position>> => {
  const response = await client.post("/positions", request);
  return response.data;
};

export const updatePosition = async (
  id: string,
  request: PositionUpdateDto,
): Promise<ApiResponse<Position>> => {
  const response = await client.put(`/positions/${id}`, request);
  return response.data;
};

export const deletePosition = async (
  id: string,
): Promise<ApiResponse<void>> => {
  const response = await client.delete(`/positions/${id}`);
  return response.data;
};
