import type {
  AttendanceDto as AttendanceRecord,
  AttendanceRequest,
  AuthRequest,
  BenefitDto,
  BenefitRequest as BenefitRequestDto,
  CreditSummary as CreditSummaryDto,
  DepartmentBasicDto,
  DepartmentDto as DepartmentRecord,
  DepartmentRequest,
  DepartmentUpdateRequest,
  EmployeeBasicDto,
  EmployeeBenefitDto,
  EmployeeDto as EmployeeRecord,
  EmployeeLeaveCreditDto,
  EmployeeRequest,
  LeaveCreditDto as LeaveCreditRecord,
  LeaveCreditRequest,
  LeaveRequestDto as LeaveRequestRecord,
  OvertimeRequestDto as OvertimeRequestRecord,
  PayrollItemDto,
  PositionBasicDto,
  PositionDto as PositionRecord,
  PositionRequest,
  PositionUpdateRequest,
  SalaryDto,
  UserDto,
} from "@/api/generated/model";

export type { AuthSession, AuthenticatedUser, PaginationMeta } from "@/api/generated/model";

export type Attendance = AttendanceRecord;
export type AttendanceDto = AttendanceRequest;
export type Benefit = BenefitDto;
export type BenefitRequest = BenefitRequestDto;
export type Department = DepartmentRecord;
export type DepartmentBasic = DepartmentBasicDto;
export type DepartmentDto = DepartmentRequest;
export type DepartmentUpdateDto = DepartmentUpdateRequest;
export type Position = PositionRecord;
export type PositionBasic = PositionBasicDto;
export type PositionDto = PositionRequest;
export type PositionUpdateDto = PositionUpdateRequest;
export type Employee = EmployeeRecord;
export type EmployeeBasic = EmployeeBasicDto;
export type EmployeeDto = EmployeeRequest;
export type EmployeeBenefit = EmployeeBenefitDto;
export type LeaveRequest = LeaveRequestRecord;
export type LeaveRequestDto = LeaveRequestRecord;
export type LeaveCredit = LeaveCreditRecord;
export type LeaveCreditDto = LeaveCreditRequest;
export type EmployeeLeaveCredit = EmployeeLeaveCreditDto;
export type OvertimeRequest = OvertimeRequestRecord;
export type OvertimeRequestDto = OvertimeRequestRecord;
export type Payslip = PayrollItemDto;
export type Salary = SalaryDto;
export type User = UserDto;
export type LoginCredentials = AuthRequest;
export type CreditSummary = CreditSummaryDto;

export type AccessType = "EMPLOYEE" | "ADMIN";
export type Role =
  | "HR"
  | "EMPLOYEE"
  | "PAYROLL"
  | "IT"
  | "SUPERUSER"
  | "SUPERVISOR";
export type RequestStatus = "APPROVED" | "REJECTED" | "PENDING";
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
export type LeaveType =
  | "VACATION"
  | "SICK"
  | "MATERNITY"
  | "PATERNITY"
  | "SOLO_PARENT"
  | "BEREAVEMENT";
export type PayType = "MONTHLY" | "DAILY" | "HOURLY";
export type PayrollFrequency =
  | "SEMI_MONTHLY"
  | "MONTHLY"
  | "WEEKLY"
  | "BI_WEEKLY";

export type PaginationFilters = {
  pageNo: number;
  limit: number;
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

export type Supervisor = {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
};