import {
  Anchor,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  PasswordInput,
  SegmentedControl,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../../api/auth";
import { notifications } from "@mantine/notifications";
import type { AccessType, ApiError } from "../../../types";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function Login() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [accessType, setAccessType] = useState<AccessType>("EMPLOYEE");

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (!value.trim() ? "Password is required" : null),
    },
  });

  const handleLogin = (email: string, password: string) => {
    loginFn({ email, password, accessType });
  };

  const { mutate: loginFn, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAuth(response.data);
      notifications.show({
        title: "Success",
        message: "Authentication success!",
        color: "green",
        withBorder: true,
      });
      navigate("/employee/profile");
    },
    onError: (error: ApiError) => {
      notifications.show({
        title: "Error",
        message: error.message ?? "Authentication failed",
        color: "red",
        withBorder: true,
      });
    },
  });

  return (
    <>
      <Container className="h-screen">
        <Center className="h-full">
          <Card className="w-full max-w-md" withBorder={true}>
            <form
              onSubmit={form.onSubmit((values) => {
                handleLogin(values.email, values.password);
              })}
            >
              <Stack>
                <Center>
                  <Title order={3}>MySweldo</Title>
                </Center>

                <SegmentedControl
                  value={accessType}
                  onChange={(value) => setAccessType(value as AccessType)}
                  data={[
                    { label: "Employee", value: "EMPLOYEE" },
                    { label: "Admin", value: "ADMIN" },
                  ]}
                />

                <TextInput
                  variant="filled"
                  label="Email"
                  placeholder="your@email.com"
                  key={form.key("email")}
                  {...form.getInputProps("email")}
                />

                <PasswordInput
                  variant="filled"
                  label="Password"
                  placeholder="Your password"
                  type="password"
                  key={form.key("password")}
                  {...form.getInputProps("password")}
                />

                <Group gap="xs" justify="flex-end">
                  <Anchor size="sm">Forgot password?</Anchor>
                </Group>

                <Button variant="filled" type="submit" color="black">
                  {isPending ? <Loader size="sm" /> : "Login"}
                </Button>
              </Stack>
            </form>
          </Card>
        </Center>
      </Container>
    </>
  );
}

export default Login;
