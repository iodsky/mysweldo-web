import { Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

interface ProfileFieldProps {
  label: string;
  value?: ReactNode;
}

function ProfileField({ label, value }: ProfileFieldProps) {
  const display =
    value === null || value === undefined || value === "" ? "—" : value;

  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={500} className="break-words">
        {display}
      </Text>
    </Stack>
  );
}

export default ProfileField;
