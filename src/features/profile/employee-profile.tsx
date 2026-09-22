import { Loader, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useGetAuthenticatedEmployee } from "@/api/generated/endpoints/employees/employees";
import { unwrapData } from "@/api/helpers";
import ProfileHeaderCard from "@/features/employees/components/profile-header-card";
import PersonalInfoCard from "@/features/employees/components/personal-info-card";
import GovernmentIdsCard from "@/features/employees/components/government-ids-card";
import EmploymentCard from "@/features/employees/components/employment-card";
import CompensationCard from "@/features/employees/components/compensation-card";
import BenefitsCard from "@/features/employees/components/benefits-card";

function Page() {
  const { data, isLoading, error } = useGetAuthenticatedEmployee({
    query: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours - rarely updated
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days - keep in cache long term
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <IconAlertCircle size={48} color="red" />
          <Text size="lg" fw={700} c="red">
            An unexpected error has occured
          </Text>
        </div>
      </div>
    );
  }

  const employee = unwrapData(data);

  if (!employee) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Text>No employee data found</Text>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 space-y-5 overflow-y-auto">
      <ProfileHeaderCard employee={employee} />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <PersonalInfoCard employee={employee} />
        <GovernmentIdsCard employee={employee} />
        <EmploymentCard employee={employee} />
        <CompensationCard employee={employee} />
      </div>
      <BenefitsCard employee={employee} />
    </div>
  );
}

export default Page;