import type { RequestStatus } from "@/types";

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: "yellow",
  APPROVED: "green",
  REJECTED: "red",
};