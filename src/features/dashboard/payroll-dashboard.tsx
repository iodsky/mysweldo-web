import { Breadcrumbs, SimpleGrid, Text } from "@mantine/core";
import { DonutChart, LineChart } from "@mantine/charts";
import {
  IconArrowDownRight,
  IconBuildingBank,
  IconCash,
  IconCalendarEvent,
  IconUsers,
} from "@tabler/icons-react";
import StatCard from "@/components/dashboard/stat-card";
import ChartCard from "@/components/dashboard/chart-card";

const PAYROLL_TREND = [
  { month: "Apr", gross: 1_420_000, net: 1_160_000 },
  { month: "May", gross: 1_385_000, net: 1_132_000 },
  { month: "Jun", gross: 1_510_000, net: 1_238_000 },
  { month: "Jul", gross: 1_468_000, net: 1_205_000 },
  { month: "Aug", gross: 1_554_000, net: 1_274_000 },
  { month: "Sep", gross: 1_582_000, net: 1_298_000 },
];

const CONTRIBUTION_BREAKDOWN = [
  { name: "SSS", value: 148_200, color: "blue" },
  { name: "PhilHealth", value: 62_400, color: "teal" },
  { name: "Pag-IBIG", value: 31_200, color: "grape" },
];

const LATEST_RUN_NET = 1_298_000;
const LATEST_RUN_GROSS = 1_582_000;
const LATEST_RUN_DEDUCTIONS = LATEST_RUN_GROSS - LATEST_RUN_NET;

const formatMoney = (value: number) =>
  `₱${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function Page() {
  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Payroll</Text>
        <Text size="sm">Dashboard</Text>
      </Breadcrumbs>

      <div>
        <Text size="lg" fw={700}>
          Payroll Dashboard
        </Text>
        <Text size="sm" c="dimmed">
          Payroll run summary and contribution totals
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          label="Latest Run · Gross"
          value={formatMoney(LATEST_RUN_GROSS)}
          icon={IconCash}
          delta="Sep 01–15"
        />
        <StatCard
          label="Latest Run · Net"
          value={formatMoney(LATEST_RUN_NET)}
          icon={IconCash}
          deltaColor="green"
        />
        <StatCard
          label="Latest Run · Deductions"
          value={formatMoney(LATEST_RUN_DEDUCTIONS)}
          icon={IconArrowDownRight}
        />
        <StatCard
          label="Employees Processed"
          value={135}
          icon={IconUsers}
          delta="All on schedule"
          deltaColor="green"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
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
        <ChartCard title="Government Contribution Breakdown">
          <DonutChart
            h={260}
            data={CONTRIBUTION_BREAKDOWN}
            withLabelsLine
            withLabels
          />
        </ChartCard>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          label="Next Run"
          value="Sep 30"
          icon={IconCalendarEvent}
          delta="Semi-monthly · cutoff Sep 30"
        />
        <StatCard
          label="Total Contributions (Sep)"
          value={formatMoney(241_800)}
          icon={IconBuildingBank}
        />
      </SimpleGrid>
    </div>
  );
}

export default Page;