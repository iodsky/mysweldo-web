export type EmployeeBenefit = {
  benefit: string;
  amount: number;
};

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
  status: string;
  type: string;
  startShift: string; // LocalTime as HH:MM:SS
  endShift: string; // LocalTime as HH:MM:SS
  basicSalary: string; // BigDecimal as string
  benefits: EmployeeBenefit[];
};
