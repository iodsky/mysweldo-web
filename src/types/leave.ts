import type { RequestStatus } from "./common";

export type LeaveType =
  | "VACATION"
  | "SICK"
  | "MATERNITY"
  | "PATERNITY"
  | "SOLO_PARENT"
  | "BEREAVEMENT";

export type LeaveCredit = {
  id: string;
  employeeId: number;
  type: LeaveType;
  credits: number;
  effectiveDate: string;
};

export type LeaveRequest = {
  id: string;
  employeeId: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  note: string;
  status: RequestStatus;
};
