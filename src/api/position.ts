import axios from "axios";
import type { ApiError, PaginatedApiResponse, Position } from "../types";
import client from "./client";

export const getAllPositions = async (): Promise<
  PaginatedApiResponse<Position[]>
> => {
  try {
    const response = await client.get("/positions");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      throw apiError;
    }
    throw error;
  }
};
