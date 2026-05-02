import type { ApiResponse, Position } from "../types";
import client from "./client";

export const getAllPositions = async (): Promise<ApiResponse<Position[]>> => {
  const response = await client.get("/positions/options");
  return response.data;
};
