import { NavLink, Stack } from "@mantine/core";
import { FaUmbrellaBeach, FaBusinessTime, FaUser } from "react-icons/fa";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { RiLogoutBoxFill } from "react-icons/ri";
import { MdTimer } from "react-icons/md";

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
  const { clearAuth } = useAuth();
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

  const employeeLinks: NavLinkItem[] = [
    { label: "Profile", path: "/employee/profile", icon: FaUser },
    { label: "Attendance", path: "/employee/attendance", icon: MdTimer },
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

  return (
    <Stack gap={0} justify="space-between" style={{ height: "100%" }}>
      <Stack gap={0}>
        {employeeLinks.map((link) => (
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
