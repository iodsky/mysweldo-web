export type EmployeeBenefit = {
  benefit: string;
  amount: number;
};

export type EmploymentStatus =
  | "PROBATIONARY"
  | "REGULAR"
  | "TERMINATED"
  | "RESIGNED";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACTUAL"
  | "INTERN";

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  birthday: string; // LocalDate as ISO string
  address: string;
  phoneNumber: string;
  sssNumber: string;
  tinNumber: string;
  philhealthNumber: string;
  pagIbigNumber: string;
  supervisor: string;
  position: string;
  department: string;
  status: EmploymentStatus;
  type: EmploymentType;
  startShift: string; // LocalTime as HH:MM:SS
  endShift: string; // LocalTime as HH:MM:SS
  basicSalary: number; // BigDecimal as string
  benefits: EmployeeBenefit[];
};

export type EmployeeDto = {
  firstName: string;
  lastName: string;
  birthday: string;
  address: string;
  phoneNumber: string;
  governmentId: {
    sssNumber: string;
    tinNumber: string;
    philhealthNumber: string;
    pagIbigNumber: string;
  };
  supervisorId?: number;
  positionId?: string;
  departmentId?: string;
  status: EmploymentStatus;
  type: EmploymentType;
  startShift: string;
  endShift: string;
  benefits: EmployeeBenefit[];
  salaryRequest: Salary;
};

export type PayType = "MONTHLY" | "DAILY" | "HOURLY";

export type PayrollFrequency =
  | "SEMI_MONTHLY"
  | "MONTHLY"
  | "WEEKLY"
  | "BI_WEEKLY";

export type Salary = {
  rate: number;
  type: PayType;
  payrollFrequency: PayrollFrequency;
};
