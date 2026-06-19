export type ApiResponse<T> = {
  success: boolean;
  message: string;
  timestamp: string;
  data: T;
};

export type PaginationMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type PaginatedApiResponse<T> = ApiResponse<T> & {
  meta: PaginationMeta;
};

type ValidationError = {
  field: string;
  message: string;
};

type DuplicateField = {
  field: string;
  value: string;
};

export type ApiError = {
  timestamp: string;
  status: number;
  message: string;
  validationErrors?: ValidationError[];
  duplicateField?: DuplicateField;
};

export type PaginationFilters = {
  pageNo: number;
  limit: number;
};

export type Attendance = {
  id: string;
  employeeId: number;
  employeeFirstName?: string;
  employeeLastName?: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  totalHours: number | null;
  overtimeHours: number | null;
};

export type AttendanceDto = Pick<
  Attendance,
  "employeeId" | "date" | "timeIn" | "timeOut"
>;

export type Role =
  | "HR"
  | "EMPLOYEE"
  | "PAYROLL"
  | "IT"
  | "SUPERUSER"
  | "SUPERVISOR";

export type User = {
  id: string;
  email: string;
  employeeId: number;
  role: Role;
  createdAt: string;
  updatedAt?: string;
};

export type AccessType = "EMPLOYEE" | "ADMIN";

export type AuthSession = {
  user: User;
  accessType: AccessType;
  token: string;
};

export type AccessToken = {
  token: string;
};

export type AuthenticatedUser = {
  user: User;
  accessType: AccessType;
};

export type LoginCredentials = {
  email: string;
  password: string;
  accessType: AccessType;
};

export type RequestStatus = "APPROVED" | "REJECTED" | "PENDING";

export type Department = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentDto = Pick<Department, "id" | "title">;

export type DepartmentUpdateDto = Pick<Department, "title">;

export type Position = {
  id: string;
  departmentId: string;
  departmentTitle: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type PositionDto = Pick<Position, "id" | "departmentId" | "title">;

export type PositionUpdateDto = Pick<Position, "departmentId" | "title">;

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

export type PositionBasic = Pick<Position, "id" | "title">;

export type DepartmentBasic = Pick<Department, "id" | "title">;

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
  position: PositionBasic;
  department: DepartmentBasic;
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

export type LeaveCreditDto = {
  employeeId: number;
  effectiveDate: string;
};

export type CreditSummary = {
  type: string;
  credits: number;
};

export type EmployeeLeaveCredit = Pick<
  EmployeeBasic,
  "id" | "firstName" | "lastName"
> & {
  credits: CreditSummary[];
};

export type LeaveRequest = {
  id: string;
  employeeId: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  note?: string;
  status: RequestStatus;
};

export type LeaveRequestDto = Omit<
  LeaveRequest,
  "id" | "employeeId" | "status"
> & {
  employeeId?: number;
};

export type OvertimeRequest = {
  id: string;
  employeeId: number;
  date: string;
  overtimeHours: number;
  reason?: string;
  status: RequestStatus;
};

export type OvertimeRequestDto = Pick<OvertimeRequest, "date" | "reason"> & {
  employeeId?: string;
};

export type Payslip = {
  id: string;
  employeeId: number;
  employeeName: string;
  designation: string;

  periodStartDate: string;
  periodEndDate: string;

  daysWorked: number;
  absences: number;
  tardinessMinutes: number;
  undertimeMinutes: number;
  overtimeMinutes: number;
  overtimePay: number;

  monthlyRate: number;
  semiMonthlyRate: number;
  dailyRate: number;
  hourlyRate: number;

  totalBenefits: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;

  benefits: PayslipBenefit[];
  deductions: PayslipDeduction[];
};

type PayslipBenefit = {
  benefit: string;
  amount: number;
};

type PayslipDeduction = {
  deduction: string;
  amount: number;
};
