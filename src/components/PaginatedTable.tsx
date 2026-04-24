import {
  Box,
  Center,
  Loader,
  Table,
  Text,
  Group,
  Button,
  Stack,
  Menu,
} from "@mantine/core";
import { BsThreeDotsVertical } from "react-icons/bs";

export interface ActionItem<T = Record<string, unknown>> {
  label: string;
  icon: React.ReactNode;
  color?: string;
  onClick: (row: T) => void;
}

interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  isAction?: boolean;
  actions?: ActionItem<T>[];
}

interface PaginationMeta {
  page: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  rows: T[];
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  meta?: PaginationMeta;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
}

export function PaginatedTable<
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  columns,
  rows,
  isFetching,
  isError,
  errorMessage = "Failed to retrieve data",
  emptyMessage = "No records found",
  meta,
  onPreviousPage,
  onNextPage,
}: DataTableProps<T>) {
  return (
    <Stack gap="md">
      <Box style={{ overflowX: "auto" }} className="h-full">
        <Table
          striped
          highlightOnHover
          withTableBorder={true}
          withColumnBorders={true}
        >
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th key={column.key}>{column.label}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isError ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Center py="xl">
                    <Text c="red" fw={500}>
                      {errorMessage}
                    </Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : isFetching && rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Center py="xl">
                    <Loader size="md" />
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Center py="xl">
                    <Text c="dimmed" ta="center">
                      {emptyMessage}
                    </Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              rows.map((row) => (
                <Table.Tr key={String(row.id)}>
                  {columns.map((column) => (
                    <Table.Td key={`${String(row.id)}-${column.key}`}>
                      {column.isAction && column.actions ? (
                        <Menu shadow="md">
                          <Menu.Target>
                            <Button
                              variant="transparent"
                              size="xs"
                              p={0}
                              h="auto"
                              style={{ cursor: "pointer" }}
                            >
                              <BsThreeDotsVertical size={16} />
                            </Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            {column.actions.map((action, index) => (
                              <Menu.Item
                                key={index}
                                leftSection={action.icon}
                                color={action.color}
                                onClick={() => action.onClick(row)}
                              >
                                {action.label}
                              </Menu.Item>
                            ))}
                          </Menu.Dropdown>
                        </Menu>
                      ) : column.render ? (
                        column.render(row[column.key], row)
                      ) : (
                        String(row[column.key] ?? "")
                      )}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Pagination Controls */}
      {meta && rows.length > 0 && (
        <Group justify="space-between">
          <Button disabled={meta.first} onClick={onPreviousPage}>
            Previous
          </Button>

          <Text>
            Page {meta.page} of {meta.totalPages}
          </Text>

          <Button disabled={meta.last} onClick={onNextPage}>
            Next
          </Button>
        </Group>
      )}
    </Stack>
  );
}
