import { SimpleGrid, Text } from "@mantine/core";
import { IconGift } from "@tabler/icons-react";
import type { Employee } from "@/types";
import ProfileCard from "./profile-card";
import ProfileField from "./profile-field";
import { formatBenefitName, formatCurrency } from "./profile-format";

interface BenefitsCardProps {
  employee: Employee;
}

function BenefitsCard({ employee }: BenefitsCardProps) {
  const benefits = employee.benefits ?? [];

  return (
    <ProfileCard title="Benefits" icon={IconGift} fullHeight={false}>
      {benefits.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {benefits.map((benefit, index) => (
            <ProfileField
              key={index}
              label={formatBenefitName(benefit.benefit)}
              value={formatCurrency(benefit.amount)}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Text size="sm" c="dimmed">
          No benefits assigned
        </Text>
      )}
    </ProfileCard>
  );
}

export default BenefitsCard;