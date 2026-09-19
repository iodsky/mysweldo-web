import type {
  EmployeeBenefitRequest,
  EmploymentStatus,
  EmploymentType,
  PayType,
  PayrollFrequency,
} from "@/types";

export interface FormValues {
  firstName: string;
  lastName: string;
  birthday: string;
  address: string;
  phoneNumber: string;
  sssNumber: string;
  tinNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;
  supervisorId: string;
  positionId: string;
  departmentId: string;
  status: EmploymentStatus;
  type: EmploymentType;
  startShift: string;
  endShift: string;
  salaryRate: number;
  salaryType: PayType;
  payrollFrequency: PayrollFrequency;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  benefits: EmployeeBenefitRequest[];
}