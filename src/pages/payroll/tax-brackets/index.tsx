import { useState } from "react";
import {
  Anchor,
  Breadcrumbs,
  Button,
  Text,
  ActionIcon,
  Menu,
  Modal,
  NumberInput,
  Table,
  Loader,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { IconPlus, IconDotsVertical, IconPencil } from "@tabler/icons-react";
import {
  useCreateIncomeTaxBracket,
  useGetAllIncomeTaxBrackets,
  useUpdateIncomeTaxBracket,
} from "@/api/generated/endpoints/payroll-configuration-income-tax/payroll-configuration-income-tax";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import type { TaxBracket } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

type NumberOrEmpty = number | "";

const emptyForm = () => ({
  minIncome: "" as NumberOrEmpty,
  maxIncome: "" as NumberOrEmpty,
  baseTax: "" as NumberOrEmpty,
  marginalRate: "" as NumberOrEmpty,
  threshold: "" as NumberOrEmpty,
  effectiveDate: null as string | null,
});

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBracket, setSelectedBracket] = useState<TaxBracket | null>(null);

  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const { data, isLoading, isFetching, isError } = useGetAllIncomeTaxBrackets(
    { pageNo: page, limit: 20 },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const pageData = unwrapPage<TaxBracket>(data);
  const brackets = pageData.content;
  const meta = pageData.meta;

  const { mutate: createBracket, isPending: isCreating } =
    useCreateIncomeTaxBracket({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/tax-brackets"] });
          setCreateModalOpen(false);
          setCreateForm(emptyForm());
          notifications.show({
            title: "Success",
            color: "green",
            message: "Tax bracket created successfully",
            withBorder: true,
          });
        },
        onError: handleApiError,
      },
    });

  const { mutate: updateBracket, isPending: isUpdating } =
    useUpdateIncomeTaxBracket({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/tax-brackets"] });
          setEditModalOpen(false);
          setSelectedBracket(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Tax bracket updated successfully",
            withBorder: true,
          });
        },
        onError: handleApiError,
      },
    });

  const handleCreateClick = () => {
    setCreateForm(emptyForm());
    setCreateModalOpen(true);
  };

  const handleCreateSave = () => {
    const form = createForm;
    if (
      form.minIncome === "" ||
      form.baseTax === "" ||
      form.marginalRate === "" ||
      form.threshold === "" ||
      !form.effectiveDate
    ) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please fill in all required fields",
        withBorder: true,
      });
      return;
    }

    createBracket({
      data: {
        minIncome: Number(form.minIncome),
        maxIncome: form.maxIncome === "" ? undefined : Number(form.maxIncome),
        baseTax: Number(form.baseTax),
        marginalRate: Number(form.marginalRate),
        threshold: Number(form.threshold),
        effectiveDate: form.effectiveDate,
      },
    });
  };

  const handleEditClick = (bracket: TaxBracket) => {
    setSelectedBracket(bracket);
    setEditForm({
      minIncome: bracket.minIncome,
      maxIncome: bracket.maxIncome,
      baseTax: bracket.baseTax,
      marginalRate: bracket.marginalRate,
      threshold: bracket.threshold,
      effectiveDate: bracket.effectiveDate,
    });
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    const form = editForm;
    if (
      form.minIncome === "" ||
      form.baseTax === "" ||
      form.marginalRate === "" ||
      form.threshold === "" ||
      !form.effectiveDate
    ) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please fill in all required fields",
        withBorder: true,
      });
      return;
    }

    updateBracket({
      id: selectedBracket?.id ?? "",
      data: {
        minIncome: Number(form.minIncome),
        maxIncome: form.maxIncome === "" ? undefined : Number(form.maxIncome),
        baseTax: Number(form.baseTax),
        marginalRate: Number(form.marginalRate),
        threshold: Number(form.threshold),
        effectiveDate: form.effectiveDate,
      },
    });
  };

  const formatPercent = (rate: number) => `${(rate * 100).toFixed(2)}%`;
  const formatMoney = (value: number) => `₱${value.toFixed(2)}`;

  const renderForm = (
    form: typeof createForm,
    setForm: (next: typeof createForm) => void,
  ) => {
    const setField = (field: keyof typeof createForm, value: NumberOrEmpty | string | null) => {
      setForm({ ...form, [field]: value });
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Min Income"
            placeholder="0.00"
            value={form.minIncome}
            onChange={(val) => setField("minIncome", val === "" ? "" : Number(val))}
            min={0}
            decimalScale={2}
            prefix="₱"
            required
          />
          <NumberInput
            label="Max Income (optional)"
            placeholder="0.00"
            value={form.maxIncome}
            onChange={(val) => setField("maxIncome", val === "" ? "" : Number(val))}
            min={0}
            decimalScale={2}
            prefix="₱"
          />
          <NumberInput
            label="Base Tax"
            placeholder="0.00"
            value={form.baseTax}
            onChange={(val) => setField("baseTax", val === "" ? "" : Number(val))}
            min={0}
            decimalScale={2}
            prefix="₱"
            required
          />
          <NumberInput
            label="Marginal Rate"
            placeholder="0.20"
            description="Decimal between 0 and 1"
            value={form.marginalRate}
            onChange={(val) => setField("marginalRate", val === "" ? "" : Number(val))}
            min={0}
            max={1}
            step={0.01}
            decimalScale={4}
            required
          />
          <NumberInput
            label="Threshold"
            placeholder="0.00"
            value={form.threshold}
            onChange={(val) => setField("threshold", val === "" ? "" : Number(val))}
            min={0}
            decimalScale={2}
            prefix="₱"
            required
          />
          <DateInput
            label="Effective Date"
            placeholder="Pick date"
            value={form.effectiveDate}
            valueFormat="YYYY-MM-DD"
            onChange={(date) => setField("effectiveDate", date)}
            highlightToday
            required
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Payroll</Text>
        <Anchor size="sm">Income Tax</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            Income Tax Brackets
          </Text>
          <Text size="sm" c="dimmed">
            Manage income tax bracket configurations
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
          Add Tax Bracket
        </Button>
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={[
            "Income Range",
            "Base Tax",
            "Marginal Rate",
            "Threshold",
            "Effective Date",
            "Actions",
          ]}
          rows={brackets.map((bracket: TaxBracket) => (
            <Table.Tr key={bracket.id}>
              <Table.Td>
                {formatMoney(bracket.minIncome)} -{" "}
                {bracket.maxIncome != null
                  ? formatMoney(bracket.maxIncome)
                  : "∞"}
              </Table.Td>
              <Table.Td>{formatMoney(bracket.baseTax)}</Table.Td>
              <Table.Td>{formatPercent(bracket.marginalRate)}</Table.Td>
              <Table.Td>{formatMoney(bracket.threshold)}</Table.Td>
              <Table.Td>{bracket.effectiveDate}</Table.Td>
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
                      onClick={() => handleEditClick(bracket)}
                    >
                      Edit
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
          errorMessage="Failed to load tax brackets. Please try again or contact support."
          emptyMessage="No tax brackets found"
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
          setCreateForm(emptyForm());
        }}
        title="Add Tax Bracket"
        size="lg"
      >
        {renderForm(createForm, setCreateForm)}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setCreateModalOpen(false);
              setCreateForm(emptyForm());
            }}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateSave} loading={isCreating}>
            Create Tax Bracket
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBracket(null);
        }}
        title="Edit Tax Bracket"
        size="lg"
      >
        {renderForm(editForm, setEditForm)}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setEditModalOpen(false);
              setSelectedBracket(null);
            }}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button onClick={handleEditSave} loading={isUpdating}>
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Page;