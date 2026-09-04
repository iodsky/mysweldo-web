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
  Table,
  Loader,
} from "@mantine/core";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { IconPlus, IconDotsVertical, IconTrash, IconPencil } from "@tabler/icons-react";
import {
  useCreateRole,
  useDeleteRole,
  useGetAllRoles,
  useUpdateRole,
} from "@/api/generated/endpoints/role-management/role-management";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type { UserRole } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data, isLoading, isFetching, isError } = useGetAllRoles(
    { pageNo: page, limit: pageSize },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const pageData = unwrapPage<UserRole>(data);
  const roles = pageData.content;
  const meta = pageData.meta;

  const resetCreateForm = () => {
    setCreateName("");
    setCreateDescription("");
  };

  const { mutate: createRole, isPending: isCreating } = useCreateRole({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/roles"] });
        setCreateModalOpen(false);
        resetCreateForm();
        notifications.show({
          title: "Success",
          color: "green",
          message: "Role created successfully",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/roles"] });
        setEditModalOpen(false);
        setSelectedRole(null);
        notifications.show({
          title: "Success",
          color: "green",
          message: "Role updated successfully",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/roles"] });
        setDeleteModalOpen(false);
        setSelectedRole(null);
        notifications.show({
          title: "Success",
          color: "green",
          message: "Role deleted successfully",
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
    if (!createName.trim()) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please enter a role name",
        withBorder: true,
      });
      return;
    }

    createRole({
      data: {
        name: createName.trim(),
        description: createDescription.trim() || undefined,
      },
    });
  };

  const handleEditClick = (role: UserRole) => {
    setSelectedRole(role);
    setEditName(role.name ?? "");
    setEditDescription(role.description ?? "");
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editName.trim()) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please enter a role name",
        withBorder: true,
      });
      return;
    }

    updateRole({
      id: selectedRole?.id ?? 0,
      data: {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      },
    });
  };

  const handleDeleteClick = (role: UserRole) => {
    setSelectedRole(role);
    setDeleteModalOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">IT</Text>
        <Anchor size="sm">Roles</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            Role Management
          </Text>
          <Text size="sm" c="dimmed">
            Manage user roles and permissions
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
          Add Role
        </Button>
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={["ID", "Name", "Description", "Last Modified", "Actions"]}
          rows={roles.map((role: UserRole) => (
            <Table.Tr key={role.id}>
              <Table.Td>{role.id}</Table.Td>
              <Table.Td>{role.name}</Table.Td>
              <Table.Td>{role.description ?? "—"}</Table.Td>
              <Table.Td>
                {role.lastModified
                  ? new Date(role.lastModified).toLocaleDateString()
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
                      onClick={() => handleEditClick(role)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => handleDeleteClick(role)}
                    >
                      Delete
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
          errorMessage="Failed to load roles. Please try again or contact support."
          emptyMessage="No roles found"
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
        title="Add Role"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Role Name"
            placeholder="e.g. PAYROLL"
            description="Uppercase letters and underscores recommended"
            value={createName}
            onChange={(e) => setCreateName(e.currentTarget.value.toUpperCase())}
            required
          />

          <TextInput
            label="Description"
            placeholder="e.g. Handles payroll processing"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.currentTarget.value)}
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
              Create Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRole(null);
        }}
        title="Edit Role"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Role Name"
            value={editName}
            onChange={(e) => setEditName(e.currentTarget.value.toUpperCase())}
            required
          />

          <TextInput
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.currentTarget.value)}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedRole(null);
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

      {/* Delete Confirmation */}
      <ConfirmationModal
        opened={deleteModalOpen}
        title="Delete Role"
        message={`Are you sure you want to delete role "${selectedRole?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={() => deleteRole({ id: selectedRole?.id ?? 0 })}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedRole(null);
        }}
      />
    </div>
  );
}

export default Page;