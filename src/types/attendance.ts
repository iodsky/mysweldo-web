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
