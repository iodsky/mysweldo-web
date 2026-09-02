import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getRedirectPath } from "@/utils/redirect";
import type { Role } from "@/types";

function Page() {
  const navigate = useNavigate();
  const { accessType, user } = useAuth();

  const handleGoHome = () => {
    if (!accessType || !user) {
      navigate("/login", { replace: true });
      return;
    }

    navigate(getRedirectPath(accessType, user.role as Role), { replace: true });
  };

  return (
    <Center className="h-screen">
      <Stack align="center" gap="md" px="md">
        <Title order={1}>404</Title>
        <Text c="dimmed" ta="center">
          The page you are looking for does not exist.
        </Text>
        <Button onClick={handleGoHome} color='black'>Go home</Button>
      </Stack>
    </Center>
  );
}

export default Page;
