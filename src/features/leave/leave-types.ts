import type { LeaveType } from "@/types";

export const LEAVE_TYPES: LeaveType[] = [
  "VACATION",
  "SICK",
  "MATERNITY",
  "PATERNITY",
  "SOLO_PARENT",
  "BEREAVEMENT",
];

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  VACATION: "Vacation",
  SICK: "Sick",
  MATERNITY: "Maternity",
  PATERNITY: "Paternity",
  SOLO_PARENT: "Solo Parent",
  BEREAVEMENT: "Bereavement",
};

export const LEAVE_TYPE_OPTIONS: { value: LeaveType; label: string }[] =
  LEAVE_TYPES.map((type) => ({ value: type, label: LEAVE_TYPE_LABELS[type] }));