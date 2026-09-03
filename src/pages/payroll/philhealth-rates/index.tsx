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
  useCreatePhilhealthRate,
  useGetAllPhilhealthRates,
  useUpdatePhilhealthRate,
} from "@/api/generated/endpoints/payroll-configuration-philhealth/payroll-configuration-philhealth";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import type { PhilhealthRate } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

type NumberOrEmpty = number | "";

interface RateForm {
  premiumRate: NumberOrEmpty;
  maxSalaryCap: NumberOrEmpty;
  minSalaryFloor: NumberOrEmpty;
  fixedContribution: NumberOrEmpty;
  effectiveDate: string | null;
}

const emptyForm = (): RateForm => ({
  premiumRate: "",
  maxSalaryCap: "",
  minSalaryFloor: "",
  fixedContribution: "",
  effectiveDate: null,
});

const fromDto = (rate: PhilhealthRate): RateForm => ({
  premiumRate: rate.premiumRate,
  maxSalaryCap: rate.maxSalaryCap,
  minSalaryFloor: rate.minSalaryFloor,
  fixedContribution: rate.fixedContribution,
  effectiveDate: rate.effectiveDate,
});

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<PhilhealthRate | null>(null);

  const [createForm, setCreateForm] = useState<RateForm>(emptyForm);
  const [editForm, setEditForm] = useState<RateForm>(emptyForm);

  const { data, isLoading, isFetching, isError } = useGetAllPhilhealthRates(
    { pageNo: page, limit: 20 },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const pageData = unwrapPage<PhilhealthRate>(data);
  const rates = pageData.content;
  const meta = pageData.meta;

  const { mutate: createRate, isPending: isCreating } = useCreatePhilhealthRate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/philhealth-rates"] });
        setCreateModalOpen(false);
        setCreateForm(emptyForm());
        notifications.show({
          title: "Success",
          color: "green",
          message: "PhilHealth rate created successfully",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: updateRate, isPending: isUpdating } = useUpdatePhilhealthRate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/philhealth-rates"] });
        setEditModalOpen(false);
        setSelectedRate(null);
        notifications.show({
          title: "Success",
          color: "green",
          message: "PhilHealth rate updated successfully",
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
      form.premiumRate === "" ||
      form.maxSalaryCap === "" ||
      form.minSalaryFloor === "" ||
      form.fixedContribution === "" ||
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

    createRate({
      data: {
        premiumRate: Number(form.premiumRate),
        maxSalaryCap: Number(form.maxSalaryCap),
        minSalaryFloor: Number(form.minSalaryFloor),
        fixedContribution: Number(form.fixedContribution),
        effectiveDate: form.effectiveDate,
      },
    });
  };

  const handleEditClick = (rate: PhilhealthRate) => {
    setSelectedRate(rate);
    setEditForm(fromDto(rate));
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    const form = editForm;
    if (
      form.premiumRate === "" ||
      form.maxSalaryCap === "" ||
      form.minSalaryFloor === "" ||
      form.fixedContribution === "" ||
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

    updateRate({
      id: selectedRate?.id ?? "",
      data: {
        premiumRate: Number(form.premiumRate),
        maxSalaryCap: Number(form.maxSalaryCap),
        minSalaryFloor: Number(form.minSalaryFloor),
        fixedContribution: Number(form.fixedContribution),
        effectiveDate: form.effectiveDate,
      },
    });
  };

  const renderForm = (form: RateForm, setForm: (next: RateForm) => void) => {
    const setField = (
      field: keyof Omit<RateForm, "effectiveDate">,
      value: NumberOrEmpty,
    ) => setForm({ ...form, [field]: value });

    return (
      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          label="Premium Rate"
          placeholder="0.05"
          description="Decimal between 0 and 1"
          value={form.premiumRate}
          onChange={(val) => setField("premiumRate", val === "" ? "" : Number(val))}
          min={0.0001}
          max={1}
          step={0.01}
          decimalScale={4}
          required
        />
        <NumberInput
          label="Max Salary Cap"
          placeholder="0.00"
          value={form.maxSalaryCap}
          onChange={(val) => setField("maxSalaryCap", val === "" ? "" : Number(val))}
          min={0.01}
          decimalScale={2}
          prefix="₱"
          required
        />
        <NumberInput
          label="Min Salary Floor"
          placeholder="0.00"
          value={form.minSalaryFloor}
          onChange={(val) => setField("minSalaryFloor", val === "" ? "" : Number(val))}
          min={0.01}
          decimalScale={2}
          prefix="₱"
          required
        />
        <NumberInput
          label="Fixed Contribution"
          placeholder="0.00"
          value={form.fixedContribution}
          onChange={(val) =>
            setField("fixedContribution", val === "" ? "" : Number(val))
          }
          min={0.01}
          decimalScale={2}
          prefix="₱"
          required
        />
        <DateInput
          label="Effective Date"
          placeholder="Pick date"
          value={form.effectiveDate}
          valueFormat="YYYY-MM-DD"
          onChange={(date) => setForm({ ...form, effectiveDate: date })}
          highlightToday
          required
        />
      </div>
    );
  };

  const formatMoney = (value: number) => `₱${value.toFixed(2)}`;

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Payroll</Text>
        <Anchor size="sm">PhilHealth</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            PhilHealth Rates
          </Text>
          <Text size="sm" c="dimmed">
            Manage PhilHealth rate configurations
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
          Add PhilHealth Rate
        </Button>
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={[
            "Effective Date",
            "Premium Rate",
            "Salary Floor",
            "Salary Cap",
            "Fixed Contribution",
            "Actions",
          ]}
          rows={rates.map((rate: PhilhealthRate) => (
            <Table.Tr key={rate.id}>
              <Table.Td>{rate.effectiveDate}</Table.Td>
              <Table.Td>{(rate.premiumRate * 100).toFixed(2)}%</Table.Td>
              <Table.Td>{formatMoney(rate.minSalaryFloor)}</Table.Td>
              <Table.Td>{formatMoney(rate.maxSalaryCap)}</Table.Td>
              <Table.Td>{formatMoney(rate.fixedContribution)}</Table.Td>
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
                      onClick={() => handleEditClick(rate)}
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
          errorMessage="Failed to load PhilHealth rates. Please try again or contact support."
          emptyMessage="No PhilHealth rates found"
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
        title="Add PhilHealth Rate"
        size="md"
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
            Create PhilHealth Rate
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRate(null);
        }}
        title="Edit PhilHealth Rate"
        size="md"
      >
        {renderForm(editForm, setEditForm)}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setEditModalOpen(false);
              setSelectedRate(null);
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