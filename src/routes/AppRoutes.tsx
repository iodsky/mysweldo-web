import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/auth/login";
import Profile from "../pages/employee/profile";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/Layout";
import Attendance from "../pages/employee/attendance";
import Leave from "../pages/employee/leave";
import Overtime from "../pages/employee/overtime";
import Payslip from "../pages/employee/payslip";

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
        ],
      },
    ],
  },
]);
