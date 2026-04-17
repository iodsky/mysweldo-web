import { Navigate, Outlet } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <Center className="h-screen">
        <Loader size="lg" />
      </Center>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
