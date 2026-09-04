import { useState } from "react";
import {
  Anchor,
  Breadcrumbs,
  Button,
  Text,
  ActionIcon,
  Menu,
  Modal,
  TextInput,
  NumberInput,
  PasswordInput,
  Select,
  Badge,
  Table,
  Loader,
} from "@mantine/core";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { IconPlus, IconDotsVertical, IconPencil } from "@tabler/icons-react";
import {
  useCreateUser,
  useGetUsers,
  useUpdateUserRole,
} from "@/api/generated/endpoints/users/users";
import { useGetAllRoles } from "@/api/generated/endpoints/role-management/role-management";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import type { User, UserRole } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [createEmployeeId, setCreateEmployeeId] = useState<number | "">("");
  const [createRole, setCreateRole] = useState<string | null>(null);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [editRole, setEditRole] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError } = useGetUsers(
    { pageNo: page, limit: pageSize, roleName: roleFilter ?? undefined },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const { data: rolesData } = useGetAllRoles(
    { pageNo: 0, limit: 100 },
    {
      query: { queryKey: ["roles", "user-form"] as const },
    },
  );

  const roleOptions = (unwrapPage<UserRole>(rolesData).content ?? []).map(
    (role) => ({ value: role.name, label: role.name }),
  );

  const pageData = unwrapPage<User>(data);
  const users = pageData.content;
  const meta = pageData.meta;

  const resetCreateForm = () => {
    setCreateEmployeeId("");
    setCreateRole(null);
    setCreateEmail("");
    setCreatePassword("");
  };

  const { mutate: createUser, isPending: isCreating } = useCreateUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/users"] });
        setCreateModalOpen(false);
        resetCreateForm();
        notifications.show({
          title: "Success",
          color: "green",
          message: "User created successfully",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: updateRole, isPending: isUpdating } = useUpdateUserRole({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/users"] });
        setEditModalOpen(false);
        setSelectedUser(null);
        notifications.show({
          title: "Success",
          color: "green",
          message: "User role updated successfully",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const handleCreateClick = () => {
    resetCreateForm();
    setCreateModalOpen(true);
  };

  const handleCreateSave = () => {
    if (
      createEmployeeId === "" ||
      !createRole ||
      !createEmail.trim() ||
      !createPassword
    ) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please fill in all required fields",
        withBorder: true,
      });
      return;
    }

    createUser({
      data: {
        employeeId: Number(createEmployeeId),
        role: createRole,
        email: createEmail.trim(),
        password: createPassword,
      },
    });
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role ?? null);
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editRole) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please select a role",
        withBorder: true,
      });
      return;
    }

    updateRole({ id: selectedUser?.id ?? "", params: { role: editRole } });
  };

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">IT</Text>
        <Anchor size="sm">Users</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            User Management
          </Text>
          <Text size="sm" c="dimmed">
            Manage user accounts and roles
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
          Add User
        </Button>
      </div>

      <div className="flex gap-2 w-64">
        <Select
          label="Filter by role"
          placeholder="All roles"
          data={roleOptions}
          value={roleFilter}
          onChange={(value) => {
            setRoleFilter(value);
            setPage(0);
          }}
          clearable
          searchable
        />
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={["Employee ID", "Email", "Role", "Created", "Actions"]}
          rows={users.map((user: User) => (
            <Table.Tr key={user.id}>
              <Table.Td>{user.employeeId}</Table.Td>
              <Table.Td>{user.email}</Table.Td>
              <Table.Td>
                <Badge variant="light">{user.role}</Badge>
              </Table.Td>
              <Table.Td>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "-"}
              </Table.Td>
              <Table.Td align="center">
                <Menu shadow="md" position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconPencil size={14} />}
                      onClick={() => handleEditClick(user)}
                    >
                      Change Role
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
          meta={meta}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPage(0);
            setPageSize(size);
          }}
          onPageChange={(p) => setPage(p - 1)}
          isFetching={isFetching}
          isError={isError}
          errorMessage="Failed to load users. Please try again or contact support."
          emptyMessage="No users found"
        />
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      )}

      {/* Create Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          resetCreateForm();
        }}
        title="Add User"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <NumberInput
            label="Employee ID"
            placeholder="e.g. 1001"
            description="Must match an existing employee ID"
            value={createEmployeeId}
            onChange={(val) =>
              setCreateEmployeeId(val === "" ? "" : Number(val))
            }
            min={1001}
            hideControls
            required
          />

          <Select
            label="Role"
            placeholder="Select role"
            data={roleOptions}
            value={createRole}
            onChange={setCreateRole}
            searchable
            required
          />

          <TextInput
            label="Email"
            placeholder="e.g. juan@company.com"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.currentTarget.value)}
            required
          />

          <PasswordInput
            label="Password"
            placeholder="Min 8 characters"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.currentTarget.value)}
            required
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                resetCreateForm();
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSave} loading={isCreating}>
              Create User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="Change User Role"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div>
            <Text size="sm" fw={500} mb="xs">
              User
            </Text>
            <Text>{selectedUser?.email}</Text>
          </div>

          <Select
            label="Role"
            placeholder="Select role"
            data={roleOptions}
            value={editRole}
            onChange={setEditRole}
            searchable
            required
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedUser(null);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave} loading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Page;