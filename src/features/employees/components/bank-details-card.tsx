import { Grid } from "@mantine/core";
import { IconBuildingBank } from "@tabler/icons-react";
import type { Employee } from "@/types";
import ProfileCard from "./profile-card";
import ProfileField from "./profile-field";

interface BankDetailsCardProps {
  employee: Employee;
}

function BankDetailsCard({ employee }: BankDetailsCardProps) {
  return (
    <ProfileCard title="Bank Details" icon={IconBuildingBank}>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="Bank Name" value={employee.bankName} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="Account Number" value={employee.accountNumber} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField
            label="Account Holder Name"
            value={employee.accountHolderName}
          />
        </Grid.Col>
      </Grid>
    </ProfileCard>
  );
}

export default BankDetailsCard;