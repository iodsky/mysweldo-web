import { Component } from "react";
import type { ReactNode } from "react";
import { Button, Center, Stack, Text, Title } from "@mantine/core";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.error("Unhandled render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Center className="h-screen">
          <Stack align="center" gap="md">
            <Title order={3}>Something went wrong</Title>
            <Text c="dimmed">
              An unexpected error occurred. Please reload the page.
            </Text>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </Stack>
        </Center>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;