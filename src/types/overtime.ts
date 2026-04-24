import type { RequestStatus } from "./common";

export type OvertimeRequest = {
  id: string;
  employeeId: number;
  date: string;
  overtimeHours: number;
  reason?: string;
  status: RequestStatus;
};
