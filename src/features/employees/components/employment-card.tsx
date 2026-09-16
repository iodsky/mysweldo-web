import { Grid } from "@mantine/core";
import { IconBriefcase } from "@tabler/icons-react";
import type { Employee } from "@/types";
import ProfileCard from "./profile-card";
import ProfileField from "./profile-field";
import { formatEnum, formatTime } from "./profile-format";

interface EmploymentCardProps {
  employee: Employee;
}

function EmploymentCard({ employee }: EmploymentCardProps) {
  const supervisorName = employee.supervisor
    ? `${employee.supervisor.firstName} ${employee.supervisor.lastName}`
    : "—";

  return (
    <ProfileCard title="Employment" icon={IconBriefcase}>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="Position" value={employee.position?.title} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="Department" value={employee.department?.title} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="Supervisor" value={supervisorName} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="Employment Type" value={formatEnum(employee.type)} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="Start Shift" value={formatTime(employee.startShift)} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <ProfileField label="End Shift" value={formatTime(employee.endShift)} />
        </Grid.Col>
      </Grid>
    </ProfileCard>
  );
}

export default EmploymentCard;