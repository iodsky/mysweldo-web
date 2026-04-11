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
import { login, type Role } from "../../../api/auth";
import { notifications } from "@mantine/notifications";
import type { AxiosError } from "axios";
import type { ApiError } from "../../../api/types";
import { useState } from "react";

function Login() {
  const [role, setRole] = useState<Role>("EMPLOYEE");

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
    loginFn({ email, password, role });
  };

  const { mutate: loginFn, isPending } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Authentication success!",
        color: "green",
        withBorder: true,
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      notifications.show({
        title: "Error",
        message: error.response?.data.message ?? "Authentication failed",
        color: "red",
        withBorder: true,
      });
    },
  });

  return (
    <>
      <Container className="h-screen">
        <Center className="h-full">
          <Card className="w-full max-w-md">
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
                  value={role}
                  onChange={(value) => setRole(value as Role)}
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
