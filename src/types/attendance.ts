export type Attendance = {
  id: string;
  employeeId: number;
  date: string;
  timeIn: string;
  timeOut: string | null;
  totalHours: number | null;
  overtimeHours: number | null;
};
