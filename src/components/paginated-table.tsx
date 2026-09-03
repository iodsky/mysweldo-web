import {
  Pagination,
  Select,
  Table,
  Text,
  Loader,
  type TableProps,
} from "@mantine/core";
import type { PaginationMeta } from "@/types";
import type { ReactNode } from "react";

interface PaginatedTableProps {
  rows: ReactNode[];
  heading: string[];
  meta: PaginationMeta;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  tableProps?: TableProps;
  emptyMessage?: string;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const PAGE_SIZE_OPTIONS = ["10", "20", "50", "100"].map((value) => ({
  value,
  label: value,
}));

function PaginatedTable({
  rows,
  meta,
  heading,
  onPageChange,
  pageSize,
  onPageSizeChange,
  tableProps,
  emptyMessage,
  isFetching,
  isError,
  errorMessage,
}: PaginatedTableProps) {
  return (
    <div className="flex flex-col flex-1 gap-4 min-h-0">
      {isError && (
        <Text c="red" fw={500}>
          {errorMessage || "Failed to load data"}
        </Text>
      )}

      <div className="relative flex-1 min-h-0 overflow-y-auto">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
            <Loader size="lg" />
          </div>
        )}
        <Table
          highlightOnHover
          withTableBorder={true}
          withColumnBorders={true}
          stickyHeader
          {...tableProps}
        >
          <Table.Thead>
            <Table.Tr>
              {heading.map((item, index) => (
                <Table.Th key={`${item}-${index}`}>{item}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={heading.length}>
                  <Text size="md" c="dimmed" ta="center" my="md">
                    {emptyMessage || "No data available"}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Text size="sm" c="dimmed">
            Rows per page
          </Text>
          <Select
            size="sm"
            w={80}
            aria-label="Rows per page"
            data={PAGE_SIZE_OPTIONS}
            value={String(pageSize ?? 10)}
            onChange={(value) => onPageSizeChange?.(Number(value))}
          />
        </div>
        <Pagination
          total={meta.totalPages ?? 1}
          value={(meta.page ?? 0) + 1}
          onChange={onPageChange}
          withEdges
        />
      </div>
    </div>
  );
}

export default PaginatedTable;
