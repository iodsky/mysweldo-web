import { Table, Text } from "@mantine/core";
import PaginatedTable from "@/components/paginated-table";
import type { ReactNode } from "react";
import type { Attendance } from "@/types";
import type { PaginationMeta } from "@/api/generated/model";

interface AttendanceTableProps {
  rows: Attendance[];
  meta: PaginationMeta;
  isFetching: boolean;
  isError: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  showEmployee?: boolean;
  renderActions?: (row: Attendance) => ReactNode;
}

export function AttendanceTable({
  rows,
  meta,
  isFetching,
  isError,
  emptyMessage = "No attendance records found",
  errorMessage = "Failed to load attendance records.",
  onPageChange,
  pageSize,
  onPageSizeChange,
  showEmployee = false,
  renderActions,
}: AttendanceTableProps) {
  const heading = [
    ...(showEmployee ? ["Employee"] : []),
    "Date",
    "Time In",
    "Time Out",
    "Total Hours",
    ...(renderActions ? ["Actions"] : []),
  ];

  return (
    <PaginatedTable
      heading={heading}
      isError={isError}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      isFetching={isFetching}
      meta={meta}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      onPageChange={onPageChange}
      rows={rows.map((row) => (
        <Table.Tr key={String(row.id)}>
          {showEmployee && (
            <Table.Td>
              <Text size="sm">
                {`${row.employeeFirstName ?? ""} ${row.employeeLastName ?? ""}`.trim() ||
                  "-"}
              </Text>
            </Table.Td>
          )}
          <Table.Td>
            <Text size="sm">{row.timeIn?.slice(0, 10) ?? "-"}</Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm">{row.timeIn?.slice(11, 16) ?? "-"}</Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm">{row.timeOut?.slice(11, 16) ?? "-"}</Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm">
              {typeof row.totalHours === "number" ? row.totalHours : "-"}
            </Text>
          </Table.Td>
          {renderActions && <Table.Td>{renderActions(row)}</Table.Td>}
        </Table.Tr>
      ))}
    />
  );
}