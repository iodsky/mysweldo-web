import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Select,
  Breadcrumbs,
  Anchor,
  Modal,
  Table,
} from "@mantine/core";
import {
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { IconEye, IconPlus, IconDotsVertical, IconUserEdit } from "@tabler/icons-react";
import {
  useGetAllEmployees,
  useUpdateEmployeeStatus,
  useGetEmployeeById,
} from "@/api/generated/endpoints/employees/employees";
import { useGetDepartmentOptions } from "@/api/generated/endpoints/departments/departments";
import { unwrapData, unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { EmployeeForm } from "@/features/employees/employee-form-modal";
import type { EmploymentStatus, EmployeeBasic, Employee } from "@/types";
import type { DepartmentDto } from "@/api/generated/model";
import { notifications } from "@mantine/notifications";

function Page() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [formOpened, setFormOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeBasic | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState<EmploymentStatus | null>(
    null,
  );

  const queryClient = useQueryClient();

  // Fetch departments for filter dropdown
  const { data: departmentsData, isLoading: departmentsLoading } =
    useGetDepartmentOptions({
      query: {
        queryKey: ["departments"] as const,
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    });

  // Fetch employees list
  const { data, isLoading, isFetching, isError } = useGetAllEmployees(
    {
      pageNo: page,
      limit: pageSize,
      department: departmentFilter || undefined,
      supervisor: undefined,
      status: statusFilter || undefined,
    },
    {
      query: {
        queryKey: ["employees", page, pageSize, departmentFilter, statusFilter] as const,
        staleTime: 1000 * 60 * 5, // 5 minutes
        placeholderData: keepPreviousData,
      },
    },
  );

  // Fetch full employee details for editing
  const { data: employeeDetail } = useGetEmployeeById(
    editingEmployee?.id ?? 0,
    {
      query: {
        queryKey: ["employee", editingEmployee?.id] as const,
        enabled: !!editingEmployee?.id,
      },
    },
  );

  // Delete employee mutation
  const statusMutation = useUpdateEmployeeStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/employees"] });
        setDeleteOpened(false);
        setSelectedEmployee(null);
        setSelectedStatus(null);

        notifications.show({
          color: "green",
          title: "Success",
          message: "Employee status updated successfully",
        });
      },
    },
  });

  const handleViewEmployee = (employee: EmployeeBasic) => {
    navigate(`/hr/employees/${employee.id}`);
  };

  const handleDeleteEmployee = (employee: EmployeeBasic) => {
    setSelectedEmployee(employee);
    setDeleteOpened(true);
  };

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setFormOpened(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedEmployee?.id || !selectedStatus) return;

    statusMutation.mutate({
      id: selectedEmployee.id,
      params: { status: selectedStatus },
    });
  };

  const handleFormClose = () => {
    setFormOpened(false);
    setEditingEmployee(null);
  };

  const handleResetFilters = () => {
    setDepartmentFilter(null);
    setStatusFilter(null);
    setPage(1);
  };

  const pageData = unwrapPage<EmployeeBasic>(data);
  const employees = pageData.content;
  const meta = pageData.meta;

  return (
    <>
      <div className="flex flex-col flex-1 gap-5 p-5">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Text size="sm">HR</Text>
          <Anchor size="sm">Employees</Anchor>
        </Breadcrumbs>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Text size="lg" fw={700}>
              Employee Management
            </Text>
            <Text size="sm" c="dimmed">
              Manage all employees in the system
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleCreateEmployee}
          >
            Add Employee
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select
            placeholder="Filter by department"
            searchable
            clearable
            disabled={departmentsLoading}
            data={
              (unwrapData<DepartmentDto[]>(departmentsData) ?? []).map((dept) => ({
                value: dept.id ?? "",
                label: dept.title ?? "",
              }))
            }
            value={departmentFilter}
            onChange={setDepartmentFilter}
            style={{ flex: 1, maxWidth: 200 }}
          />
          <Select
            placeholder="Filter by status"
            searchable
            clearable
            data={[
              { value: "PROBATIONARY", label: "Probationary" },
              { value: "REGULAR", label: "Regular" },
              { value: "TERMINATED", label: "Terminated" },
              { value: "RESIGNED", label: "Resigned" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ flex: 1, maxWidth: 200 }}
          />
          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={!departmentFilter && !statusFilter}
          >
            Reset Filters
          </Button>
        </div>

        {meta && (
          <PaginatedTable
            heading={[
              "ID",
              "Name",
              "Position",
              "Department",
              "Status",
              "Type",
              "Actions",
            ]}
            isError={isError}
            errorMessage="Failed to load employees. Please try again or contact support."
            isFetching={isFetching}
            meta={meta}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPage(0);
              setPageSize(size);
            }}
            onPageChange={(pageNum) => setPage(pageNum - 1)}
            rows={employees.map((row: EmployeeBasic) => (
              <Table.Tr key={String(row.id)}>
                <Table.Td>
                  <Text size="sm">{String(row.id)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {row.firstName} {row.lastName}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{String(row.position?.title ?? "")}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{String(row.department?.title ?? "")}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      row.status === "REGULAR"
                        ? "green"
                        : row.status === "PROBATIONARY"
                          ? "blue"
                          : "gray"
                    }
                  >
                    {String(row.status)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" size="sm">
                    {String(row.type).replace(/_/g, " ")}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Menu shadow="md" position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" size="sm">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEye size={14} />}
                        onClick={() => handleViewEmployee(row)}
                      >
                        View
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconUserEdit size={14} />}
                        color="red"
                        onClick={() => handleDeleteEmployee(row)}
                      >
                        Terminate
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          />
        )}
      </div>

      {/* Modals */}
      <EmployeeForm
        opened={formOpened}
        onClose={handleFormClose}
        employee={unwrapData<Employee>(employeeDetail) || undefined}
        isEditing={false}
      />

      <Modal
        opened={deleteOpened}
        title="Terminate Employee"
        onClose={() => {
          setDeleteOpened(false);
          setSelectedEmployee(null);
        }}
      >
        <div className="flex flex-col gap-3">
          <Text>{`Are you sure you want to terminate ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}? This action cannot be undone.`}</Text>
          <Select
            label="Status"
            placeholder="Select status"
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value as EmploymentStatus)}
            data={[
              { value: "TERMINATED", label: "Terminated" },
              { value: "RESIGNED", label: "Resigned" },
            ]}
          />{" "}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpened(false);
                setSelectedEmployee(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusUpdate}
              loading={statusMutation.isPending}
              color="red"
              disabled={!selectedStatus}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Page;
