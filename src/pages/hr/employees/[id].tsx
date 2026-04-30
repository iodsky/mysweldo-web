import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Text,
  Group,
  Badge,
  Stack,
  Grid,
  Divider,
  Button,
  Loader,
  Center,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { BsPencil } from "react-icons/bs";
import { getEmployeeById } from "../../../api/employee";
import { EmployeeForm } from "../../../components/EmployeeForm";
import type { Employee } from "../../../types";

function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployeeById(parseInt(id!)),
    enabled: !!id,
  });

  const employee = data?.data;

  if (isLoading) {
    return (
      <Center className="h-screen">
        <Loader size="xl" />
      </Center>
    );
  }

  if (error || !employee) {
    return (
      <Center className="h-screen">
        <Stack align="center" gap="md">
          <Text size="lg" fw={700} c="red">
            Failed to load employee details
          </Text>
          <Button onClick={() => navigate("/hr/employees")}>
            Back to Employees
          </Button>
        </Stack>
      </Center>
    );
  }

  const handleEdit = () => {
    setEditingEmployee(employee);
    setIsEditing(true);
  };

  const handleFormClose = () => {
    setIsEditing(false);
    setEditingEmployee(null);
  };

  const breadcrumbItems = [
    { title: "HR", href: "/hr/dashboard" },
    { title: "Employees", href: "/hr/employees" },
    { title: `${employee.firstName} ${employee.lastName}`, href: "#" },
  ];

  return (
    <Container fluid>
      {/* Breadcrumbs */}
      <Breadcrumbs mb="lg">
        {breadcrumbItems.map((item, index) =>
          index === breadcrumbItems.length - 1 ? (
            <Text key={index} size="sm">
              {item.title}
            </Text>
          ) : (
            <Anchor
              key={index}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              size="sm"
            >
              {item.title}
            </Anchor>
          ),
        )}
      </Breadcrumbs>

      <Paper withBorder p="lg" radius="md">
        {/* Header Section */}
        <Group justify="space-between" mb="lg">
          <div>
            <Text size="lg" fw={700}>
              {employee.firstName} {employee.lastName}
            </Text>
            <Group gap="xs" mt="xs">
              <Badge>{employee.position}</Badge>
              <Badge variant="light">{employee.department}</Badge>
              <Badge color={employee.status === "REGULAR" ? "green" : "gray"}>
                {employee.status}
              </Badge>
            </Group>
          </div>
          <Button leftSection={<BsPencil size={16} />} onClick={handleEdit}>
            Edit
          </Button>
        </Group>

        <Divider my="md" />

        <Stack gap="md">
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
              <Grid.Col span={{ base: 12, sm: 12 }}>
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
                  <Text>{employee.position}</Text>
                </div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Department
                  </Text>
                  <Text>{employee.department}</Text>
                </div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Supervisor
                  </Text>
                  <Text>{employee.supervisor}</Text>
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
                  <Text>{employee.basicSalary}</Text>
                </div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Status
                  </Text>
                  <Text>{employee.status}</Text>
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
                    Pag-IBIG Number
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
                  {employee.benefits.map((benefit, index) => (
                    <Grid.Col span={{ base: 12, sm: 6 }} key={index}>
                      <div>
                        <Text size="xs" c="dimmed" tt="capitalize">
                          {benefit.benefit}
                        </Text>
                        <Text>{benefit.amount}</Text>
                      </div>
                    </Grid.Col>
                  ))}
                </Grid>
              </div>
            </>
          )}
        </Stack>
      </Paper>

      {/* Edit Modal */}
      <EmployeeForm
        opened={isEditing}
        onClose={handleFormClose}
        employee={editingEmployee || undefined}
        isEditing={true}
      />
    </Container>
  );
}

export default Page;
