import { Grid } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import type { Employee } from "@/types";
import ProfileCard from "./profile-card";
import ProfileField from "./profile-field";
import { formatDate } from "./profile-format";

interface PersonalInfoCardProps {
  employee: Employee;
}

function PersonalInfoCard({ employee }: PersonalInfoCardProps) {
  return (
    <ProfileCard title="Personal Information" icon={IconUser}>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="Birthday" value={formatDate(employee.birthday)} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="Phone Number" value={employee.phoneNumber} />
        </Grid.Col>
        <Grid.Col span={12}>
          <ProfileField label="Address" value={employee.address} />
        </Grid.Col>
      </Grid>
    </ProfileCard>
  );
}

export default PersonalInfoCard;