import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "@/pages/auth/login";
import EmployeeProfile from "@/pages/employee/profile";
import ProtectedRoute from "./protected-route";
import Layout from "@/components/layout";
import EmployeeAttendance from "@/pages/employee/attendance";
import EmployeeLeave from "@/pages/employee/leave";
import EmployeeOvertime from "@/pages/employee/overtime";
import EmployeePayslip from "@/pages/employee/payslip";
import HRDashboard from "@/pages/hr/dashboard";
import HREmployees from "@/pages/hr/employees";
import HREmployeeDetail from "@/pages/hr/employees/[id]";
import HRAttendance from "@/pages/hr/attendance";
import HRLeave from "@/pages/hr/leave";
import HROvertime from "@/pages/hr/overtime";
import HRPosition from "@/pages/hr/position";
import HRDepartment from "@/pages/hr/department";
import HRBenefit from "@/pages/hr/benefit";

export const AppRoutes = createBrowserRouter([
  { path: "/", element: <Navigate to="login" replace /> },
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/employee/profile", element: <EmployeeProfile /> },
          { path: "/employee/attendance", element: <EmployeeAttendance /> },
          { path: "/employee/leave", element: <EmployeeLeave /> },
          { path: "/employee/overtime", element: <EmployeeOvertime /> },
          { path: "/employee/payslip", element: <EmployeePayslip /> },

          { path: "/hr/dashboard", element: <HRDashboard /> },
          { path: "/hr/employees", element: <HREmployees /> },
          { path: "/hr/employees/:id", element: <HREmployeeDetail /> },
          { path: "/hr/attendance", element: <HRAttendance /> },
          { path: "/hr/leave", element: <HRLeave /> },
          { path: "/hr/overtime", element: <HROvertime /> },
          { path: "/hr/position", element: <HRPosition /> },
          { path: "/hr/department", element: <HRDepartment /> },
          { path: "/hr/benefit", element: <HRBenefit /> },
        ],
      },
    ],
  },
]);
