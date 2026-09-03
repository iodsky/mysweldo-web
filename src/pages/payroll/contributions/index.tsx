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
  useCreateContribution,
  useDeleteContribution,
  useGetAllContributions,
  useUpdateContribution,
} from "@/api/generated/endpoints/contributions/contributions";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type { Contribution } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);

  const [createCode, setCreateCode] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data, isLoading, isFetching, isError } = useGetAllContributions(
    { pageNo: page, limit: 20 },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const pageData = unwrapPage<Contribution>(data);
  const contributions = pageData.content;
  const meta = pageData.meta;

  const resetCreateForm = () => {
    setCreateCode("");
    setCreateDescription("");
  };

  const { mutate: createContribution, isPending: isCreating } =
    useCreateContribution({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/contributions"] });
          setCreateModalOpen(false);
          resetCreateForm();
          notifications.show({
            title: "Success",
            color: "green",
            message: "Contribution created successfully",
            withBorder: true,
          });
        },
        onError: handleApiError,
      },
    });

  const { mutate: updateContribution, isPending: isUpdating } =
    useUpdateContribution({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/contributions"] });
          setEditModalOpen(false);
          setSelectedContribution(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Contribution updated successfully",
            withBorder: true,
          });
        },
        onError: handleApiError,
      },
    });

  const { mutate: deleteContribution, isPending: isDeleting } =
    useDeleteContribution({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/contributions"] });
          setDeleteModalOpen(false);
          setSelectedContribution(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Contribution deleted successfully",
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
    if (!createCode.trim() || !createDescription.trim()) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please fill in all required fields",
        withBorder: true,
      });
      return;
    }

    createContribution({
      data: {
        code: createCode.trim(),
        description: createDescription.trim(),
      },
    });
  };

  const handleEditClick = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setEditDescription(contribution.description ?? "");
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

    updateContribution({
      id: selectedContribution?.code ?? "",
      data: {
        code: selectedContribution?.code ?? "",
        description: editDescription.trim(),
      },
    });
  };

  const handleDeleteClick = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setDeleteModalOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Payroll</Text>
        <Anchor size="sm">Contributions</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            Contribution Management
          </Text>
          <Text size="sm" c="dimmed">
            Manage contribution configurations
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
          Add Contribution
        </Button>
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={["Code", "Description", "Created", "Actions"]}
          rows={contributions.map((contribution: Contribution) => (
            <Table.Tr key={contribution.code}>
              <Table.Td>{contribution.code}</Table.Td>
              <Table.Td>{contribution.description}</Table.Td>
              <Table.Td>
                {contribution.createdAt
                  ? new Date(contribution.createdAt).toLocaleDateString()
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
                      onClick={() => handleEditClick(contribution)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => handleDeleteClick(contribution)}
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
          errorMessage="Failed to load contributions. Please try again or contact support."
          emptyMessage="No contributions found"
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
        title="Add Contribution"
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
              Create Contribution
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedContribution(null);
        }}
        title="Edit Contribution"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Code
            </Text>
            <Text>{selectedContribution?.code}</Text>
          </div>

          <TextInput
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.currentTarget.value)}
            required
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedContribution(null);
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
        title="Delete Contribution"
        message={`Are you sure you want to delete "${selectedContribution?.description}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={() => deleteContribution({ id: selectedContribution?.code ?? "" })}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedContribution(null);
        }}
      />
    </div>
  );
}

export default Page;