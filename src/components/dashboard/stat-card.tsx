import { Card, Group, Text } from "@mantine/core";
import type { TablerIcon } from "@tabler/icons-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: TablerIcon;
  delta?: string;
  deltaColor?: string;
}

function StatCard({ label, value, icon: Icon, delta, deltaColor }: StatCardProps) {
  return (
    <Card withBorder shadow="sm" className="flex flex-col gap-1">
      <Group justify="space-between" align="flex-start">
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        {Icon && <Icon size={18} stroke={1.5} className="text-gray-500" />}
      </Group>
      <Text size="xl" fw={700}>
        {value}
      </Text>
      {delta && (
        <Text size="xs" c={deltaColor ?? "dimmed"}>
          {delta}
        </Text>
      )}
    </Card>
  );
}

export default StatCard;