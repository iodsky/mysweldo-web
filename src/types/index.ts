import type {
  AttendanceDto as AttendanceRecord,
  AttendanceRequest,
  AuthRequest,
  BenefitDto,
  BenefitRequest as BenefitRequestDto,
  ContributionDto as ContributionRecord,
  ContributionRequest as ContributionRequestDto,
  CreditSummary as CreditSummaryDto,
  DeductionDto as DeductionRecord,
  DeductionRequest as DeductionRequestDto,
  DepartmentBasicDto,
  DepartmentDto as DepartmentRecord,
  DepartmentRequest,
  DepartmentUpdateRequest,
  EmployeeBasicDto,
  EmployeeBenefitDto,
  EmployeeDto as EmployeeRecord,
  EmployeeLeaveCreditDto,
  EmployeeRequest,
  ImportJobSummaryDto,
  LeaveCreditDto as LeaveCreditRecord,
  LeaveCreditRequest,
  LeaveRequestDto as LeaveRequestRecord,
  OvertimeRequestDto as OvertimeRequestRecord,
  PagibigRateDto as PagibigRateRecord,
  PagibigRateRequest as PagibigRateRequestDto,
  PayrollItemDto,
  PayrollRunDto as PayrollRunRecord,
  PayrollRunDtoStatus,
  PayrollRunDtoType,
  PayrollRunRequest as PayrollRunRequestDto,
  PhilhealthRateDto as PhilhealthRateRecord,
  PhilhealthRateRequest as PhilhealthRateRequestDto,
  PositionBasicDto,
  PositionDto as PositionRecord,
  PositionRequest,
  PositionUpdateRequest,
  RoleDto as UserRoleRecord,
  RoleRequest as RoleRequestDto,
  SalaryDto,
  SalaryBracketDto as SalaryBracketRecord,
  SalaryBracketRequest as SalaryBracketRequestDto,
  SssRateDto as SssRateRecord,
  SssRateRequest as SssRateRequestDto,
  TaxBracketDto as TaxBracketRecord,
  TaxBracketRequest as TaxBracketRequestDto,
  UserDto,
  UserRequest as UserRequestDto,
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
export type UserRequest = UserRequestDto;
export type ImportJobSummary = ImportJobSummaryDto;
export type ImportType = "EMPLOYEE" | "USER";
export type ImportStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";
export type LoginCredentials = AuthRequest;
export type CreditSummary = CreditSummaryDto;

export type PayrollRun = PayrollRunRecord;
export type PayrollRunRequest = PayrollRunRequestDto;
export type PayrollRunType = PayrollRunDtoType;
export type PayrollRunStatus = PayrollRunDtoStatus;
export type Contribution = ContributionRecord;
export type ContributionRequest = ContributionRequestDto;
export type Deduction = DeductionRecord;
export type DeductionRequest = DeductionRequestDto;
export type TaxBracket = TaxBracketRecord;
export type TaxBracketRequest = TaxBracketRequestDto;
export type SssRate = SssRateRecord;
export type SssRateRequest = SssRateRequestDto;
export type PhilhealthRate = PhilhealthRateRecord;
export type PhilhealthRateRequest = PhilhealthRateRequestDto;
export type PagibigRate = PagibigRateRecord;
export type PagibigRateRequest = PagibigRateRequestDto;
export type SalaryBracket = SalaryBracketRecord;
export type SalaryBracketRequest = SalaryBracketRequestDto;
export type UserRole = UserRoleRecord;
export type RoleRequest = RoleRequestDto;

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