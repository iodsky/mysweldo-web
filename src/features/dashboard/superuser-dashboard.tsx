import { Breadcrumbs, SimpleGrid, Text } from "@mantine/core";
import { BarChart, LineChart } from "@mantine/charts";
import {
  IconBeach,
  IconCash,
  IconShieldLock,
  IconUsers,
} from "@tabler/icons-react";
import StatCard from "@/components/dashboard/stat-card";
import ChartCard from "@/components/dashboard/chart-card";

const DEPARTMENT_HEADCOUNT = [
  { department: "Engineering", headcount: 42 },
  { department: "Sales", headcount: 28 },
  { department: "HR", headcount: 8 },
  { department: "Finance", headcount: 12 },
  { department: "Operations", headcount: 25 },
  { department: "Support", headcount: 15 },
];

const PAYROLL_TREND = [
  { month: "Apr", gross: 1_420_000, net: 1_160_000 },
  { month: "May", gross: 1_385_000, net: 1_132_000 },
  { month: "Jun", gross: 1_510_000, net: 1_238_000 },
  { month: "Jul", gross: 1_468_000, net: 1_205_000 },
  { month: "Aug", gross: 1_554_000, net: 1_274_000 },
  { month: "Sep", gross: 1_582_000, net: 1_298_000 },
];

const TOTAL_EMPLOYEES = DEPARTMENT_HEADCOUNT.reduce(
  (sum, d) => sum + d.headcount,
  0,
);

const formatMoney = (value: number) =>
  `₱${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function Page() {
  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Superuser</Text>
        <Text size="sm">Dashboard</Text>
      </Breadcrumbs>

      <div>
        <Text size="lg" fw={700}>
          System Overview
        </Text>
        <Text size="sm" c="dimmed">
          High-level summary across the organization
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          label="Total Employees"
          value={TOTAL_EMPLOYEES}
          icon={IconUsers}
          delta="+4 this month"
          deltaColor="green"
        />
        <StatCard
          label="Active Users"
          value={151}
          icon={IconShieldLock}
          delta="6 admin roles"
        />
        <StatCard
          label="Latest Payroll Net"
          value={formatMoney(1_298_000)}
          icon={IconCash}
          delta="Sep 01–15"
          deltaColor="green"
        />
        <StatCard
          label="Pending Requests"
          value={20}
          icon={IconBeach}
          delta="Leave + overtime"
          deltaColor="yellow"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <ChartCard title="Headcount by Department">
          <BarChart
            h={260}
            data={DEPARTMENT_HEADCOUNT}
            dataKey="department"
            series={[{ name: "headcount", color: "blue" }]}
          />
        </ChartCard>
        <ChartCard title="Gross vs Net (Last 6 Months)">
          <LineChart
            h={260}
            data={PAYROLL_TREND}
            dataKey="month"
            series={[
              { name: "gross", color: "blue" },
              { name: "net", color: "green" },
            ]}
            curveType="natural"
          />
        </ChartCard>
      </SimpleGrid>
    </div>
  );
}

export default Page;