import {
  Group,
  Pagination,
  Stack,
  Table,
  Text,
  Loader,
  Box,
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
    <Stack>
      {isError && (
        <Text c="red" fw={500}>
          {errorMessage || "Failed to load data"}
        </Text>
      )}

      <Box pos="relative">
        {isFetching && (
          <Box
            pos="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            style={{
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            bg="rgba(255, 255, 255, 0.5)"
          >
            <Loader size="lg" />
          </Box>
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
                  <Group justify="center" py="lg">
                    <Stack align="center" gap="xs">
                      <Text fw={500}>
                        {emptyMessage || "No data available"}
                      </Text>
                      {!emptyMessage && (
                        <Text size="sm" c="dimmed">
                          Nothing to display yet.
                        </Text>
                      )}
                    </Stack>
                  </Group>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Box>

      <Group justify="center">
        <Pagination
          total={meta.totalPages}
          value={meta.page + 1}
          onChange={onPageChange}
          withEdges
        />
      </Group>
    </Stack>
  );
}

export default PaginatedTable;
