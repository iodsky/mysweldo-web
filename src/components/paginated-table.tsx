import {
  Pagination,
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
  tableProps?: TableProps;
  emptyMessage?: string;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

function PaginatedTable({
  rows,
  meta,
  heading,
  onPageChange,
  tableProps,
  emptyMessage,
  isFetching,
  isError,
  errorMessage,
}: PaginatedTableProps) {
  return (
    <div className="flex flex-col flex-1 gap-4">
      {isError && (
        <Text c="red" fw={500}>
          {errorMessage || "Failed to load data"}
        </Text>
      )}

      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
            <Loader size="lg" />
          </div>
        )}
        <Table
          highlightOnHover
          withTableBorder={true}
          withColumnBorders={true}
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

      <div className="flex flex-col items-center">
        <Pagination
          total={meta.totalPages}
          value={meta.page + 1}
          onChange={onPageChange}
          withEdges
        />
      </div>
    </div>
  );
}

export default PaginatedTable;
