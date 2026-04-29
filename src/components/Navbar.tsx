import { NavLink, Stack } from "@mantine/core";
import {
  FaUmbrellaBeach,
  FaBusinessTime,
  FaUser,
  FaUsers,
  FaBriefcase,
} from "react-icons/fa";
import { GoOrganization } from "react-icons/go";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { RiLogoutBoxFill } from "react-icons/ri";
import { MdCheckCircle } from "react-icons/md";
import { TfiDashboard } from "react-icons/tfi";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IconType } from "react-icons/lib";
import { logout } from "../api/auth";
import { notifications } from "@mantine/notifications";

interface NavLinkItem {
  label: string;
  path: string;
  icon: IconType;
}

function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearAuth, accessType, user } = useAuth();
  const location = useLocation();

  const { mutate: logutFn } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["employee"] });
      clearAuth();
      navigate("/login");
      notifications.show({
        title: "Success",
        message: "Logout success!",
        color: "green",
        withBorder: true,
      });
    },
  });

  const hrLinks: NavLinkItem[] = [
    { label: "Dashboard", path: "/hr/dashboard", icon: TfiDashboard },
    { label: "Employees", path: "/hr/employees", icon: FaUsers },
    { label: "Attendance", path: "/hr/attendance", icon: MdCheckCircle },
    { label: "Leave", path: "/hr/leave", icon: FaUmbrellaBeach },
    { label: "Overtime", path: "/hr/overtime", icon: FaBusinessTime },
    { label: "Position", path: "/hr/position", icon: FaBriefcase },
    { label: "Department", path: "/hr/department", icon: GoOrganization },
  ];

  const itLinks: NavLinkItem[] = [
    { label: "Users", path: "/it/users", icon: FaUsers },
  ];

  const payrollLinks: NavLinkItem[] = [
    { label: "Payroll Run", path: "/payroll/runs", icon: FaMoneyCheckDollar },
  ];

  const employeeLinks: NavLinkItem[] = [
    { label: "Profile", path: "/employee/profile", icon: FaUser },
    { label: "Attendance", path: "/employee/attendance", icon: MdCheckCircle },
    {
      label: "Leave",
      path: "/employee/leave",
      icon: FaUmbrellaBeach,
    },
    {
      label: "Overtime",
      path: "/employee/overtime",
      icon: FaBusinessTime,
    },
    {
      label: "Payslip",
      path: "/employee/payslip",
      icon: FaMoneyCheckDollar,
    },
  ];

  const roleLinksMap: Record<string, NavLinkItem[]> = {
    HR: hrLinks,
    IT: itLinks,
    PAYROLL: payrollLinks,
  };

  const links: NavLinkItem[] =
    accessType === "EMPLOYEE"
      ? employeeLinks
      : (roleLinksMap[user?.role ?? ""] ?? employeeLinks);

  return (
    <Stack gap={0} justify="space-between" style={{ height: "100%" }}>
      <Stack gap={0}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            label={link.label}
            leftSection={<link.icon size={16} />}
            active={location.pathname.startsWith(link.path)}
            onClick={() => navigate(link.path)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </Stack>

      <NavLink
        label="Logout"
        onClick={() => logutFn()}
        leftSection={<RiLogoutBoxFill />}
      />
    </Stack>
  );
}

export default Navbar;
