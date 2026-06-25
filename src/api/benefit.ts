import type {
  ApiResponse,
  Benefit,
  BenefitRequest,
  PaginatedApiResponse,
  PaginationFilters,
} from "@/types";
import client from "./client";

export const getBenefits = async (
  filters: PaginationFilters,
): Promise<PaginatedApiResponse<Benefit[]>> => {
  const response = await client.get("/benefits", { params: filters });
  return response.data;
};

export const createBenefit = async (
  request: BenefitRequest,
): Promise<ApiResponse<Benefit>> => {
  const response = await client.post("/benefits", request);
  return response.data;
};

export const updateBenefit = async (
  code: string,
  request: BenefitRequest,
): Promise<ApiResponse<Benefit>> => {
  const response = await client.put(`/benefits/${code}`, request);
  return response.data;
};

export const deleteBenefit = async (
  code: string,
): Promise<ApiResponse<void>> => {
  const response = await client.delete(`/benefits/${code}`);
  return response.data;
};
