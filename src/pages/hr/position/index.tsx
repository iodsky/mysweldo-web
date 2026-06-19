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
  Select,
  Table,
  Loader,
} from "@mantine/core";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { BsPlus, BsThreeDotsVertical } from "react-icons/bs";
import { MdDeleteOutline, MdOutlineModeEdit } from "react-icons/md";
import {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
} from "@/api/position";
import { getAllDepartments } from "@/api/department";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type { Position } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null,
  );

  const [createId, setCreateId] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createDepartmentId, setCreateDepartmentId] = useState<
    string | null
  >(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState<string | null>(
    null,
  );

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["positions", page],
    queryFn: () => getPositions({ pageNo: page, limit: 10 }),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  const { data: departmentsData } = useQuery({
    queryKey: ["departments", "position-form"],
    queryFn: getAllDepartments,
  });

  const departmentOptions = departmentsData?.data
    ? departmentsData.data.map((department) => ({
        value: department.id,
        label: department.title,
      }))
    : [];

  const positions = data?.data || [];
  const meta = data?.meta;

  const resetCreateForm = () => {
    setCreateId("");
    setCreateTitle("");
    setCreateDepartmentId(null);
  };

  const { mutate: createPos, isPending: isCreating } = useMutation({
    mutationFn: createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setCreateModalOpen(false);
      resetCreateForm();
      notifications.show({
        title: "Success",
        color: "green",
        message: "Position created successfully",
        withBorder: true,
      });
    },
    onError: handleApiError,
  });

  const { mutate: updatePos, isPending: isUpdating } = useMutation({
    mutationFn: (payload: { departmentId: string; title: string }) =>
      updatePosition(selectedPosition!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setEditModalOpen(false);
      setSelectedPosition(null);
      notifications.show({
        title: "Success",
        color: "green",
        message: "Position updated successfully",
        withBorder: true,
      });
    },
    onError: handleApiError,
  });

  const { mutate: deletePos, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePosition(selectedPosition!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setDeleteModalOpen(false);
      setSelectedPosition(null);
      notifications.show({
        title: "Success",
        color: "green",
        message: "Position deleted successfully",
        withBorder: true,
      });
    },
    onError: handleApiError,
  });

  const handleCreateClick = () => {
    resetCreateForm();
    setCreateModalOpen(true);
  };

  const handleCreateSave = () => {
    if (!createId.trim() || !createTitle.trim() || !createDepartmentId) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please fill in all required fields",
        withBorder: true,
      });
      return;
    }

    createPos({
      id: createId.trim(),
      departmentId: createDepartmentId,
      title: createTitle.trim(),
    });
  };

  const handleEditClick = (position: Position) => {
    setSelectedPosition(position);
    setEditTitle(position.title);
    setEditDepartmentId(position.departmentId);
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editTitle.trim() || !editDepartmentId) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please fill in all required fields",
        withBorder: true,
      });
      return;
    }

    updatePos({ departmentId: editDepartmentId, title: editTitle.trim() });
  };

  const handleDeleteClick = (position: Position) => {
    setSelectedPosition(position);
    setDeleteModalOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">HR</Text>
        <Anchor size="sm">Position</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            Position Management
          </Text>
          <Text size="sm" c="dimmed">
            Manage all positions in the system
          </Text>
        </div>
        <Button leftSection={<BsPlus size={16} />} onClick={handleCreateClick}>
          Add Position
        </Button>
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={["ID", "Department", "Title", "Created", "Actions"]}
          rows={positions.map((position: Position) => (
            <Table.Tr key={position.id}>
              <Table.Td>{position.id}</Table.Td>
              <Table.Td>{position.departmentTitle}</Table.Td>
              <Table.Td>{position.title}</Table.Td>
              <Table.Td>
                {new Date(position.createdAt).toLocaleDateString()}
              </Table.Td>
              <Table.Td align="center">
                <Menu shadow="md" position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <BsThreeDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<MdOutlineModeEdit size={14} />}
                      onClick={() => handleEditClick(position)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<MdDeleteOutline size={14} />}
                      color="red"
                      onClick={() => handleDeleteClick(position)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
          meta={meta}
          onPageChange={(p) => setPage(p - 1)}
          isFetching={isFetching}
          isError={isError}
          errorMessage="Failed to load positions. Please try again or contact support."
          emptyMessage="No positions found"
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
        title="Add Position"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Position ID"
            placeholder="e.g. HR_MANAGER"
            description="Uppercase letters, numbers, and underscores only (max 20 characters)"
            value={createId}
            onChange={(e) => setCreateId(e.currentTarget.value.toUpperCase())}
            required
          />

          <Select
            label="Department"
            placeholder="Select department"
            data={departmentOptions}
            value={createDepartmentId}
            onChange={setCreateDepartmentId}
            searchable
            clearable
            required
          />

          <TextInput
            label="Title"
            placeholder="e.g. HR Manager"
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
              Create Position
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedPosition(null);
        }}
        title="Edit Position"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Position ID
            </Text>
            <Text>{selectedPosition?.id}</Text>
          </div>

          <Select
            label="Department"
            placeholder="Select department"
            data={departmentOptions}
            value={editDepartmentId}
            onChange={setEditDepartmentId}
            searchable
            clearable
            required
          />

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
                setSelectedPosition(null);
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
        title="Delete Position"
        message={`Are you sure you want to delete "${selectedPosition?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={() => deletePos()}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedPosition(null);
        }}
      />
    </div>
  );
}

export default Page;
