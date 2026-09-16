import { Avatar, Badge, Card, Group, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";
import type { Employee } from "@/types";
import { formatEnum, fullName, initials } from "./profile-format";

interface ProfileHeaderCardProps {
  employee: Employee;
  photoUrl?: string;
  action?: ReactNode;
}

function ProfileHeaderCard({ employee, photoUrl, action }: ProfileHeaderCardProps) {
  return (
    <Card withBorder shadow="sm" radius="md" p="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="lg" align="center" wrap="nowrap">
          <Avatar
            name={fullName(employee)}
            color="initials"
            src={photoUrl}
            radius="100%"
            size={88}
            className="shrink-0"
          >
            {initials(employee)}
          </Avatar>
          <Stack gap="xs">
            <Text size="xl" fw={700}>
              {fullName(employee)}
            </Text>
            <Group gap="xs">
              <Badge>{employee.position?.title}</Badge>
              <Badge variant="light">{employee.department?.title}</Badge>
              <Badge color={employee.status === "REGULAR" ? "green" : "gray"}>
                {formatEnum(employee.status)}
              </Badge>
            </Group>
          </Stack>
        </Group>
        {action}
      </Group>
    </Card>
  );
}

export default ProfileHeaderCard;