import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Anchor,
  Breadcrumbs,
  Button,
  Text,
  ActionIcon,
  Menu,
  Modal,
  Select,
  Textarea,
  Badge,
  Table,
  Loader,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { IconPlus, IconDotsVertical, IconEye } from "@tabler/icons-react";
import {
  useCreatePayrollRun,
  useGetAllPayrollRuns,
} from "@/api/generated/endpoints/payroll-runs/payroll-runs";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import type { GetAllPayrollRunsStatus, GetAllPayrollRunsType } from "@/api/generated/model";
import type { PayrollRun, PayrollRunRequest } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

const TYPE_OPTIONS = ["REGULAR", "OFF_CYCLE", "ADJUSTMENT"].map((value) => ({
  value,
  label: value.replace("_", " "),
}));

const STATUS_OPTIONS = ["DRAFT", "APPROVED", "PROCESSED"].map((value) => ({
  value,
  label: value,
}));

const FREQUENCY_OPTIONS = [
  "SEMI_MONTHLY",
  "MONTHLY",
  "WEEKLY",
  "BI_WEEKLY",
].map((value) => ({ value, label: value.replace("_", " ") }));

function Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [startDateFilter, setStartDateFilter] = useState<string | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createStartDate, setCreateStartDate] = useState<string | null>(null);
  const [createEndDate, setCreateEndDate] = useState<string | null>(null);
  const [createType, setCreateType] = useState<string | null>("REGULAR");
  const [createFrequency, setCreateFrequency] = useState<string | null>(
    "SEMI_MONTHLY",
  );
  const [createNotes, setCreateNotes] = useState("");

  const { data, isLoading, isFetching, isError } = useGetAllPayrollRuns(
    {
      pageNo: page,
      limit: pageSize,
      type: (typeFilter as GetAllPayrollRunsType) ?? undefined,
      status: (statusFilter as GetAllPayrollRunsStatus) ?? undefined,
      periodStartDate: startDateFilter ?? undefined,
      periodEndDate: endDateFilter ?? undefined,
    },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const pageData = unwrapPage<PayrollRun>(data);
  const runs = pageData.content;
  const meta = pageData.meta;

  const resetCreateForm = () => {
    setCreateStartDate(null);
    setCreateEndDate(null);
    setCreateType("REGULAR");
    setCreateFrequency("SEMI_MONTHLY");
    setCreateNotes("");
  };

  const { mutate: createRun, isPending: isCreating } = useCreatePayrollRun({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/payroll-runs"] });
        setCreateModalOpen(false);
        resetCreateForm();
        notifications.show({
          title: "Success",
          color: "green",
          message: "Payroll run created successfully",
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
    if (!createStartDate || !createEndDate || !createType || !createFrequency) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please fill in all required fields",
        withBorder: true,
      });
      return;
    }

    const data: PayrollRunRequest = {
      periodStartDate: createStartDate,
      periodEndDate: createEndDate,
      type: createType as PayrollRunRequest["type"],
      payrollFrequency:
        createFrequency as PayrollRunRequest["payrollFrequency"],
      notes: createNotes.trim() || undefined,
    };

    createRun({ data });
  };

  const clearFilters = () => {
    setTypeFilter(null);
    setStatusFilter(null);
    setStartDateFilter(null);
    setEndDateFilter(null);
    setPage(0);
  };

  const formatMoney = (value: number | undefined | null) =>
    value != null ? `₱${value.toFixed(2)}` : "—";

  return (
    <div className="flex flex-col flex-1 gap-5 p-5">
      <Breadcrumbs>
        <Text size="sm">Payroll</Text>
        <Anchor size="sm">Payroll Run</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            Payroll Run
          </Text>
          <Text size="sm" c="dimmed">
            Create and manage payroll runs
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>
          New Payroll Run
        </Button>
      </div>

      <div className="flex items-end gap-2 flex-wrap">
        <Select
          label="Type"
          placeholder="All types"
          data={TYPE_OPTIONS}
          value={typeFilter}
          onChange={(value) => {
            setTypeFilter(value);
            setPage(0);
          }}
          clearable
          w={160}
        />
        <Select
          label="Status"
          placeholder="All statuses"
          data={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(0);
          }}
          clearable
          w={160}
        />
        <DateInput
          label="Period Start"
          placeholder="Pick start date"
          value={startDateFilter}
          valueFormat="YYYY-MM-DD"
          onChange={(date) => {
            setStartDateFilter(date);
            setPage(0);
          }}
          highlightToday
          clearable
        />
        <DateInput
          label="Period End"
          placeholder="Pick end date"
          value={endDateFilter}
          valueFormat="YYYY-MM-DD"
          onChange={(date) => {
            setEndDateFilter(date);
            setPage(0);
          }}
          highlightToday
          clearable
        />
        <Button variant="light" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>

      {!isError && meta && (
        <PaginatedTable
          heading={[
            "Period",
            "Frequency",
            "Type",
            "Status",
            "Gross",
            "Deductions",
            "Net",
            "Actions",
          ]}
          rows={runs.map((run: PayrollRun) => (
            <Table.Tr key={run.id}>
              <Table.Td>
                {run.periodStartDate} → {run.periodEndDate}
              </Table.Td>
              <Table.Td>{run.payrollFrequency.replace("_", " ")}</Table.Td>
              <Table.Td>
                <Badge variant="light">{run.type.replace("_", " ")}</Badge>
              </Table.Td>
              <Table.Td>
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
              </Table.Td>
              <Table.Td>{formatMoney(run.totalGrossPay)}</Table.Td>
              <Table.Td>{formatMoney(run.totalDeductions)}</Table.Td>
              <Table.Td>{formatMoney(run.totalNetPay)}</Table.Td>
              <Table.Td align="center">
                <Menu shadow="md" position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEye size={14} />}
                      onClick={() => navigate(`/payroll/runs/${run.id}`)}
                    >
                      View
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
          errorMessage="Failed to load payroll runs. Please try again or contact support."
          emptyMessage="No payroll runs found"
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
        title="New Payroll Run"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <DateInput
            label="Period Start Date"
            placeholder="Pick start date"
            value={createStartDate}
            valueFormat="YYYY-MM-DD"
            onChange={setCreateStartDate}
            highlightToday
            required
          />

          <DateInput
            label="Period End Date"
            placeholder="Pick end date"
            value={createEndDate}
            valueFormat="YYYY-MM-DD"
            onChange={setCreateEndDate}
            highlightToday
            required
          />

          <Select
            label="Type"
            data={TYPE_OPTIONS}
            value={createType}
            onChange={setCreateType}
            required
          />

          <Select
            label="Payroll Frequency"
            data={FREQUENCY_OPTIONS}
            value={createFrequency}
            onChange={setCreateFrequency}
            required
          />

          <Textarea
            label="Notes"
            placeholder="Optional notes"
            value={createNotes}
            onChange={(e) => setCreateNotes(e.currentTarget.value)}
            autosize
            minRows={2}
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
              Create Payroll Run
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Page;