import type {
  EmploymentStatus,
  EmploymentType,
  PayType,
  PayrollFrequency,
} from "@/types";

export const EMPLOYMENT_STATUS_MAP: Record<EmploymentStatus, string> = {
  PROBATIONARY: "Probationary",
  REGULAR: "Regular",
  TERMINATED: "Terminated",
  RESIGNED: "Resigned",
};

export const EMPLOYMENT_TYPE_MAP: Record<EmploymentType, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACTUAL: "Contractual",
  INTERN: "Intern",
};

export const PAY_TYPE_MAP: Record<PayType, string> = {
  MONTHLY: "Monthly",
  DAILY: "Daily",
  HOURLY: "Hourly",
};

export const PAYROLL_FREQUENCY_MAP: Record<PayrollFrequency, string> = {
  SEMI_MONTHLY: "Semi-Monthly",
  MONTHLY: "Monthly",
  WEEKLY: "Weekly",
  BI_WEEKLY: "Bi-Weekly",
};

export const employmentStatusOptions = (
  Object.keys(EMPLOYMENT_STATUS_MAP) as EmploymentStatus[]
).map((key) => ({
  value: key,
  label: EMPLOYMENT_STATUS_MAP[key],
}));

export const employmentTypeOptions = (
  Object.keys(EMPLOYMENT_TYPE_MAP) as EmploymentType[]
).map((key) => ({
  value: key,
  label: EMPLOYMENT_TYPE_MAP[key],
}));

export const payTypeOptions = (Object.keys(PAY_TYPE_MAP) as PayType[]).map(
  (key) => ({
    value: key,
    label: PAY_TYPE_MAP[key],
  }),
);

export const payrollFrequencyOptions = (
  Object.keys(PAYROLL_FREQUENCY_MAP) as PayrollFrequency[]
).map((key) => ({
  value: key,
  label: PAYROLL_FREQUENCY_MAP[key],
}));