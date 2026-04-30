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
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BsEye, BsTrash, BsPlus, BsThreeDotsVertical } from "react-icons/bs";
import { getAllEmployees, deleteEmployee } from "../../../api/employee";
import { PaginatedTable } from "../../../components/PaginatedTable";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import { EmployeeForm } from "../../../components/EmployeeForm";
import type { Employee, EmploymentStatus } from "../../../types";

function Page() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [formOpened, setFormOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
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
        status: statusFilter ? (statusFilter as EmploymentStatus) : undefined,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Delete employee mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDeleteOpened(false);
      setSelectedEmployee(null);
    },
  });

  const handleViewEmployee = (employee: Employee) => {
    navigate(`/hr/employees/${employee.id}`);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteOpened(true);
  };

  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setFormOpened(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedEmployee) {
      deleteMutation.mutate(parseInt(selectedEmployee.id));
    }
  };

  const handleFormClose = () => {
    setFormOpened(false);
    setSelectedEmployee(null);
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
      render: (_: unknown, row: Employee) => (
        <Text size="sm" fw={500}>
          {row.firstName} {row.lastName}
        </Text>
      ),
    },
    {
      key: "position",
      label: "Position",
      render: (value: unknown) => <Text size="sm">{String(value)}</Text>,
    },
    {
      key: "department",
      label: "Department",
      render: (value: unknown) => <Text size="sm">{String(value)}</Text>,
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
      render: (_: unknown, row: Employee) => (
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
              leftSection={<BsTrash size={14} />}
              color="red"
              onClick={() => handleDeleteEmployee(row)}
            >
              Delete
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
        employee={selectedEmployee || undefined}
        isEditing={false}
      />

      <ConfirmationModal
        opened={deleteOpened}
        title="Delete Employee"
        message={`Are you sure you want to delete ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteOpened(false);
          setSelectedEmployee(null);
        }}
      />
    </Box>
  );
}

export default Page;
