import { Grid } from "@mantine/core";
import { IconWallet } from "@tabler/icons-react";
import type { Employee } from "@/types";
import ProfileCard from "./profile-card";
import ProfileField from "./profile-field";
import { formatCurrency, formatEnum } from "./profile-format";

interface CompensationCardProps {
  employee: Employee;
}

function CompensationCard({ employee }: CompensationCardProps) {
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
    </ProfileCard>
  );
}

export default CompensationCard;