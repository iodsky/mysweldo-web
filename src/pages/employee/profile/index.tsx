import {
  Paper,
  Text,
  Badge,
  Loader,
  Grid,
  Divider,
} from "@mantine/core";
import { VscServerProcess } from "react-icons/vsc";
import { useQuery } from "@tanstack/react-query";
import { getAuthenticatedEmployee } from "@/api/employee";

function Page() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["employee"],
    queryFn: getAuthenticatedEmployee,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - rarely updated
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days - keep in cache long term
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <VscServerProcess size={48} color="red" />
          <Text size="lg" fw={700} c="red">
            An unexpected error has occured
          </Text>
        </div>
      </div>
    );
  }

  const employee = data?.data;

  if (!employee) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Text>No employee data found</Text>
      </div>
    );
  }

  return (
    <Paper withBorder p="lg" radius="md">
      {/* Header Section */}
      <div className="flex justify-between mb-5">
        <div>
          <Text size="lg" fw={700}>
            {employee.firstName} {employee.lastName}
          </Text>
          <div className="flex gap-2 mt-2">
            <Badge>{employee.position.title}</Badge>
            <Badge variant="light">{employee.department.title}</Badge>
            <Badge color={employee.status === "REGULAR" ? "green" : "gray"}>
              {employee.status}
            </Badge>
          </div>
        </div>
      </div>

      <Divider my="md" />

      <div className="flex flex-col gap-4">
        {/* Personal Information */}
        <div>
          <Text size="sm" fw={700} mb="xs">
            Personal Information
          </Text>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  Birthday
                </Text>
                <Text>{employee.birthday}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  Phone Number
                </Text>
                <Text>{employee.phoneNumber}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  Address
                </Text>
                <Text>{employee.address}</Text>
              </div>
            </Grid.Col>
          </Grid>
        </div>

        <Divider />

        {/* Employment Information */}
        <div>
          <Text size="sm" fw={700} mb="xs">
            Employment Information
          </Text>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  Position
                </Text>
                <Text>{employee.position.title}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  Department
                </Text>
                <Text>{employee.department.title}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  Supervisor
                </Text>
                <Text>
                  {employee.supervisor == null
                    ? "N/A"
                    : employee.supervisor.firstName +
                      " " +
                      employee.supervisor.lastName}
                </Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  Employment Type
                </Text>
                <Text>{employee.type}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  Start Shift
                </Text>
                <Text>{employee.startShift}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  End Shift
                </Text>
                <Text>{employee.endShift}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  Basic Salary
                </Text>
                <Text>{employee.salary.rate}</Text>
              </div>
            </Grid.Col>
          </Grid>
        </div>

        <Divider />

        {/* Government IDs */}
        <div>
          <Text size="sm" fw={700} mb="xs">
            Government IDs
          </Text>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  SSS Number
                </Text>
                <Text>{employee.sssNumber}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  TIN Number
                </Text>
                <Text>{employee.tinNumber}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  PhilHealth Number
                </Text>
                <Text>{employee.philhealthNumber}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="xs" c="dimmed">
                  PAG-IBIG Number
                </Text>
                <Text>{employee.pagIbigNumber}</Text>
              </div>
            </Grid.Col>
          </Grid>
        </div>

        {/* Benefits */}
        {employee.benefits && employee.benefits.length > 0 && (
          <>
            <Divider />
            <div>
              <Text size="sm" fw={700} mb="xs">
                Benefits
              </Text>
              <Grid>
                {employee.benefits.map((benefit) => (
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Text size="xs" tt="capitalize" c="dimmed">
                      {benefit.benefit}
                    </Text>
                    <Text>{benefit.amount}</Text>
                  </Grid.Col>
                ))}
              </Grid>
            </div>
          </>
        )}
      </div>
    </Paper>
  );
}

export default Page;
