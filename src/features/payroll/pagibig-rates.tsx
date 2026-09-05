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
  useCreatePagibigRate,
  useGetAllPagibigRates,
  useUpdatePagibigRate,
} from "@/api/generated/endpoints/payroll-configuration-pag-ibig/payroll-configuration-pag-ibig";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import type { PagibigRate } from "@/types";
import { notifications } from "@mantine/notifications";

type NumberOrEmpty = number | "";

interface RateForm {
  employeeRate: NumberOrEmpty;
  employerRate: NumberOrEmpty;
  lowIncomeThreshold: NumberOrEmpty;
  lowIncomeEmployeeRate: NumberOrEmpty;
  maxSalaryCap: NumberOrEmpty;
  effectiveDate: string | null;
}

const emptyForm = (): RateForm => ({
  employeeRate: "",
  employerRate: "",
  lowIncomeThreshold: "",
  lowIncomeEmployeeRate: "",
  maxSalaryCap: "",
  effectiveDate: null,
});

const fromDto = (rate: PagibigRate): RateForm => ({
  employeeRate: rate.employeeRate,
  employerRate: rate.employerRate,
  lowIncomeThreshold: rate.lowIncomeThreshold ?? "",
  lowIncomeEmployeeRate: rate.lowIncomeEmployeeRate ?? "",
  maxSalaryCap: rate.maxSalaryCap ?? "",
  effectiveDate: rate.effectiveDate,
});

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<PagibigRate | null>(null);

  const [createForm, setCreateForm] = useState<RateForm>(emptyForm);
  const [editForm, setEditForm] = useState<RateForm>(emptyForm);

  const { data, isLoading, isFetching, isError } = useGetAllPagibigRates(
    { pageNo: page, limit: pageSize },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const pageData = unwrapPage<PagibigRate>(data);
  const rates = pageData.content;
  const meta = pageData.meta;

  const { mutate: createRate, isPending: isCreating } = useCreatePagibigRate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/pagibig-rates"] });
        setCreateModalOpen(false);
        setCreateForm(emptyForm());
        notifications.show({
          title: "Success",
          color: "green",
          message: "Pag-IBIG rate created successfully",
          withBorder: true,
        });
      },
    },
  });

  const { mutate: updateRate, isPending: isUpdating } = useUpdatePagibigRate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/pagibig-rates"] });
        setEditModalOpen(false);
        setSelectedRate(null);
        notifications.show({
          title: "Success",
          color: "green",
          message: "Pag-IBIG rate updated successfully",
          withBorder: true,
        });
      },
    },
  });

  const handleCreateClick = () => {
    setCreateForm(emptyForm());
    setCreateModalOpen(true);
  };

  const handleCreateSave = () => {
    const form = createForm;
    if (
      form.employeeRate === "" ||
      form.employerRate === "" ||
      form.maxSalaryCap === "" ||
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
        employeeRate: Number(form.employeeRate),
        employerRate: Number(form.employerRate),
        maxSalaryCap: Number(form.maxSalaryCap),
        lowIncomeThreshold:
          form.lowIncomeThreshold === "" ? undefined : Number(form.lowIncomeThreshold),
        lowIncomeEmployeeRate:
          form.lowIncomeEmployeeRate === ""
            ? undefined
            : Number(form.lowIncomeEmployeeRate),
        effectiveDate: form.effectiveDate,
      },
    });
  };

  const handleEditClick = (rate: PagibigRate) => {
    setSelectedRate(rate);
    setEditForm(fromDto(rate));
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    const form = editForm;
    if (
      form.employeeRate === "" ||
      form.employerRate === "" ||
      form.maxSalaryCap === "" ||
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
        employeeRate: Number(form.employeeRate),
        employerRate: Number(form.employerRate),
        maxSalaryCap: Number(form.maxSalaryCap),
        lowIncomeThreshold:
          form.lowIncomeThreshold === "" ? undefined : Number(form.lowIncomeThreshold),
        lowIncomeEmployeeRate:
          form.lowIncomeEmployeeRate === ""
            ? undefined
            : Number(form.lowIncomeEmployeeRate),
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
          label="Employee Rate"
          placeholder="0.02"
          description="Decimal between 0 and 1"
          value={form.employeeRate}
          onChange={(val) => setField("employeeRate", val === "" ? "" : Number(val))}
          min={0.0001}
          max={1}
          step={0.001}
          decimalScale={4}
          required
        />
        <NumberInput
          label="Employer Rate"
          placeholder="0.02"
          description="Decimal between 0 and 1"
          value={form.employerRate}
          onChange={(val) => setField("employerRate", val === "" ? "" : Number(val))}
          min={0.0001}
          max={1}
          step={0.001}
          decimalScale={4}
          required
        />
        <NumberInput
          label="Low Income Threshold"
          placeholder="0.00"
          description="Optional"
          value={form.lowIncomeThreshold}
          onChange={(val) =>
            setField("lowIncomeThreshold", val === "" ? "" : Number(val))
          }
          min={0.01}
          decimalScale={2}
          prefix="₱"
        />
        <NumberInput
          label="Low Income Employee Rate"
          placeholder="0.01"
          description="Optional, decimal between 0 and 1"
          value={form.lowIncomeEmployeeRate}
          onChange={(val) =>
            setField("lowIncomeEmployeeRate", val === "" ? "" : Number(val))
          }
          min={0.0001}
          max={1}
          step={0.001}
          decimalScale={4}
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

  const formatMoney = (value: number | undefined | null) =>
    value != null ? `₱${value.toFixed(2)}` : "—";

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Payroll</Text>
        <Anchor size="sm">Pag-IBIG</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            Pag-IBIG Rates
          </Text>
          <Text size="sm" c="dimmed">
            Manage Pag-IBIG rate configurations
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
          Add Pag-IBIG Rate
        </Button>
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={[
            "Effective Date",
            "Employee Rate",
            "Employer Rate",
            "Low Income Threshold",
            "Max Salary Cap",
            "Actions",
          ]}
          rows={rates.map((rate: PagibigRate) => (
            <Table.Tr key={rate.id}>
              <Table.Td>{rate.effectiveDate}</Table.Td>
              <Table.Td>{(rate.employeeRate * 100).toFixed(2)}%</Table.Td>
              <Table.Td>{(rate.employerRate * 100).toFixed(2)}%</Table.Td>
              <Table.Td>
                {rate.lowIncomeThreshold != null
                  ? formatMoney(rate.lowIncomeThreshold)
                  : "—"}
              </Table.Td>
              <Table.Td>{formatMoney(rate.maxSalaryCap)}</Table.Td>
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
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPage(0);
            setPageSize(size);
          }}
          onPageChange={(p) => setPage(p - 1)}
          isFetching={isFetching}
          isError={isError}
          errorMessage="Failed to load Pag-IBIG rates. Please try again or contact support."
          emptyMessage="No Pag-IBIG rates found"
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
        title="Add Pag-IBIG Rate"
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
            Create Pag-IBIG Rate
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
        title="Edit Pag-IBIG Rate"
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