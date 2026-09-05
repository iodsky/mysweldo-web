import { Breadcrumbs, SimpleGrid, Text } from "@mantine/core";
import { BarChart, DonutChart } from "@mantine/charts";
import {
  IconBeach,
  IconBuilding,
  IconClockPlus,
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

const EMPLOYMENT_STATUS = [
  { name: "Regular", value: 95, color: "green" },
  { name: "Probationary", value: 25, color: "yellow" },
  { name: "Contractual", value: 10, color: "blue" },
  { name: "Resigned", value: 5, color: "gray" },
];

const TOTAL_EMPLOYEES = DEPARTMENT_HEADCOUNT.reduce(
  (sum, d) => sum + d.headcount,
  0,
);

function Page() {
  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">HR</Text>
        <Text size="sm">Dashboard</Text>
      </Breadcrumbs>

      <div>
        <Text size="lg" fw={700}>
          HR Dashboard
        </Text>
        <Text size="sm" c="dimmed">
          Workforce overview and pending approvals
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
          label="Active Departments"
          value={DEPARTMENT_HEADCOUNT.length}
          icon={IconBuilding}
        />
        <StatCard
          label="Pending Leave"
          value={12}
          icon={IconBeach}
          delta="5 need review today"
          deltaColor="yellow"
        />
        <StatCard
          label="Pending Overtime"
          value={8}
          icon={IconClockPlus}
          delta="3 approvals due"
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
        <ChartCard title="Employees by Employment Status">
          <DonutChart
            h={260}
            data={EMPLOYMENT_STATUS}
            withLabelsLine
            withLabels
          />
        </ChartCard>
      </SimpleGrid>
    </div>
  );
}

export default Page;