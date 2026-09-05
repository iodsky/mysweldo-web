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
  Switch,
  Badge,
  Table,
  Loader,
} from "@mantine/core";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { IconPlus, IconDotsVertical, IconTrash, IconPencil } from "@tabler/icons-react";
import {
  useCreateDeduction,
  useDeleteDeduction,
  useGetAllDeductions,
  useUpdateDeduction,
} from "@/api/generated/endpoints/deductions/deductions";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type { Deduction } from "@/types";
import { notifications } from "@mantine/notifications";

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<Deduction | null>(
    null,
  );

  const [createCode, setCreateCode] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createStatutory, setCreateStatutory] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editStatutory, setEditStatutory] = useState(false);

  const { data, isLoading, isFetching, isError } = useGetAllDeductions(
    { pageNo: page, limit: pageSize },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const pageData = unwrapPage<Deduction>(data);
  const deductions = pageData.content;
  const meta = pageData.meta;

  const resetCreateForm = () => {
    setCreateCode("");
    setCreateDescription("");
    setCreateStatutory(false);
  };

  const { mutate: createDeduction, isPending: isCreating } =
    useCreateDeduction({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/deductions"] });
          setCreateModalOpen(false);
          resetCreateForm();
          notifications.show({
            title: "Success",
            color: "green",
            message: "Deduction created successfully",
            withBorder: true,
          });
        },
      },
    });

  const { mutate: updateDeduction, isPending: isUpdating } =
    useUpdateDeduction({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/deductions"] });
          setEditModalOpen(false);
          setSelectedDeduction(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Deduction updated successfully",
            withBorder: true,
          });
        },
      },
    });

  const { mutate: deleteDeduction, isPending: isDeleting } =
    useDeleteDeduction({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/deductions"] });
          setDeleteModalOpen(false);
          setSelectedDeduction(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Deduction deleted successfully",
            withBorder: true,
          });
        },
      },
    });

  const handleCreateClick = () => {
    resetCreateForm();
    setCreateModalOpen(true);
  };

  const handleCreateSave = () => {
    if (!createCode.trim() || !createDescription.trim()) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please fill in all required fields",
        withBorder: true,
      });
      return;
    }

    createDeduction({
      data: {
        code: createCode.trim(),
        description: createDescription.trim(),
        statutory: createStatutory,
      },
    });
  };

  const handleEditClick = (deduction: Deduction) => {
    setSelectedDeduction(deduction);
    setEditDescription(deduction.description ?? "");
    setEditStatutory(deduction.statutory ?? false);
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editDescription.trim()) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please enter a description",
        withBorder: true,
      });
      return;
    }

    updateDeduction({
      code: selectedDeduction?.code ?? "",
      data: {
        code: selectedDeduction?.code ?? "",
        description: editDescription.trim(),
        statutory: editStatutory,
      },
    });
  };

  const handleDeleteClick = (deduction: Deduction) => {
    setSelectedDeduction(deduction);
    setDeleteModalOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Payroll</Text>
        <Anchor size="sm">Deductions</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            Deduction Management
          </Text>
          <Text size="sm" c="dimmed">
            Manage deduction configurations
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
          Add Deduction
        </Button>
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={["Code", "Description", "Type", "Created", "Actions"]}
          rows={deductions.map((deduction: Deduction) => (
            <Table.Tr key={deduction.code}>
              <Table.Td>{deduction.code}</Table.Td>
              <Table.Td>{deduction.description}</Table.Td>
              <Table.Td>
                <Badge color={deduction.statutory ? "blue" : "gray"}>
                  {deduction.statutory ? "Statutory" : "Non-Statutory"}
                </Badge>
              </Table.Td>
              <Table.Td>
                {deduction.createdAt
                  ? new Date(deduction.createdAt).toLocaleDateString()
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
                      onClick={() => handleEditClick(deduction)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => handleDeleteClick(deduction)}
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
          errorMessage="Failed to load deductions. Please try again or contact support."
          emptyMessage="No deductions found"
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
        title="Add Deduction"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Code"
            placeholder="e.g. SSS"
            description="Uppercase letters, numbers, and underscores only (max 50 characters)"
            value={createCode}
            onChange={(e) => setCreateCode(e.currentTarget.value.toUpperCase())}
            required
          />

          <TextInput
            label="Description"
            placeholder="e.g. Social Security System"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.currentTarget.value)}
            required
          />

          <Switch
            label="Statutory"
            checked={createStatutory}
            onChange={(e) => setCreateStatutory(e.currentTarget.checked)}
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
              Create Deduction
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedDeduction(null);
        }}
        title="Edit Deduction"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Code
            </Text>
            <Text>{selectedDeduction?.code}</Text>
          </div>

          <TextInput
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.currentTarget.value)}
            required
          />

          <Switch
            label="Statutory"
            checked={editStatutory}
            onChange={(e) => setEditStatutory(e.currentTarget.checked)}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedDeduction(null);
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
        title="Delete Deduction"
        message={`Are you sure you want to delete "${selectedDeduction?.description}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={() => deleteDeduction({ code: selectedDeduction?.code ?? "" })}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedDeduction(null);
        }}
      />
    </div>
  );
}

export default Page;