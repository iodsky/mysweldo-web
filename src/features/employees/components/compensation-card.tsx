import { Divider, Grid, Group, Stack, Text } from "@mantine/core";
import { IconWallet } from "@tabler/icons-react";
import type { Employee } from "@/types";
import ProfileCard from "./profile-card";
import ProfileField from "./profile-field";
import { formatCurrency, formatEnum } from "./profile-format";

interface CompensationCardProps {
  employee: Employee;
}

function CompensationCard({ employee }: CompensationCardProps) {
  const benefits = employee.benefits ?? [];

  return (
    <ProfileCard title="Compensation" icon={IconWallet}>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField
            label="Basic Salary"
            value={formatCurrency(employee.salary?.rate)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField
            label="Pay Type"
            value={formatEnum(employee.salary?.payType)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField
            label="Pay Frequency"
            value={formatEnum(employee.salary?.payFrequency)}
          />
        </Grid.Col>
      </Grid>

      <Divider my="md" />

      <Text size="xs" fw={700} tt="uppercase" c="dimmed">
        Benefits
      </Text>

      {benefits.length > 0 ? (
        <Stack gap="xs" mt="sm">
          {benefits.map((benefit, index) => (
            <Group key={index} justify="space-between">
              <Text size="sm" tt="capitalize">
                {benefit.benefit}
              </Text>
              <Text size="sm" fw={500}>
                {formatCurrency(benefit.amount)}
              </Text>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed" mt="sm">
          No benefits assigned
        </Text>
      )}
    </ProfileCard>
  );
}

export default CompensationCard;