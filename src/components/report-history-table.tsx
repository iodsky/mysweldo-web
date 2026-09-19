import { ActionIcon, Badge, Loader, Table, Text } from "@mantine/core";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import type { ReportDto } from "@/api/generated/model";

interface ReportHistoryTableProps {
  reports: ReportDto[];
  isLoading?: boolean;
  isDeleting?: boolean;
  onDownload: (report: ReportDto) => void;
  onDelete: (report: ReportDto) => void;
  emptyMessage?: string;
}

const FORMAT_COLORS: Record<string, string> = {
  CSV: "blue",
  XLSX: "green",
};

function formatDateTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReportHistoryTable({
  reports,
  isLoading,
  isDeleting,
  onDownload,
  onDelete,
  emptyMessage = "No exports yet",
}: ReportHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Text size="sm" c="dimmed" className="py-4">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>File</Table.Th>
          <Table.Th>Format</Table.Th>
          <Table.Th>Period</Table.Th>
          <Table.Th>Created</Table.Th>
          <Table.Th align="center">Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {reports.map((report) => (
          <Table.Tr key={report.id}>
            <Table.Td>{report.fileName}</Table.Td>
            <Table.Td>
              <Badge
                size="sm"
                variant="light"
                color={FORMAT_COLORS[report.format] ?? "gray"}
              >
                {report.format}
              </Badge>
            </Table.Td>
            <Table.Td>
              {report.periodStart
                ? `${report.periodStart} → ${report.periodEnd ?? ""}`
                : "—"}
            </Table.Td>
            <Table.Td>{formatDateTime(report.createdAt)}</Table.Td>
            <Table.Td align="center">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                aria-label={`Download ${report.fileName}`}
                onClick={() => onDownload(report)}
              >
                <IconDownload size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                aria-label={`Delete ${report.fileName}`}
                disabled={isDeleting}
                onClick={() => onDelete(report)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

export default ReportHistoryTable;