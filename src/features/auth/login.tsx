import {
  Anchor,
  Button,
  Loader,
  PasswordInput,
  SegmentedControl,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLogin } from "@/api/generated/endpoints/authentication/authentication";
import { notifications } from "@mantine/notifications";
import type { AccessType, Role } from "@/types";
import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../utils/error-handler";
import { getRedirectPath } from "@/utils/redirect";

function Page() {
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
    loginFn({ data: { email, password, accessType } });
  };

  const { mutate: loginFn, isPending } = useLogin({
    mutation: {
      onSuccess: (response) => {
        const auth = response.data;
        if (!auth) return;
        setAuth(auth);
        notifications.show({
          title: "Success",
          message: "Authentication success!",
          color: "green",
          withBorder: true,
        });
        const redirectPath = getRedirectPath(
          auth.accessType ?? "EMPLOYEE",
          auth.user?.role as Role,
        );
        navigate(redirectPath);
      },
      onError: handleApiError,
    },
  });

  return (
      <div className="h-screen max-w-5xl mx-auto px-4"> 
        <div className="flex h-full items-center justify-center">
          <div className="w-full max-w-md border border-gray-200 rounded-lg p-4" >
            <form
              onSubmit={form.onSubmit((values) => { 
                handleLogin(values.email, values.password);
              })}
            >
              <div className="flex flex-col gap-4">
                <Title order={3} ta="center"  >MySweldo</Title>

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

                <div className="flex justify-end">
                  <Anchor size="sm">Forgot password?</Anchor>
                </div>

                <Button variant="filled" type="submit" color="black">
                  {isPending ? <Loader size="sm" /> : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}

export default Page;
