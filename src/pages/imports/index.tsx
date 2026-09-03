import { useMemo, useState } from "react";
import {
  Button,
  Text,
  Badge,
  ActionIcon,
  Select,
  Breadcrumbs,
  Anchor,
  Table,
} from "@mantine/core";
import { keepPreviousData } from "@tanstack/react-query";
import { IconEye, IconPlus } from "@tabler/icons-react";
import { useGetAllImportJobs } from "@/api/generated/endpoints/csv-imports/csv-imports";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { useAuth } from "@/hooks/use-auth";
import ImportModal, { type ImportTypeValue } from "./import-modal";
import DetailsModal from "./details-modal";
import type {
  GetAllImportJobsStatus,
  ImportJobSummaryDto,
  PageDtoImportJobSummaryDto,
} from "@/api/generated/model";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "gray",
  RUNNING: "blue",
  COMPLETED: "green",
  FAILED: "red",
};

const TYPE_LABELS: Record<string, string> = {
  EMPLOYEE: "Employees",
  USER: "Users",
};

const STATUS_OPTIONS: { value: GetAllImportJobsStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "RUNNING", label: "Running" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

const formatDate = (value: string) =>
  value ? new Date(value).toLocaleString() : "-";

function Page() {
  const { user } = useAuth();
  const role = user?.role ?? "";

  const canView = ["HR", "IT", "PAYROLL", "SUPERUSER"].includes(role);
  const canLaunchEmployees = ["HR", "IT", "SUPERUSER"].includes(role);
  const canLaunchUsers = ["IT", "SUPERUSER"].includes(role);

  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState<ImportTypeValue | null>(null);
  const [statusFilter, setStatusFilter] = useState<GetAllImportJobsStatus | null>(
    null,
  );
  const [importOpened, setImportOpened] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const allowedTypes = useMemo<ImportTypeValue[]>(() => {
    const types: ImportTypeValue[] = [];
    if (canLaunchEmployees) types.push("EMPLOYEE");
    if (canLaunchUsers) types.push("USER");
    return types;
  }, [canLaunchEmployees, canLaunchUsers]);

  const { data, isLoading, isFetching, isError } = useGetAllImportJobs(
    {
      pageNo: page,
      limit: 10,
      type: typeFilter ?? undefined,
      status: statusFilter ?? undefined,
    },
    {
      query: {
        placeholderData: keepPreviousData,
        refetchInterval: (query) => {
          const content = (query.state.data as
            | { data?: PageDtoImportJobSummaryDto }
            | undefined)?.data?.content;
          const hasActive =
            content?.some(
              (row) => row.status === "PENDING" || row.status === "RUNNING",
            ) ?? false;
          return hasActive ? 2000 : false;
        },
      },
    },
  );

  const { content, meta } = unwrapPage<ImportJobSummaryDto>(data);

  const handleResetFilters = () => {
    setTypeFilter(null);
    setStatusFilter(null);
    setPage(0);
  };

  if (!canView) {
    return (
      <div className="flex flex-1 items-center justify-center p-5">
        <Text c="dimmed">You do not have permission to view imports.</Text>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col flex-1 gap-5 p-5">
        <Breadcrumbs>
          <Text size="sm">Admin</Text>
          <Anchor size="sm">Imports</Anchor>
        </Breadcrumbs>

        <div className="flex justify-between items-center">
          <div>
            <Text size="lg" fw={700}>
              CSV Imports
            </Text>
            <Text size="sm" c="dimmed">
              Upload CSV files and track import jobs
            </Text>
          </div>
          {allowedTypes.length > 0 && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setImportOpened(true)}
            >
              Import
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <Select
            placeholder="Filter by type"
            clearable
            data={[
              { value: "EMPLOYEE", label: "Employees" },
              { value: "USER", label: "Users" },
            ]}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as ImportTypeValue | null)}
            style={{ flex: 1, maxWidth: 200 }}
          />
          <Select
            placeholder="Filter by status"
            clearable
            data={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(value as GetAllImportJobsStatus | null)
            }
            style={{ flex: 1, maxWidth: 200 }}
          />
          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={!typeFilter && !statusFilter}
          >
            Reset Filters
          </Button>
        </div>

        {meta && (
          <PaginatedTable
            heading={[
              "Type",
              "File",
              "Status",
              "Read",
              "Written",
              "Skipped",
              "Created",
              "Actions",
            ]}
            isError={isError}
            errorMessage="Failed to load imports. Please try again or contact support."
            isFetching={isFetching}
            meta={meta}
            onPageChange={(pageNum) => setPage(pageNum - 1)}
            emptyMessage="No import jobs found"
            rows={content.map((row: ImportJobSummaryDto) => (
              <Table.Tr key={row.importJobId}>
                <Table.Td>
                  <Text size="sm">{TYPE_LABELS[row.type] ?? row.type}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.fileName}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={STATUS_COLORS[row.status] ?? "gray"}
                    variant="light"
                  >
                    {row.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.readCount}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.writeCount}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.skipCount}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDate(row.createdAt)}</Text>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => setSelectedJobId(row.importJobId)}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          />
        )}

        {isLoading && !meta && (
          <Text size="sm" c="dimmed">
            Loading...
          </Text>
        )}
      </div>

      {importOpened && (
        <ImportModal
          opened={importOpened}
          onClose={() => setImportOpened(false)}
          allowedTypes={allowedTypes}
        />
      )}

      <DetailsModal
        jobId={selectedJobId}
        onClose={() => setSelectedJobId(null)}
      />
    </>
  );
}

export default Page;