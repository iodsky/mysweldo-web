import { Tabs, Title } from "@mantine/core";
import LeaveRequestsTab from "./leave-requests-tab";
import LeaveCreditsTab from "./leave-credits-tab";

function Page() {
  return (
    <div className="p-5">
      <div className="flex flex-col gap-5">
        <Title order={2}>Leave Management</Title>
        <Tabs defaultValue="requests">
          <Tabs.List>
            <Tabs.Tab value="requests">Leave Requests</Tabs.Tab>
            <Tabs.Tab value="credits">Leave Credits</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="requests" pt="md">
            <LeaveRequestsTab />
          </Tabs.Panel>
          <Tabs.Panel value="credits" pt="md">
            <LeaveCreditsTab />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}

export default Page;
