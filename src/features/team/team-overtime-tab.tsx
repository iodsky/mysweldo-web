import { useState } from "react";
import { ActionIcon, Badge, Loader, Menu, Table, Text } from "@mantine/core";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconDotsVertical, IconX } from "@tabler/icons-react";
import {
  useGetSubordinatesOvertimeRequests,
  useUpdateOvertimeRequestStatus,
} from "@/api/generated/endpoints/overtime-requests/overtime-requests";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type { OvertimeRequest, RequestStatus } from "@/types";
import { notifications } from "@mantine/notifications";
import { REQUEST_STATUS_COLORS } from "@/features/shared/request-status";
import { useRequestApproval } from "@/features/shared/use-request-approval";

interface OvertimeTabProps {
  roster: Map<number, string>;
}

function OvertimeTab({ roster }: OvertimeTabProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const {
    openConfirm,
    closeConfirm,
    confirm,
    actionType,
    confirmModalProps,
  } = useRequestApproval<OvertimeRequest>({ noun: "overtime request" });

  const { data, isLoading, isFetching, isError } =
    useGetSubordinatesOvertimeRequests(
      { pageNo: page, limit: pageSize },
      {
        query: {
          queryKey: ["subordinates", "overtime", page, pageSize] as const,
          staleTime: 1000 * 60 * 5,
          placeholderData: keepPreviousData,
        },
      },
    );

  const { content: rows, meta } = unwrapPage<OvertimeRequest>(data);

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateOvertimeRequestStatus({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/overtime-requests"] });
          closeConfirm();
          notifications.show({
            title: "Success",
            color: "green",
            message: `Overtime request ${actionType}d successfully`,
            withBorder: true,
          });
        },
      },
    });

  const handleConfirm = () => {
    confirm(updateStatus);
  };

  return (
    <div className="flex flex-col gap-5 flex-1">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : (
        meta && (
          <PaginatedTable
            heading={["Employee", "Date", "Hours", "Reason", "Status", "Actions"]}
            rows={rows.map((req: OvertimeRequest) => (
              <Table.Tr key={req.id}>
                <Table.Td>
                  <Text size="sm">
                    {req.employeeId != null
                      ? roster.get(req.employeeId) ?? req.employeeId
                      : "-"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{req.date}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{req.overtimeHours}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{req.reason || "-"}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={REQUEST_STATUS_COLORS[req.status as RequestStatus]}>
                    {req.status}
                  </Badge>
                </Table.Td>
                <Table.Td align="center">
                  <Menu shadow="md">
                    <Menu.Target>
                      <ActionIcon
                        variant="transparent"
                        color="gray"
                        disabled={req.status !== "PENDING"}
                      >
                        <IconDotsVertical />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconCheck />}
                        onClick={() => openConfirm(req, "approve")}
                      >
                        Approve
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconX />}
                        color="red"
                        onClick={() => openConfirm(req, "reject")}
                      >
                        Reject
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
            emptyMessage="No overtime requests found"
          />
        )
      )}

      <ConfirmationModal
        {...confirmModalProps}
        isLoading={isUpdatingStatus}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export default OvertimeTab;