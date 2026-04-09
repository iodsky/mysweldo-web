import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/auth/login";

export const AppRoutes = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
]);
