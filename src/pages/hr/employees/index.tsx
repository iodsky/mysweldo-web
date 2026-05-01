import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Select,
  Breadcrumbs,
  Anchor,
  Modal,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BsEye, BsPlus, BsThreeDotsVertical } from "react-icons/bs";
import { TbUserEdit } from "react-icons/tb";
import {
  getAllEmployees,
  updateEmployeeStatus,
  getEmployeeById,
} from "../../../api/employee";
import { PaginatedTable } from "../../../components/PaginatedTable";
import { EmployeeForm } from "../../../components/EmployeeForm";
import type {
  EmploymentStatus,
  EmployeeBasic,
  Employee,
  Position,
  Department,
} from "../../../types";
import { notifications } from "@mantine/notifications";

function Page() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
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

  // Fetch employees list
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["employees", page, departmentFilter, statusFilter],
    queryFn: () =>
      getAllEmployees({
        pageNo: page,
        limit: 10,
        department: departmentFilter || undefined,
        supervisor: undefined,
        status: statusFilter || undefined,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch full employee details for editing
  const { data: employeeDetail } = useQuery({
    queryKey: ["employee", editingEmployee?.id],
    queryFn: () => getEmployeeById(editingEmployee!.id),
    enabled: !!editingEmployee?.id,
  });

  // Delete employee mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: EmploymentStatus }) =>
      updateEmployeeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDeleteOpened(false);
      setSelectedEmployee(null);
      setSelectedStatus(null);

      notifications.show({
        color: "green",
        title: "Success",
        message: "Employee status updated successfully",
      });
    },
    onError: (err) => {
      let message = "Something went wrong";
      if ("message" in err && "status" in err) {
        message = err.message;
      }

      notifications.show({ title: "Error", message, color: "red" });
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
    if (!selectedEmployee || !selectedStatus) return;

    statusMutation.mutate({ id: selectedEmployee.id, status: selectedStatus });
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

  const employees = data?.data || [];
  const meta = data?.meta;
  const errorMessage =
    error instanceof Error ? error.message : "Failed to load employees";

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (value: unknown) => <Text size="sm">{String(value)}</Text>,
    },
    {
      key: "firstName",
      label: "Name",
      render: (_: unknown, row: EmployeeBasic) => (
        <Text size="sm" fw={500}>
          {row.firstName} {row.lastName}
        </Text>
      ),
    },
    {
      key: "position",
      label: "Position",
      render: (value: unknown) => (
        <Text size="sm">{String((value as Position)?.title)}</Text>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (value: unknown) => (
        <Text size="sm">{String((value as Department)?.title)}</Text>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => {
        const statusColor =
          value === "REGULAR"
            ? "green"
            : value === "PROBATIONARY"
              ? "blue"
              : "gray";
        return <Badge color={statusColor}>{String(value)}</Badge>;
      },
    },
    {
      key: "type",
      label: "Type",
      render: (value: unknown) => (
        <Badge variant="light" size="sm">
          {String(value).replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      isAction: true,
      render: (_: unknown, row: EmployeeBasic) => (
        <Menu shadow="md" position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm">
              <BsThreeDotsVertical size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<BsEye size={14} />}
              onClick={() => handleViewEmployee(row)}
            >
              View
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<TbUserEdit size={14} />}
              color="red"
              onClick={() => handleDeleteEmployee(row)}
            >
              Terminate
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <Box p="lg">
      <Stack gap="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor
            href="/hr/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigate("/hr/dashboard");
            }}
            size="sm"
          >
            HR
          </Anchor>
          <Text size="sm">Employees</Text>
        </Breadcrumbs>

        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Text size="lg" fw={700}>
              Employee Management
            </Text>
            <Text size="sm" c="dimmed">
              Manage all employees in the system
            </Text>
          </div>
          <Button
            leftSection={<BsPlus size={16} />}
            onClick={handleCreateEmployee}
          >
            Add Employee
          </Button>
        </Group>

        {/* Filters */}
        <Group gap="md">
          <Select
            placeholder="Filter by department"
            searchable
            clearable
            data={[
              { value: "IT", label: "IT" },
              { value: "HR", label: "HR" },
              { value: "Finance", label: "Finance" },
              { value: "Operations", label: "Operations" },
              { value: "Marketing", label: "Marketing" },
            ]}
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
        </Group>

        {/* Table */}
        <PaginatedTable
          columns={columns}
          rows={employees}
          isFetching={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          emptyMessage="No employees found"
          meta={meta}
          onNextPage={() => setPage((p) => p + 1)}
          onPreviousPage={() => setPage((p) => p - 1)}
        />
      </Stack>

      {/* Modals */}
      <EmployeeForm
        opened={formOpened}
        onClose={handleFormClose}
        employee={employeeDetail?.data || undefined}
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
        <Stack gap="md">
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
          <Group justify="flex-end">
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
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

export default Page;
