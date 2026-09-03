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
import {
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { IconPlus, IconDotsVertical, IconTrash, IconPencil } from "@tabler/icons-react";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useGetAllDepartments,
  useUpdateDepartment,
} from "@/api/generated/endpoints/departments/departments";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type { Department } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  const [createId, setCreateId] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const { data, isLoading, isFetching, isError } = useGetAllDepartments(
    { pageNo: page, limit: pageSize },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const pageData = unwrapPage<Department>(data);
  const departments = pageData.content;
  const meta = pageData.meta;

  const resetCreateForm = () => {
    setCreateId("");
    setCreateTitle("");
  };

  const { mutate: createDept, isPending: isCreating } = useCreateDepartment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/departments"] });
        setCreateModalOpen(false);
        resetCreateForm();
        notifications.show({
          title: "Success",
          color: "green",
          message: "Department created successfully",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: updateDept, isPending: isUpdating } = useUpdateDepartment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/departments"] });
        setEditModalOpen(false);
        setSelectedDepartment(null);
        notifications.show({
          title: "Success",
          color: "green",
          message: "Department updated successfully",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: deleteDept, isPending: isDeleting } = useDeleteDepartment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/departments"] });
        setDeleteModalOpen(false);
        setSelectedDepartment(null);
        notifications.show({
          title: "Success",
          color: "green",
          message: "Department deleted successfully",
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
    if (!createId.trim() || !createTitle.trim()) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please fill in all required fields",
        withBorder: true,
      });
      return;
    }

    createDept({ data: { id: createId.trim(), title: createTitle.trim() } });
  };

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setEditTitle(department.title ?? "");
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editTitle.trim()) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please enter a department title",
        withBorder: true,
      });
      return;
    }

    updateDept({ id: selectedDepartment?.id ?? "", data: { title: editTitle.trim() } });
  };

  const handleDeleteClick = (department: Department) => {
    setSelectedDepartment(department);
    setDeleteModalOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">HR</Text>
        <Anchor size="sm">Department</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            Department Management
          </Text>
          <Text size="sm" c="dimmed">
            Manage all departments in the system
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
          Add Department
        </Button>
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={["ID", "Title", "Created", "Actions"]}
          rows={departments.map((department: Department) => (
            <Table.Tr key={department.id}>
              <Table.Td>{department.id}</Table.Td>
              <Table.Td>{department.title}</Table.Td>
              <Table.Td>
                {department.createdAt ? new Date(department.createdAt).toLocaleDateString() : "-"}
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
                      onClick={() => handleEditClick(department)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => handleDeleteClick(department)}
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
          errorMessage="Failed to load departments. Please try again or contact support."
          emptyMessage="No departments found"
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
        title="Add Department"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Department ID"
            placeholder="e.g. HR_DEPT"
            description="Uppercase letters, numbers, and underscores only (max 20 characters)"
            value={createId}
            onChange={(e) => setCreateId(e.currentTarget.value.toUpperCase())}
            required
          />

          <TextInput
            label="Title"
            placeholder="e.g. Human Resources"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.currentTarget.value)}
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
              Create Department
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedDepartment(null);
        }}
        title="Edit Department"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Department ID
            </Text>
            <Text>{selectedDepartment?.id}</Text>
          </div>

          <TextInput
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.currentTarget.value)}
            required
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedDepartment(null);
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
        title="Delete Department"
        message={`Are you sure you want to delete "${selectedDepartment?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={() => deleteDept({ id: selectedDepartment?.id ?? "" })}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedDepartment(null);
        }}
      />
    </div>
  );
}

export default Page;
