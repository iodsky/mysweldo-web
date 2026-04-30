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

export type Position = {
  id: string;
  title: string;
};

export type Department = {
  id: string;
  title: string;
};

export type Supervisor = {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
};

export type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  birthday: string; // LocalDate as ISO string
  address: string;
  phoneNumber: string;
  sssNumber: string;
  tinNumber: string;
  philhealthNumber: string;
  pagIbigNumber: string;
  supervisor: EmployeeBasic | null;
  position: Position;
  department: Department;
  status: EmploymentStatus;
  type: EmploymentType;
  startShift: string; // LocalTime as HH:MM:SS
  endShift: string; // LocalTime as HH:MM:SS
  salary: Salary; // BigDecimal as string
  benefits: EmployeeBenefit[];
};

export type EmployeeBasic = Pick<
  Employee,
  | "id"
  | "firstName"
  | "lastName"
  | "department"
  | "position"
  | "status"
  | "type"
>;

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
  payType: PayType;
  payFrequency: PayrollFrequency;
};
