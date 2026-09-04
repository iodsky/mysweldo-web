import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "@/features/auth/login";
import EmployeeProfile from "@/features/profile/employee-profile";
import ProtectedRoute from "./protected-route";
import Layout from "@/components/layout";
import EmployeeAttendance from "@/features/attendance/employee-attendance";
import EmployeeLeave from "@/features/leave/employee-leave";
import EmployeeOvertime from "@/features/overtime/employee-overtime";
import EmployeePayslip from "@/features/payslip/employee-payslip";
import EmployeeDashboard from "@/features/dashboard/employee-dashboard";
import HRDashboard from "@/features/dashboard/hr-dashboard";
import HREmployees from "@/features/employees/employees-list";
import HREmployeeDetail from "@/features/employees/employee-detail";
import HRAttendance from "@/features/attendance/hr-attendance";
import HRLeave from "@/features/leave/hr-leave";
import HROvertime from "@/features/overtime/hr-overtime";
import HRPosition from "@/features/position/hr-position";
import HRDepartment from "@/features/department/hr-department";
import HRBenefit from "@/features/benefit/hr-benefit";
import Imports from "@/features/imports/imports";
import ITUsers from "@/features/users/it-users";
import ITRoles from "@/features/roles/it-roles";
import PayrollRuns from "@/features/payroll/payroll-runs";
import PayrollRunDetail from "@/features/payroll/payroll-run-detail";
import PayrollContributions from "@/features/payroll/payroll-contributions";
import PayrollDeductions from "@/features/payroll/payroll-deductions";
import PayrollTaxBrackets from "@/features/payroll/tax-brackets";
import PayrollSssRates from "@/features/payroll/sss-rates";
import PayrollPhilhealthRates from "@/features/payroll/philhealth-rates";
import PayrollPagibigRates from "@/features/payroll/pagibig-rates";
import SupervisorTeam from "@/features/team/team";
import SupervisorDashboard from "@/features/dashboard/supervisor-dashboard";
import PayrollDashboard from "@/features/dashboard/payroll-dashboard";
import ITDashboard from "@/features/dashboard/it-dashboard";
import SuperuserDashboard from "@/features/dashboard/superuser-dashboard";
import RoleRoute from "./role-route";
import NotFound from "@/features/misc/not-found";

export const AppRoutes = createBrowserRouter([
  { path: "/", element: <Navigate to="login" replace /> },
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            element: <RoleRoute allowedRoles={["EMPLOYEE"]} />,
            children: [
              { path: "/employee/profile", element: <EmployeeProfile /> },
              { path: "/employee/dashboard", element: <EmployeeDashboard /> },
              { path: "/employee/attendance", element: <EmployeeAttendance /> },
              { path: "/employee/leave", element: <EmployeeLeave /> },
              { path: "/employee/overtime", element: <EmployeeOvertime /> },
              { path: "/employee/payslip", element: <EmployeePayslip /> },
            ],
          },

          {
            element: <RoleRoute allowedRoles={["HR"]} />,
            children: [
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
          { path: "/imports", element: <Imports /> },

          {
            element: <RoleRoute allowedRoles={["PAYROLL"]} />,
            children: [
              { path: "/payroll/dashboard", element: <PayrollDashboard /> },
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
              { path: "/it/dashboard", element: <ITDashboard /> },
              { path: "/it/users", element: <ITUsers /> },
              { path: "/it/roles", element: <ITRoles /> },
            ],
          },
          {
            element: <RoleRoute allowedRoles={["SUPERVISOR"]} />,
            children: [
              { path: "/supervisor/dashboard", element: <SupervisorDashboard /> },
              { path: "/supervisor/team", element: <SupervisorTeam /> },
            ],
          },
          {
            element: <RoleRoute allowedRoles={["SUPERUSER"]} />,
            children: [
              { path: "/superuser/dashboard", element: <SuperuserDashboard /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
