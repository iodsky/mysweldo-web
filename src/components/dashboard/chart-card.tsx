import { Card, Text } from "@mantine/core";
import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card withBorder shadow="sm" className="flex flex-col gap-4">
      <Text size="sm" fw={600}>
        {title}
      </Text>
      {children}
    </Card>
  );
}

export default ChartCard;