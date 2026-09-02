import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Text,
  Badge,
  Grid,
  Button,
  Loader,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useGetEmployeeById } from "@/api/generated/endpoints/employees/employees";
import { unwrapData } from "@/api/helpers";
import { EmployeeForm } from "@/components/employee-form";
import type { Employee } from "@/types";

function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data, isLoading, error } = useGetEmployeeById(parseInt(id ?? "0"), {
    query: { enabled: !!id },
  });

  const employee = unwrapData<Employee>(data);

  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <Loader size="xl" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Text size="lg" fw={700} c="red">
            Failed to load employee details
          </Text>
          <Button onClick={() => navigate("/hr/employees")}>
            Back to Employees
          </Button>
        </div>
      </div>
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
    <>
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

      <div className="rounded-md border p-6">
        {/* Header Section */}
        <div className="flex justify-between mb-4">
          <div>
            <Text size="lg" fw={700}>
              {employee.firstName} {employee.lastName}
            </Text>
            <div className="flex gap-2.5 mt-2.5">
              <Badge>{employee.position?.title}</Badge>
              <Badge variant="light">{employee.department?.title}</Badge>
              <Badge color={employee.status === "REGULAR" ? "green" : "gray"}>
                {employee.status}
              </Badge>
            </div>
          </div>
          <Button leftSection={<IconPencil size={16} />} onClick={handleEdit}>
            Edit
          </Button>
        </div>

        <hr className="my-4" />

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

          <hr />

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
                  <Text>{employee.position?.title}</Text>
                </div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Department
                  </Text>
                  <Text>{employee.department?.title}</Text>
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
                      : employee.supervisor?.firstName +
                        " " +
                        employee.supervisor?.lastName}
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
                  <Text>{employee.salary?.rate || "0"}</Text>
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

          <hr />

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
              <hr />
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
        </div>
      </div>

      {/* Edit Modal */}
      <EmployeeForm
        opened={isEditing}
        onClose={handleFormClose}
        employee={editingEmployee || undefined}
        isEditing={true}
      />
    </>
  );
}

export default Page;