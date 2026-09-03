import { Anchor, Breadcrumbs, Card, SimpleGrid, Table, Text } from "@mantine/core";
import { BarChart, DonutChart } from "@mantine/charts";
import {
  IconBeach,
  IconCalendarCheck,
  IconClockPlus,
  IconUsers,
} from "@tabler/icons-react";
import StatCard from "@/components/dashboard/stat-card";
import ChartCard from "@/components/dashboard/chart-card";

const TEAM_ATTENDANCE = [
  { day: "Mon", onTime: 18, late: 2, absent: 1 },
  { day: "Tue", onTime: 19, late: 1, absent: 1 },
  { day: "Wed", onTime: 17, late: 3, absent: 1 },
  { day: "Thu", onTime: 20, late: 1, absent: 0 },
  { day: "Fri", onTime: 18, late: 2, absent: 1 },
];

const PENDING_BY_TYPE = [
  { name: "Leave", value: 6, color: "blue" },
  { name: "Overtime", value: 4, color: "orange" },
];

const PENDING_APPROVALS = [
  { employee: "Juan Dela Cruz", type: "Leave", detail: "Vacation · Sep 14–16", date: "2026-09-03" },
  { employee: "Maria Santos", type: "Overtime", detail: "4.5 hrs · Sep 05", date: "2026-09-03" },
  { employee: "Pedro Reyes", type: "Leave", detail: "Sick · Sep 04", date: "2026-09-02" },
  { employee: "Ana Lim", type: "Overtime", detail: "2.0 hrs · Sep 04", date: "2026-09-02" },
  { employee: "Carlos Garcia", type: "Leave", detail: "Bereavement · Sep 06–07", date: "2026-09-01" },
];

function Page() {
  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Supervisor</Text>
        <Text size="sm">Dashboard</Text>
      </Breadcrumbs>

      <div>
        <Text size="lg" fw={700}>
          Supervisor Dashboard
        </Text>
        <Text size="sm" c="dimmed">
          Your team at a glance and pending approvals
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard label="Team Headcount" value={21} icon={IconUsers} />
        <StatCard
          label="Pending Leave Approvals"
          value={6}
          icon={IconBeach}
          delta="3 need action today"
          deltaColor="yellow"
        />
        <StatCard
          label="Pending Overtime Approvals"
          value={4}
          icon={IconClockPlus}
          delta="2 need action today"
          deltaColor="yellow"
        />
        <StatCard
          label="On Leave Today"
          value={3}
          icon={IconCalendarCheck}
          delta="2 on vacation, 1 sick"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <ChartCard title="Team Attendance This Week">
          <BarChart
            h={260}
            data={TEAM_ATTENDANCE}
            dataKey="day"
            series={[
              { name: "onTime", color: "green" },
              { name: "late", color: "orange" },
              { name: "absent", color: "red" },
            ]}
          />
        </ChartCard>
        <ChartCard title="Pending Requests by Type">
          <DonutChart
            h={260}
            data={PENDING_BY_TYPE}
            withLabelsLine
            withLabels
          />
        </ChartCard>
      </SimpleGrid>

      <Card withBorder shadow="sm" className="flex flex-col gap-3">
        <Text size="sm" fw={600}>
          Recent Pending Approvals
        </Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Employee</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Details</Table.Th>
              <Table.Th>Submitted</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {PENDING_APPROVALS.map((req, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>{req.employee}</Table.Td>
                <Table.Td>{req.type}</Table.Td>
                <Table.Td>{req.detail}</Table.Td>
                <Table.Td>
                  <Anchor href="/supervisor/team" size="sm">
                    {req.date}
                  </Anchor>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}

export default Page;