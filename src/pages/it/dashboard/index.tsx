import { Breadcrumbs, SimpleGrid, Text } from "@mantine/core";
import { BarChart, DonutChart } from "@mantine/charts";
import {
  IconFileImport,
  IconShieldLock,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import StatCard from "@/components/dashboard/stat-card";
import ChartCard from "@/components/dashboard/chart-card";

const USERS_BY_ROLE = [
  { role: "HR", users: 8 },
  { role: "IT", users: 5 },
  { role: "PAYROLL", users: 6 },
  { role: "SUPERVISOR", users: 12 },
  { role: "EMPLOYEE", users: 118 },
  { role: "SUPERUSER", users: 2 },
];

const IMPORT_STATUS = [
  { name: "Completed", value: 42, color: "green" },
  { name: "Running", value: 2, color: "blue" },
  { name: "Failed", value: 4, color: "red" },
];

const TOTAL_USERS = USERS_BY_ROLE.reduce((sum, r) => sum + r.users, 0);

function Page() {
  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">IT</Text>
        <Text size="sm">Dashboard</Text>
      </Breadcrumbs>

      <div>
        <Text size="lg" fw={700}>
          IT Dashboard
        </Text>
        <Text size="sm" c="dimmed">
          User accounts, roles, and import activity
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          label="Total Users"
          value={TOTAL_USERS}
          icon={IconUsers}
          delta="+3 this week"
          deltaColor="green"
        />
        <StatCard
          label="Active Roles"
          value={6}
          icon={IconShieldLock}
        />
        <StatCard
          label="Successful Imports"
          value={42}
          icon={IconFileImport}
          delta="Last 30 days"
          deltaColor="green"
        />
        <StatCard
          label="Failed Imports"
          value={4}
          icon={IconX}
          delta="Last 30 days"
          deltaColor="red"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <ChartCard title="Users by Role">
          <BarChart
            h={260}
            data={USERS_BY_ROLE}
            dataKey="role"
            series={[{ name: "users", color: "blue" }]}
          />
        </ChartCard>
        <ChartCard title="Import Jobs by Status (30 Days)">
          <DonutChart
            h={260}
            data={IMPORT_STATUS}
            withLabelsLine
            withLabels
          />
        </ChartCard>
      </SimpleGrid>
    </div>
  );
}

export default Page;