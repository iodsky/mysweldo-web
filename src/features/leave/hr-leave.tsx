import { Breadcrumbs, Tabs, Text, Anchor } from "@mantine/core";
import LeaveRequestsTab from "./hr-leave-requests-tab";
import LeaveCreditsTab from "./hr-leave-credits-tab";

function Page() {
  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
        <Breadcrumbs>
          <Text size="sm">HR</Text>
          <Anchor size="sm">Leaves</Anchor>
        </Breadcrumbs>
      
        <div className="flex flex-col justify-center">
          <Text size="lg" fw={700}> 
            Leave Management
          </Text>
          <Text size="sm" c="dimmed">
            Manage leave requests and credits
          </Text>
        </div> 

        <Tabs defaultValue="requests" variant="outline" className="flex flex-col flex-1">
          <Tabs.List grow justify="space-between">
            <Tabs.Tab value="requests">Leave Requests</Tabs.Tab>
            <Tabs.Tab value="credits">Leave Credits</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="requests" pt="md" className="flex flex-col flex-1">
            <LeaveRequestsTab />
          </Tabs.Panel>
          <Tabs.Panel value="credits" pt="md" className="flex flex-col flex-1">
            <LeaveCreditsTab />
          </Tabs.Panel>
        </Tabs>
    </div>
  );
}

export default Page;
