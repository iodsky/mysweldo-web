import { Grid } from "@mantine/core";
import { IconId } from "@tabler/icons-react";
import type { Employee } from "@/types";
import ProfileCard from "./profile-card";
import ProfileField from "./profile-field";

interface GovernmentIdsCardProps {
  employee: Employee;
}

function GovernmentIdsCard({ employee }: GovernmentIdsCardProps) {
  return (
    <ProfileCard title="Government IDs" icon={IconId}>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="SSS Number" value={employee.sssNumber} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="TIN Number" value={employee.tinNumber} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="PhilHealth Number" value={employee.philhealthNumber} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="Pag-IBIG Number" value={employee.pagIbigNumber} />
        </Grid.Col>
      </Grid>
    </ProfileCard>
  );
}

export default GovernmentIdsCard;