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
