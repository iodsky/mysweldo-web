import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/auth/login";
import EmployeeProfile from "../pages/employee/profile";
import ProtectedRoute from "./ProtectedRoute";

export const AppRoutes = createBrowserRouter([
  { path: "/", element: <Navigate to="login" replace /> },
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/employee/profile", element: <EmployeeProfile /> }],
  },
]);
