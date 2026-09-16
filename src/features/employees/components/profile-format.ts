import type { Employee } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  PROBATIONARY: "Probationary",
  REGULAR: "Regular",
  TERMINATED: "Terminated",
  RESIGNED: "Resigned",
};

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACTUAL: "Contractual",
  INTERN: "Intern",
};

const PAY_TYPE_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  DAILY: "Daily",
  HOURLY: "Hourly",
};

const PAY_FREQUENCY_LABELS: Record<string, string> = {
  SEMI_MONTHLY: "Semi-Monthly",
  MONTHLY: "Monthly",
  WEEKLY: "Weekly",
  BI_WEEKLY: "Bi-Weekly",
};

const LABELS: Record<string, string> = {
  ...STATUS_LABELS,
  ...TYPE_LABELS,
  ...PAY_TYPE_LABELS,
  ...PAY_FREQUENCY_LABELS,
};

export function formatEnum(value?: string | null): string {
  if (!value) return "—";
  if (LABELS[value]) return LABELS[value];
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatBenefitName(value?: string | null): string {
  if (!value) return "—";
  if (value === value.toUpperCase() && value.includes("_")) {
    return formatEnum(value);
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function fullName(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

export function initials(employee: Employee): string {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(value?: string | null): string {
  if (!value) return "—";
  const [hours, minutes] = value.split(":");
  const parsedHours = Number(hours);
  if (Number.isNaN(parsedHours)) return value;
  const period = parsedHours >= 12 ? "PM" : "AM";
  const displayHours = parsedHours % 12 === 0 ? 12 : parsedHours % 12;
  return `${displayHours}:${minutes ?? "00"} ${period}`;
}

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined) return "—";
  return currencyFormatter.format(value);
}
