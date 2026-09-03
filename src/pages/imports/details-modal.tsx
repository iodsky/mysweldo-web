import { Modal, Button, Group, Text, Badge, Table, Stack } from "@mantine/core";
import { useGetImportJobDetails } from "@/api/generated/endpoints/csv-imports/csv-imports";
import { unwrapData } from "@/api/helpers";
import type { ImportJobDetailsResponse } from "@/api/generated/model";

interface DetailsModalProps {
  jobId: string | null;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "gray",
  RUNNING: "blue",
  COMPLETED: "green",
  FAILED: "red",
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-gray-200 p-3">
      <Text size="xl" fw={700}>
        {value}
      </Text>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
    </div>
  );
}

function DetailsModal({ jobId, onClose }: DetailsModalProps) {
  const { data, isFetching, isError } = useGetImportJobDetails(jobId ?? "", {
    query: {
      enabled: !!jobId,
      refetchInterval: (query) => {
        const status = (query.state.data as { data?: ImportJobDetailsResponse } | undefined)
          ?.data?.status;
        return status === "PENDING" || status === "RUNNING" ? 2000 : false;
      },
    },
  });

  const job = unwrapData<ImportJobDetailsResponse>(data);
  const failures = job?.failures ?? [];

  return (
    <Modal
      opened={!!jobId}
      onClose={onClose}
      title="Import job details"
      centered
      size="lg"
    >
      <Stack gap="md">
        {isError && (
          <Text c="red" fw={500}>
            Failed to load import job details.
          </Text>
        )}

        {job && (
          <>
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  {job.fileName}
                </Text>
                <Text size="xs" c="dimmed">
                  {job.importJobId}
                </Text>
              </div>
              <Badge color={STATUS_COLORS[job.status] ?? "gray"} variant="light">
                {job.status}
              </Badge>
            </Group>

            <div className="grid grid-cols-3 gap-3">
              <Stat label="Read" value={String(job.readCount)} />
              <Stat label="Written" value={String(job.writeCount)} />
              <Stat label="Skipped" value={String(job.skipCount)} />
            </div>

            {job.errorMessage && (
              <Text size="sm" c="red">
                {job.errorMessage}
              </Text>
            )}

            {failures.length > 0 && (
              <div>
                <Text size="sm" fw={500} mb={4}>
                  Failed rows ({failures.length})
                </Text>
                <Table highlightOnHover withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Row</Table.Th>
                      <Table.Th>Reason</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {failures.map((failure) => (
                      <Table.Tr key={failure.rowNumber}>
                        <Table.Td>{failure.rowNumber}</Table.Td>
                        <Table.Td>{failure.reason}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            )}
          </>
        )}

        {isFetching && !job && (
          <Text size="sm" c="dimmed">
            Loading...
          </Text>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default DetailsModal;