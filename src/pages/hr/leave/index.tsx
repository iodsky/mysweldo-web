import { Stack, Tabs, Title } from "@mantine/core";
import LeaveRequestsTab from "./leave-requests-tab";
import LeaveCreditsTab from "./leave-credits-tab";

function Page() {
  return (
    <Stack gap="lg" p="lg">
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
    </Stack>
  );
}

export default Page;
