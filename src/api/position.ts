import type { ApiResponse, PositionBasic } from "@/types";
import client from "./client";

export const getAllPositions = async (): Promise<
  ApiResponse<PositionBasic[]>
> => {
  const response = await client.get("/positions/options");
  return response.data;
};
