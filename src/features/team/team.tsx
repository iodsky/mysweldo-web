import { Anchor, Breadcrumbs, Tabs, Text } from "@mantine/core";
import { useGetSubordinates } from "@/api/generated/endpoints/employees/employees";
import { unwrapPage } from "@/api/helpers";
import type { EmployeeBasic } from "@/types";
import AttendanceTab from "./team-attendance-tab";
import OvertimeTab from "./team-overtime-tab";
import LeaveTab from "./team-leave-tab";

function Page() {
  const { data } = useGetSubordinates(
    { pageNo: 0, limit: 100 },
    {
      query: {
        queryKey: ["subordinates", "roster"] as const,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
      },
    },
  );

  const roster = new Map<number, string>();
  unwrapPage<EmployeeBasic>(data).content.forEach((emp) => {
    if (emp.id != null) {
      const name = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
      roster.set(emp.id, name || String(emp.id));
    }
  });

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Supervisor</Text>
        <Anchor size="sm">Team</Anchor>
      </Breadcrumbs>

      <div>
        <Text size="lg" fw={700}>
          Team Management
        </Text>
        <Text size="sm" c="dimmed">
          Review your team's attendance, overtime, and leave requests
        </Text>
      </div>

      <Tabs
        defaultValue="attendance"
        variant="outline"
        className="flex flex-col flex-1"
      >
        <Tabs.List grow justify="space-between">
          <Tabs.Tab value="attendance">Attendance</Tabs.Tab>
          <Tabs.Tab value="overtime">Overtime</Tabs.Tab>
          <Tabs.Tab value="leave">Leave</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="attendance" pt="md" className="flex flex-col flex-1">
          <AttendanceTab />
        </Tabs.Panel>
        <Tabs.Panel value="overtime" pt="md" className="flex flex-col flex-1">
          <OvertimeTab roster={roster} />
        </Tabs.Panel>
        <Tabs.Panel value="leave" pt="md" className="flex flex-col flex-1">
          <LeaveTab roster={roster} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default Page;