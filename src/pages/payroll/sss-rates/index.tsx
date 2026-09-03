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
  Group,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { IconPlus, IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import {
  useCreateSssRate,
  useGetAllSssRates,
  useUpdateSssRate,
} from "@/api/generated/endpoints/payroll-configuration-sss/payroll-configuration-sss";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import type { SalaryBracket, SalaryBracketRequest, SssRate } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

type NumberOrEmpty = number | "";

interface BracketRow {
  minSalary: NumberOrEmpty;
  maxSalary: NumberOrEmpty;
  msc: NumberOrEmpty;
}

interface SssForm {
  totalSss: NumberOrEmpty;
  employeeRate: NumberOrEmpty;
  employerRate: NumberOrEmpty;
  effectiveDate: string | null;
  brackets: BracketRow[];
}

const emptyForm = (): SssForm => ({
  totalSss: "",
  employeeRate: "",
  employerRate: "",
  effectiveDate: null,
  brackets: [{ minSalary: "", maxSalary: "", msc: "" }],
});

const toRequestBrackets = (rows: BracketRow[]): SalaryBracketRequest[] =>
  rows
    .filter((row) => row.minSalary !== "" && row.msc !== "")
    .map((row) => ({
      minSalary: Number(row.minSalary),
      maxSalary: row.maxSalary === "" ? undefined : Number(row.maxSalary),
      msc: Number(row.msc),
    }));

const fromDtoBrackets = (brackets: SalaryBracket[]): BracketRow[] =>
  brackets.map((b) => ({
    minSalary: b.minSalary,
    maxSalary: b.maxSalary,
    msc: b.msc,
  }));

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<SssRate | null>(null);

  const [createForm, setCreateForm] = useState<SssForm>(emptyForm);
  const [editForm, setEditForm] = useState<SssForm>(emptyForm);

  const { data, isLoading, isFetching, isError } = useGetAllSssRates(
    { pageNo: page, limit: pageSize },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const pageData = unwrapPage<SssRate>(data);
  const rates = pageData.content;
  const meta = pageData.meta;

  const { mutate: createRate, isPending: isCreating } = useCreateSssRate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/sss-rates"] });
        setCreateModalOpen(false);
        setCreateForm(emptyForm());
        notifications.show({
          title: "Success",
          color: "green",
          message: "SSS rate created successfully",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: updateRate, isPending: isUpdating } = useUpdateSssRate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/sss-rates"] });
        setEditModalOpen(false);
        setSelectedRate(null);
        notifications.show({
          title: "Success",
          color: "green",
          message: "SSS rate updated successfully",
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
      form.totalSss === "" ||
      form.employeeRate === "" ||
      form.employerRate === "" ||
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
    const brackets = toRequestBrackets(form.brackets);
    if (brackets.length === 0) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please add at least one salary bracket",
        withBorder: true,
      });
      return;
    }

    createRate({
      data: {
        totalSss: Number(form.totalSss),
        employeeRate: Number(form.employeeRate),
        employerRate: Number(form.employerRate),
        salaryBrackets: brackets,
        effectiveDate: form.effectiveDate,
      },
    });
  };

  const handleEditClick = (rate: SssRate) => {
    setSelectedRate(rate);
    setEditForm({
      totalSss: rate.totalSss,
      employeeRate: rate.employeeSss,
      employerRate: rate.employerSss,
      effectiveDate: rate.effectiveDate,
      brackets: fromDtoBrackets(rate.salaryBrackets),
    });
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    const form = editForm;
    if (
      form.totalSss === "" ||
      form.employeeRate === "" ||
      form.employerRate === "" ||
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
    const brackets = toRequestBrackets(form.brackets);
    if (brackets.length === 0) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please add at least one salary bracket",
        withBorder: true,
      });
      return;
    }

    updateRate({
      id: selectedRate?.id ?? "",
      data: {
        totalSss: Number(form.totalSss),
        employeeRate: Number(form.employeeRate),
        employerRate: Number(form.employerRate),
        salaryBrackets: brackets,
        effectiveDate: form.effectiveDate,
      },
    });
  };

  const renderForm = (form: SssForm, setForm: (next: SssForm) => void) => {
    const setField = (
      field: keyof Omit<SssForm, "brackets">,
      value: NumberOrEmpty | string | null,
    ) => setForm({ ...form, [field]: value });

    const updateBracket = (
      index: number,
      field: keyof BracketRow,
      value: NumberOrEmpty,
    ) => {
      const next = form.brackets.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      );
      setForm({ ...form, brackets: next });
    };

    const removeBracket = (index: number) =>
      setForm({ ...form, brackets: form.brackets.filter((_, i) => i !== index) });

    const addBracket = () =>
      setForm({
        ...form,
        brackets: [...form.brackets, { minSalary: "", maxSalary: "", msc: "" }],
      });

    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Total SSS"
            placeholder="0.00"
            value={form.totalSss}
            onChange={(val) => setField("totalSss", val === "" ? "" : Number(val))}
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
            onChange={(date) => setField("effectiveDate", date)}
            highlightToday
            required
          />
          <NumberInput
            label="Employee Rate"
            placeholder="0.04"
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
            placeholder="0.08"
            description="Decimal between 0 and 1"
            value={form.employerRate}
            onChange={(val) => setField("employerRate", val === "" ? "" : Number(val))}
            min={0.0001}
            max={1}
            step={0.001}
            decimalScale={4}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Text size="sm" fw={500}>
            Salary Brackets
          </Text>
          {form.brackets.map((row, index) => (
            <Group key={index} gap="sm" align="flex-end" wrap="nowrap">
              <NumberInput
                label="Min Salary"
                placeholder="0.00"
                value={row.minSalary}
                onChange={(val) =>
                  updateBracket(index, "minSalary", val === "" ? "" : Number(val))
                }
                min={0}
                decimalScale={2}
                className="flex-1"
                required
              />
              <NumberInput
                label="Max Salary"
                placeholder="0.00"
                value={row.maxSalary}
                onChange={(val) =>
                  updateBracket(index, "maxSalary", val === "" ? "" : Number(val))
                }
                min={0}
                decimalScale={2}
                className="flex-1"
              />
              <NumberInput
                label="MSC"
                placeholder="0.00"
                value={row.msc}
                onChange={(val) =>
                  updateBracket(index, "msc", val === "" ? "" : Number(val))
                }
                min={0.01}
                decimalScale={2}
                className="flex-1"
                required
              />
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => removeBracket(index)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          <Button variant="light" onClick={addBracket}>
            Add Salary Bracket
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Payroll</Text>
        <Anchor size="sm">SSS Rates</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            SSS Rates
          </Text>
          <Text size="sm" c="dimmed">
            Manage SSS rate configurations
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
          Add SSS Rate
        </Button>
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={[
            "Effective Date",
            "Total SSS",
            "Employee Rate",
            "Employer Rate",
            "Brackets",
            "Actions",
          ]}
          rows={rates.map((rate: SssRate) => (
            <Table.Tr key={rate.id}>
              <Table.Td>{rate.effectiveDate}</Table.Td>
              <Table.Td>₱{rate.totalSss.toFixed(2)}</Table.Td>
              <Table.Td>{(rate.employeeSss * 100).toFixed(2)}%</Table.Td>
              <Table.Td>{(rate.employerSss * 100).toFixed(2)}%</Table.Td>
              <Table.Td>{rate.salaryBrackets.length}</Table.Td>
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
          errorMessage="Failed to load SSS rates. Please try again or contact support."
          emptyMessage="No SSS rates found"
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
        title="Add SSS Rate"
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
            Create SSS Rate
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
        title="Edit SSS Rate"
        size="lg"
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