import { Navigate, Outlet } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "@/hooks/use-auth";

interface RoleRouteProps {
  allowedRoles: string[];
}

function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { accessType, isInitializing, user } = useAuth();

  if (isInitializing) {
    return (
      <Center className="h-screen">
        <Loader size="lg" />
      </Center>
    );
  }

  const role = user?.role;
  const isAllowed =
    accessType === "ADMIN" &&
    (role === "SUPERUSER" || allowedRoles.includes(role ?? ""));

  return isAllowed ? <Outlet /> : <Navigate to="/" replace />;
}

export default RoleRoute;