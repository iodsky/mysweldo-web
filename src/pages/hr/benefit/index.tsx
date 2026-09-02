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
  Switch,
  Badge,
  Table,
  Loader,
} from "@mantine/core";
import {
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { IconPlus, IconDotsVertical, IconTrash, IconPencil } from "@tabler/icons-react";
import {
  useCreateBenefit,
  useDeleteBenefit,
  useGetAllBenefits,
  useUpdateBenefit,
} from "@/api/generated/endpoints/benefits/benefits";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type { Benefit } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);

  const [createCode, setCreateCode] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createTaxable, setCreateTaxable] = useState(false);
  const [createNonTaxableLimit, setCreateNonTaxableLimit] = useState<
    number | ""
  >("");
  const [editDescription, setEditDescription] = useState("");

  const { data, isLoading, isFetching, isError } = useGetAllBenefits(
    { pageNo: page, limit: 10 },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const pageData = unwrapPage<Benefit>(data);
  const benefits = pageData.content;
  const meta = pageData.meta;

  const resetCreateForm = () => {
    setCreateCode("");
    setCreateDescription("");
    setCreateTaxable(false);
    setCreateNonTaxableLimit("");
  };

  const { mutate: createBft, isPending: isCreating } = useCreateBenefit({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/benefits"] });
        setCreateModalOpen(false);
        resetCreateForm();
        notifications.show({
          title: "Success",
          color: "green",
          message: "Benefit created successfully",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: updateBft, isPending: isUpdating } = useUpdateBenefit({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/benefits"] });
        setEditModalOpen(false);
        setSelectedBenefit(null);
        notifications.show({
          title: "Success",
          color: "green",
          message: "Benefit updated successfully",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: deleteBft, isPending: isDeleting } = useDeleteBenefit({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/benefits"] });
        setDeleteModalOpen(false);
        setSelectedBenefit(null);
        notifications.show({
          title: "Success",
          color: "green",
          message: "Benefit deleted successfully",
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

  const handleTaxableToggle = (checked: boolean) => {
    setCreateTaxable(checked);
    if (checked) setCreateNonTaxableLimit("");
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

    createBft({
      data: {
        code: createCode.trim(),
        description: createDescription.trim(),
        taxable: createTaxable,
        nonTaxableLimit:
          createTaxable || createNonTaxableLimit === ""
            ? undefined
            : createNonTaxableLimit,
      },
    });
  };

  const handleEditClick = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
    setEditDescription(benefit.description ?? "");
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

    const code = selectedBenefit?.code ?? "";
    updateBft({
      id: code,
      data: {
        code,
        description: editDescription.trim(),
        taxable: selectedBenefit?.taxable,
        nonTaxableLimit: selectedBenefit?.nonTaxablelimit,
      },
    });
  };

  const handleDeleteClick = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
    setDeleteModalOpen(true);
  };

  const formatLimit = (value: number | null | undefined) =>
    value != null ? `₱${value.toFixed(2)}` : "—";

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">HR</Text>
        <Anchor size="sm">Benefit</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            Benefit Management
          </Text>
          <Text size="sm" c="dimmed">
            Manage all benefit types in the system
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
          Add Benefit
        </Button>
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={[
            "Code",
            "Description",
            "Taxable",
            "Non-Taxable Limit",
            "Created",
            "Actions",
          ]}
          rows={benefits.map((benefit: Benefit) => (
            <Table.Tr key={benefit.code}>
              <Table.Td>{benefit.code}</Table.Td>
              <Table.Td>{benefit.description}</Table.Td>
              <Table.Td>
                <Badge color={benefit.taxable ? "orange" : "green"}>
                  {benefit.taxable ? "Taxable" : "Non-Taxable"}
                </Badge>
              </Table.Td>
              <Table.Td>{formatLimit(benefit.nonTaxablelimit ?? null)}</Table.Td>
              <Table.Td>
                {benefit.createdAt ? new Date(benefit.createdAt).toLocaleDateString() : "-"}
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
                      onClick={() => handleEditClick(benefit)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => handleDeleteClick(benefit)}
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
          errorMessage="Failed to load benefits. Please try again or contact support."
          emptyMessage="No benefits found"
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
        title="Add Benefit"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Benefit Code"
            placeholder="e.g. RICE_ALLOWANCE"
            description="Uppercase letters, numbers, and underscores only (max 50 characters)"
            value={createCode}
            onChange={(e) => setCreateCode(e.currentTarget.value.toUpperCase())}
            required
          />

          <TextInput
            label="Description"
            placeholder="e.g. Rice Allowance"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.currentTarget.value)}
            required
          />

          <Switch
            label="Taxable"
            checked={createTaxable}
            onChange={(e) => handleTaxableToggle(e.currentTarget.checked)}
          />

          <NumberInput
            label="Non-Taxable Limit"
            placeholder="e.g. 1000.00"
            description={
              createTaxable ? "Not applicable for taxable benefits" : undefined
            }
            value={createNonTaxableLimit}
            onChange={(val) =>
              setCreateNonTaxableLimit(val === "" ? "" : Number(val))
            }
            disabled={createTaxable}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="₱"
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
              Create Benefit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBenefit(null);
        }}
        title="Edit Benefit"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Text size="xs" c="dimmed">
            Code, taxability, and non-taxable limit cannot be changed after
            creation.
          </Text>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Benefit Code
            </Text>
            <Text>{selectedBenefit?.code}</Text>
          </div>

          <TextInput
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.currentTarget.value)}
            required
          />

          <div>
            <Text size="sm" fw={500} mb="xs">
              Taxable
            </Text>
            <Badge color={selectedBenefit?.taxable ? "orange" : "green"}>
              {selectedBenefit?.taxable ? "Taxable" : "Non-Taxable"}
            </Badge>
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Non-Taxable Limit
            </Text>
            <Text>{formatLimit(selectedBenefit?.nonTaxablelimit ?? null)}</Text>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedBenefit(null);
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
        title="Delete Benefit"
        message={`Are you sure you want to delete "${selectedBenefit?.description}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={() => deleteBft({ id: selectedBenefit?.code ?? "" })}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedBenefit(null);
        }}
      />
    </div>
  );
}

export default Page;
