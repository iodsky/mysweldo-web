import { Card, Group, Text } from "@mantine/core";
import type { ReactNode } from "react";
import type { TablerIcon } from "@tabler/icons-react";

interface ProfileCardProps {
  title: string;
  icon?: TablerIcon;
  children: ReactNode;
}

function ProfileCard({ title, icon: Icon, children }: ProfileCardProps) {
  return (
    <Card withBorder shadow="sm" radius="md" className="h-full">
      <Group gap="xs" mb="md">
        {Icon && <Icon size={18} stroke={1.5} className="text-gray-500" />}
        <Text size="sm" fw={700}>
          {title}
        </Text>
      </Group>
      {children}
    </Card>
  );
}

export default ProfileCard;
