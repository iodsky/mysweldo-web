import { Breadcrumbs, SimpleGrid, Text } from "@mantine/core";
import { DonutChart, LineChart } from "@mantine/charts";
import {
  IconBeach,
  IconCalendarCheck,
  IconClockHour4,
  IconWallet,
} from "@tabler/icons-react";
import StatCard from "@/components/dashboard/stat-card";
import ChartCard from "@/components/dashboard/chart-card";

const LEAVE_USAGE = [
  { name: "Vacation", value: 8, color: "blue" },
  { name: "Sick", value: 4, color: "red" },
  { name: "Remaining", value: 20, color: "green" },
];

const ATTENDANCE_TREND = [
  { month: "Apr", days: 20 },
  { month: "May", days: 21 },
  { month: "Jun", days: 19 },
  { month: "Jul", days: 22 },
  { month: "Aug", days: 21 },
  { month: "Sep", days: 18 },
];

function Page() {
  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Employee</Text>
        <Text size="sm">Dashboard</Text>
      </Breadcrumbs>

      <div>
        <Text size="lg" fw={700}>
          My Dashboard
        </Text>
        <Text size="sm" c="dimmed">
          Your leave, attendance, and pay at a glance
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          label="Vacation Leave Credits"
          value="12"
          icon={IconBeach}
          delta="2 used this year"
        />
        <StatCard
          label="Sick Leave Credits"
          value="8"
          icon={IconBeach}
          delta="1 used this year"
        />
        <StatCard
          label="Days Attended (Sep)"
          value={18}
          icon={IconCalendarCheck}
          delta="21 working days"
        />
        <StatCard
          label="Latest Net Pay"
          value="₱28,450.00"
          icon={IconWallet}
          delta="Payslip #245"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <ChartCard title="Leave Usage">
          <DonutChart
            h={260}
            data={LEAVE_USAGE}
            withLabelsLine
            withLabels
          />
        </ChartCard>
        <ChartCard title="Days Attended (Last 6 Months)">
          <LineChart
            h={260}
            data={ATTENDANCE_TREND}
            dataKey="month"
            series={[{ name: "days", color: "blue" }]}
            curveType="natural"
          />
        </ChartCard>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          label="Pending Leave Requests"
          value={2}
          icon={IconClockHour4}
          delta="Awaiting approval"
          deltaColor="yellow"
        />
        <StatCard
          label="Pending Overtime"
          value={1}
          icon={IconClockHour4}
          delta="Awaiting approval"
          deltaColor="yellow"
        />
      </SimpleGrid>
    </div>
  );
}

export default Page;