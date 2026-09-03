import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Anchor,
  Badge,
  Breadcrumbs,
  Button,
  Grid,
  Group,
  Loader,
  Menu,
  ActionIcon,
  Modal,
  NumberInput,
  Text,
  TextInput,
  Table,
} from "@mantine/core";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetPayrollItemsQueryKey,
  getGetPayrollRunByIdQueryKey,
  useDeletePayrollItem,
  useGeneratePayroll,
  useGetPayrollItems,
  useGetPayrollRunById,
  useUpdatePayrollBenefits,
  useUpdatePayrollDeductions,
  useUpdatePayrollRunStatus,
} from "@/api/generated/endpoints/payroll-runs/payroll-runs";
import { unwrapData, unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type { LineItemRequest, PayrollItemDto } from "@/api/generated/model";
import type { PayrollRun } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

interface LineItemRow {
  code: string;
  amount: number | "";
}

interface LineItemsEditorModalProps {
  opened: boolean;
  title: string;
  items: LineItemRow[];
  isLoading: boolean;
  onClose: () => void;
  onChange: (items: LineItemRow[]) => void;
  onSave: () => void;
}

function LineItemsEditorModal({
  opened,
  title,
  items,
  isLoading,
  onClose,
  onChange,
  onSave,
}: LineItemsEditorModalProps) {
  const updateItem = (index: number, field: keyof LineItemRow, value: string | number) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([...items, { code: "", amount: "" }]);
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="md">
      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <Text size="sm" c="dimmed">
            No line items yet. Add one below.
          </Text>
        )}
        {items.map((item, index) => (
          <Group key={index} gap="sm" align="flex-end" wrap="nowrap">
            <TextInput
              label="Code"
              placeholder="e.g. SSS, RICE_ALLOWANCE"
              value={item.code}
              onChange={(e) => updateItem(index, "code", e.currentTarget.value)}
              className="flex-1"
              required
            />
            <NumberInput
              label="Amount"
              placeholder="0.00"
              value={item.amount}
              onChange={(val) =>
                updateItem(index, "amount", val === "" ? "" : Number(val))
              }
              min={0}
              decimalScale={2}
              prefix="₱"
              className="flex-1"
              required
            />
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => removeItem(index)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ))}
        <Button variant="light" onClick={addItem}>
          Add Line Item
        </Button>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onSave} loading={isLoading}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PayrollItemDto | null>(null);
  const [deductionsEditorOpen, setDeductionsEditorOpen] = useState(false);
  const [benefitsEditorOpen, setBenefitsEditorOpen] = useState(false);
  const [deductionRows, setDeductionRows] = useState<LineItemRow[]>([]);
  const [benefitRows, setBenefitRows] = useState<LineItemRow[]>([]);

  const { data: runData, isLoading: runLoading } = useGetPayrollRunById(id ?? "", {
    query: { enabled: !!id },
  });
  const run = unwrapData<PayrollRun>(runData);

  const {
    data: itemsData,
    isLoading: itemsLoading,
    isFetching: itemsFetching,
    isError: itemsError,
  } = useGetPayrollItems(id ?? "", { pageNo: page, limit: pageSize }, {
    query: { enabled: !!id, placeholderData: (prev) => prev },
  });
  const { content: items, meta } = unwrapPage<PayrollItemDto>(itemsData);

  const invalidateRun = () => {
    queryClient.invalidateQueries({ queryKey: getGetPayrollRunByIdQueryKey(id ?? "") });
    queryClient.invalidateQueries({ queryKey: ["/payroll-runs"] });
  };

  const invalidateItems = () => {
    queryClient.invalidateQueries({
      queryKey: getGetPayrollItemsQueryKey(id ?? "", { pageNo: page, limit: pageSize }),
    });
  };

  const { mutate: generate, isPending: isGenerating } = useGeneratePayroll({
    mutation: {
      onSuccess: (data) => {
        const skipped = data.data?.skippedEmployeeIds;
        invalidateRun();
        invalidateItems();
        setGenerateModalOpen(false);
        notifications.show({
          title: "Success",
          color: "green",
          message:
            skipped && skipped.length > 0
              ? `Payroll generated with ${skipped.length} skipped employee(s)`
              : "Payroll generated successfully",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdatePayrollRunStatus({
      mutation: {
        onSuccess: () => {
          invalidateRun();
          notifications.show({
            title: "Success",
            color: "green",
            message: "Payroll run status updated",
            withBorder: true,
          });
        },
        onError: handleApiError,
      },
    });

  const { mutate: updateDeductions, isPending: isSavingDeductions } =
    useUpdatePayrollDeductions({
      mutation: {
        onSuccess: () => {
          invalidateItems();
          setDeductionsEditorOpen(false);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Deductions updated",
            withBorder: true,
          });
        },
        onError: handleApiError,
      },
    });

  const { mutate: updateBenefits, isPending: isSavingBenefits } =
    useUpdatePayrollBenefits({
      mutation: {
        onSuccess: () => {
          invalidateItems();
          setBenefitsEditorOpen(false);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Benefits updated",
            withBorder: true,
          });
        },
        onError: handleApiError,
      },
    });

  const { mutate: deleteItem, isPending: isDeleting } = useDeletePayrollItem({
    mutation: {
      onSuccess: () => {
        invalidateItems();
        setDeleteModalOpen(false);
        setSelectedItem(null);
        notifications.show({
          title: "Success",
          color: "green",
          message: "Payroll item deleted",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const openDeductionsEditor = (item: PayrollItemDto) => {
    setSelectedItem(item);
    setDeductionRows(
      item.deductions.map((d) => ({ code: d.deduction, amount: d.amount })),
    );
    setDeductionsEditorOpen(true);
  };

  const openBenefitsEditor = (item: PayrollItemDto) => {
    setSelectedItem(item);
    setBenefitRows(
      item.benefits.map((b) => ({ code: b.benefit, amount: b.amount })),
    );
    setBenefitsEditorOpen(true);
  };

  const saveDeductions = () => {
    if (!selectedItem) return;
    const deductions: LineItemRequest[] = deductionRows
      .filter((row) => row.code.trim())
      .map((row) => ({
        code: row.code.trim(),
        amount: row.amount === "" ? undefined : Number(row.amount),
      }));
    if (deductions.length === 0) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "At least one deduction is required",
        withBorder: true,
      });
      return;
    }
    updateDeductions({
      id: id ?? "",
      itemId: selectedItem.id,
      data: { deductions },
    });
  };

  const saveBenefits = () => {
    if (!selectedItem) return;
    const benefits: LineItemRequest[] = benefitRows
      .filter((row) => row.code.trim())
      .map((row) => ({
        code: row.code.trim(),
        amount: row.amount === "" ? undefined : Number(row.amount),
      }));
    if (benefits.length === 0) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "At least one benefit is required",
        withBorder: true,
      });
      return;
    }
    updateBenefits({
      id: id ?? "",
      itemId: selectedItem.id,
      data: { benefits },
    });
  };

  const formatMoney = (value: number | undefined | null) =>
    value != null ? `₱${value.toFixed(2)}` : "—";

  if (runLoading) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <Loader size="xl" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Text size="lg" fw={700} c="red">
            Failed to load payroll run
          </Text>
          <Button onClick={() => navigate("/payroll/runs")}>
            Back to Payroll Runs
          </Button>
        </div>
      </div>
    );
  }

  const canGenerate = run.status === "DRAFT";
  const canApprove = run.status === "DRAFT";
  const canProcess = run.status === "APPROVED";

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Payroll</Text>
        <Anchor
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            navigate("/payroll/runs");
          }}
        >
          Payroll Run
        </Anchor>
        <Text size="sm">{run.id}</Text>
      </Breadcrumbs>

      <div className="rounded-md border p-6">
        <div className="flex justify-between mb-4">
          <div>
            <Text size="lg" fw={700}>
              Payroll Run {run.id}
            </Text>
            <div className="flex gap-2.5 mt-2.5">
              <Badge variant="light">{run.type.replace("_", " ")}</Badge>
              <Badge variant="light">{run.payrollFrequency.replace("_", " ")}</Badge>
              <Badge
                color={
                  run.status === "PROCESSED"
                    ? "green"
                    : run.status === "APPROVED"
                      ? "blue"
                      : "gray"
                }
              >
                {run.status}
              </Badge>
            </div>
          </div>
          <Group gap="sm">
            {canGenerate && (
              <Button onClick={() => setGenerateModalOpen(true)} loading={isGenerating}>
                Generate Payroll
              </Button>
            )}
            {canApprove && (
              <Button
                variant="light"
                loading={isUpdatingStatus}
                onClick={() =>
                  updateStatus({
                    id: id ?? "",
                    params: { status: "APPROVED" },
                  })
                }
              >
                Approve
              </Button>
            )}
            {canProcess && (
              <Button
                variant="light"
                color="green"
                loading={isUpdatingStatus}
                onClick={() =>
                  updateStatus({
                    id: id ?? "",
                    params: { status: "PROCESSED" },
                  })
                }
              >
                Mark Processed
              </Button>
            )}
          </Group>
        </div>

        <hr className="my-4" />

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="xs" c="dimmed">
              Period
            </Text>
            <Text>
              {run.periodStartDate} → {run.periodEndDate}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="xs" c="dimmed">
              Notes
            </Text>
            <Text>{run.notes ?? "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="xs" c="dimmed">
              Total Gross Pay
            </Text>
            <Text>{formatMoney(run.totalGrossPay)}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="xs" c="dimmed">
              Total Benefits
            </Text>
            <Text>{formatMoney(run.totalBenefits)}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="xs" c="dimmed">
              Total Deductions
            </Text>
            <Text>{formatMoney(run.totalDeductions)}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="xs" c="dimmed">
              Total Net Pay
            </Text>
            <Text fw={700}>{formatMoney(run.totalNetPay)}</Text>
          </Grid.Col>
        </Grid>
      </div>

      <div>
        <Text size="lg" fw={700} mb="xs">
          Payroll Items
        </Text>
        {meta && (
          <PaginatedTable
            heading={[
              "Employee",
              "Designation",
              "Gross Pay",
              "Deductions",
              "Net Pay",
              "Actions",
            ]}
            rows={items.map((item: PayrollItemDto) => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.employeeName}</Table.Td>
                <Table.Td>{item.designation}</Table.Td>
                <Table.Td>{formatMoney(item.grossPay)}</Table.Td>
                <Table.Td>{formatMoney(item.totalDeductions)}</Table.Td>
                <Table.Td>{formatMoney(item.netPay)}</Table.Td>
                <Table.Td align="center">
                  <Menu shadow="md" position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" size="sm">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item onClick={() => openDeductionsEditor(item)}>
                        Edit Deductions
                      </Menu.Item>
                      <Menu.Item onClick={() => openBenefitsEditor(item)}>
                        Edit Benefits
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => {
                          setSelectedItem(item);
                          setDeleteModalOpen(true);
                        }}
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
            isFetching={itemsFetching}
            isError={itemsError}
            errorMessage="Failed to load payroll items."
            emptyMessage={
              run.status === "DRAFT"
                ? "No payroll items yet. Generate payroll to create items."
                : "No payroll items found"
            }
          />
        )}
        {itemsLoading && (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        )}
      </div>

      {/* Generate Payroll Modal */}
      <ConfirmationModal
        opened={generateModalOpen}
        title="Generate Payroll"
        message="Generate payroll items for all active employees in this period? Existing items will not be duplicated for employees already generated."
        confirmText="Generate"
        isLoading={isGenerating}
        onConfirm={() =>
          generate({ id: id ?? "", data: { employeeIds: [] } })
        }
        onCancel={() => setGenerateModalOpen(false)}
      />

      {/* Delete Item Confirmation */}
      <ConfirmationModal
        opened={deleteModalOpen}
        title="Delete Payroll Item"
        message={`Are you sure you want to delete the payroll item for "${selectedItem?.employeeName}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={() =>
          deleteItem({ id: id ?? "", itemId: selectedItem?.id ?? "" })
        }
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedItem(null);
        }}
      />

      {/* Deductions Editor */}
      <LineItemsEditorModal
        opened={deductionsEditorOpen}
        title={`Edit Deductions - ${selectedItem?.employeeName ?? ""}`}
        items={deductionRows}
        isLoading={isSavingDeductions}
        onClose={() => setDeductionsEditorOpen(false)}
        onChange={setDeductionRows}
        onSave={saveDeductions}
      />

      {/* Benefits Editor */}
      <LineItemsEditorModal
        opened={benefitsEditorOpen}
        title={`Edit Benefits - ${selectedItem?.employeeName ?? ""}`}
        items={benefitRows}
        isLoading={isSavingBenefits}
        onClose={() => setBenefitsEditorOpen(false)}
        onChange={setBenefitRows}
        onSave={saveBenefits}
      />
    </div>
  );
}

export default Page;