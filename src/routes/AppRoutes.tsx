import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/auth/login";
import Profile from "../pages/employee/profile";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/Layout";
import Attendance from "../pages/employee/attendance";
import Leave from "../pages/employee/leave";
import Overtime from "../pages/employee/overtime";
import Payslip from "../pages/employee/payslip";
import HRDashboard from "../pages/hr/dashboard";
import HREmployees from "../pages/hr/employees";
import HREmployeeDetail from "../pages/hr/employees/[id]";
import HRAttendance from "../pages/hr/attendance";
import HRLeave from "../pages/hr/leave";
import HROvertime from "../pages/hr/overtime";
import HRPosition from "../pages/hr/position";
import HRDepartment from "../pages/hr/department";

export const AppRoutes = createBrowserRouter([
  { path: "/", element: <Navigate to="login" replace /> },
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/employee/profile", element: <Profile /> },
          { path: "/employee/attendance", element: <Attendance /> },
          { path: "/employee/leave", element: <Leave /> },
          { path: "/employee/overtime", element: <Overtime /> },
          { path: "/employee/payslip", element: <Payslip /> },

          { path: "/hr/dashboard", element: <HRDashboard /> },
          { path: "/hr/employees", element: <HREmployees /> },
          { path: "/hr/employees/:id", element: <HREmployeeDetail /> },
          { path: "/hr/attendance", element: <HRAttendance /> },
          { path: "/hr/leave", element: <HRLeave /> },
          { path: "/hr/overtime", element: <HROvertime /> },
          { path: "/hr/position", element: <HRPosition /> },
          { path: "/hr/department", element: <HRDepartment /> },
        ],
      },
    ],
  },
]);
