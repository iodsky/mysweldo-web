import { NavLink, Stack } from "@mantine/core";
import {
  IconArrowDownRight,
  IconBeach,
  IconBriefcase,
  IconBuildingBank,
  IconCalendarCheck,
  IconCash,
  IconClockPlus,
  IconGift,
  IconFileImport,
  IconHeartbeat,
  IconHome,
  IconLayoutDashboard,
  IconLogout,
  IconPercentage,
  IconReportMoney,
  IconShieldLock,
  IconSitemap,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import type { TablerIcon } from "@tabler/icons-react";
import { useLogout } from "@/api/generated/endpoints/authentication/authentication";
import { notifications } from "@mantine/notifications";

interface NavLinkItem {
  label: string;
  path: string;
  icon: TablerIcon;
}

function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearAuth, accessType, user } = useAuth();
  const location = useLocation();

  const { mutate: logutFn } = useLogout({
    mutation: {
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
    },
  });

  const hrLinks: NavLinkItem[] = [
    { label: "Dashboard", path: "/hr/dashboard", icon: IconLayoutDashboard },
    { label: "Employees", path: "/hr/employees", icon: IconUsers },
    { label: "Attendance", path: "/hr/attendance", icon: IconCalendarCheck },
    { label: "Leave", path: "/hr/leave", icon: IconBeach },
    { label: "Overtime", path: "/hr/overtime", icon: IconClockPlus },
    { label: "Department", path: "/hr/department", icon: IconSitemap },
    { label: "Position", path: "/hr/position", icon: IconBriefcase },
    { label: "Benefit", path: "/hr/benefit", icon: IconGift },
    { label: "Import", path: "/imports", icon: IconFileImport },
  ];

  const itLinks: NavLinkItem[] = [
    { label: "Users", path: "/it/users", icon: IconUsers },
    { label: "Roles", path: "/it/roles", icon: IconShieldLock },
    { label: "Import", path: "/imports", icon: IconFileImport },
  ];

  const payrollLinks: NavLinkItem[] = [
    { label: "Payroll Run", path: "/payroll/runs", icon: IconCash },
    { label: "Contributions", path: "/payroll/contributions", icon: IconReportMoney },
    { label: "Deductions", path: "/payroll/deductions", icon: IconArrowDownRight },
    { label: "Income Tax", path: "/payroll/tax-brackets", icon: IconPercentage },
    { label: "SSS Rates", path: "/payroll/sss-rates", icon: IconBuildingBank },
    { label: "PhilHealth", path: "/payroll/philhealth-rates", icon: IconHeartbeat },
    { label: "Pag-IBIG", path: "/payroll/pagibig-rates", icon: IconHome },
  ];

  const employeeLinks: NavLinkItem[] = [
    { label: "Profile", path: "/employee/profile", icon: IconUser },
    { label: "Attendance", path: "/employee/attendance", icon: IconCalendarCheck },
    {
      label: "Leave",
      path: "/employee/leave",
      icon: IconBeach,
    },
    {
      label: "Overtime",
      path: "/employee/overtime",
      icon: IconClockPlus,
    },
    {
      label: "Payslip",
      path: "/employee/payslip",
      icon: IconCash,
    },
  ];

  const superuserLinks = [
    ...hrLinks,
    ...payrollLinks,
    ...itLinks,
  ].filter(
    (link, index, self) => self.findIndex((l) => l.path === link.path) === index,
  );

  const roleLinksMap: Record<string, NavLinkItem[]> = {
    HR: hrLinks,
    IT: itLinks,
    PAYROLL: payrollLinks,
    SUPERUSER: superuserLinks,
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
        leftSection={<IconLogout size={16} />}
      />
    </Stack>
  );
}

export default Navbar;
