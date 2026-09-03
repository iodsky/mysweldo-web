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
import Imports from "@/pages/imports";
import ITUsers from "@/pages/it/users";
import ITRoles from "@/pages/it/roles";
import PayrollRuns from "@/pages/payroll/runs";
import PayrollRunDetail from "@/pages/payroll/runs/[id]";
import PayrollContributions from "@/pages/payroll/contributions";
import PayrollDeductions from "@/pages/payroll/deductions";
import PayrollTaxBrackets from "@/pages/payroll/tax-brackets";
import PayrollSssRates from "@/pages/payroll/sss-rates";
import PayrollPhilhealthRates from "@/pages/payroll/philhealth-rates";
import PayrollPagibigRates from "@/pages/payroll/pagibig-rates";
import SupervisorTeam from "@/pages/supervisor/team";
import RoleRoute from "./role-route";
import NotFound from "@/pages/not-found";

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
          { path: "/imports", element: <Imports /> },

          {
            element: <RoleRoute allowedRoles={["PAYROLL"]} />,
            children: [
              { path: "/payroll/runs", element: <PayrollRuns /> },
              { path: "/payroll/runs/:id", element: <PayrollRunDetail /> },
              { path: "/payroll/contributions", element: <PayrollContributions /> },
              { path: "/payroll/deductions", element: <PayrollDeductions /> },
              { path: "/payroll/tax-brackets", element: <PayrollTaxBrackets /> },
              { path: "/payroll/sss-rates", element: <PayrollSssRates /> },
              { path: "/payroll/philhealth-rates", element: <PayrollPhilhealthRates /> },
              { path: "/payroll/pagibig-rates", element: <PayrollPagibigRates /> },
            ],
          },
          {
            element: <RoleRoute allowedRoles={["IT"]} />,
            children: [
              { path: "/it/users", element: <ITUsers /> },
              { path: "/it/roles", element: <ITRoles /> },
            ],
          },
          {
            element: <RoleRoute allowedRoles={["SUPERVISOR"]} />,
            children: [
              { path: "/supervisor/team", element: <SupervisorTeam /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
