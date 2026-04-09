import {
  Anchor,
  Button,
  Card,
  Center,
  Container,
  Group,
  PasswordInput,
  SegmentedControl,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";

function Login() {
  return (
    <>
      <Container className="h-screen">
        <Center className="h-full">
          <Card className="w-full max-w-md">
            <Stack>
              <Center>
                <Title order={3}>MySweldo</Title>
              </Center>

              <SegmentedControl data={["Employee", "Admin"]} />

              <TextInput
                variant="filled"
                label="Email"
                placeholder="your@email.com"
              />

              <PasswordInput
                variant="filled"
                label="Password"
                placeholder="Your password"
                type="password"
              />

              <Group gap="xs" justify="flex-end">
                <Anchor size="sm">Forgot password?</Anchor>
              </Group>

              <Button variant="filled" type="submit" color="black">
                Login
              </Button>
            </Stack>
          </Card>
        </Center>
      </Container>
    </>
  );
}

export default Login;
