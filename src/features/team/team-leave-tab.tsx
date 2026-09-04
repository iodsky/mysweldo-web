import { useState } from "react";
import { ActionIcon, Badge, Loader, Menu, Table, Text } from "@mantine/core";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconDotsVertical, IconX } from "@tabler/icons-react";
import {
  useGetSubordinatesLeaveRequests,
  useUpdateLeaveRequestStatus,
} from "@/api/generated/endpoints/leave-requests/leave-requests";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type { LeaveRequest, LeaveType, RequestStatus } from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: "yellow",
  APPROVED: "green",
  REJECTED: "red",
};

const LEAVE_TYPE_MAP: Record<LeaveType, string> = {
  VACATION: "Vacation",
  SICK: "Sick",
  MATERNITY: "Maternity",
  PATERNITY: "Paternity",
  SOLO_PARENT: "Solo Parent",
  BEREAVEMENT: "Bereavement",
};

interface LeaveTabProps {
  roster: Map<number, string>;
}

function LeaveTab({ roster }: LeaveTabProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);

  const { data, isLoading, isFetching, isError } = useGetSubordinatesLeaveRequests(
    { pageNo: page, limit: pageSize },
    {
      query: {
        queryKey: ["subordinates", "leave", page, pageSize] as const,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const { content: rows, meta } = unwrapPage<LeaveRequest>(data);

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateLeaveRequestStatus({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/leave-requests"] });
          setConfirmOpen(false);
          setActionType(null);
          setSelected(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: `Leave request ${actionType}d successfully`,
            withBorder: true,
          });
        },
        onError: handleApiError,
      },
    });

  const openConfirm = (req: LeaveRequest, action: "approve" | "reject") => {
    setSelected(req);
    setActionType(action);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!selected) return;
    updateStatus({
      id: selected.id,
      params: { status: actionType === "approve" ? "APPROVED" : "REJECTED" },
    });
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
            heading={[
              "Employee",
              "Leave Type",
              "Start Date",
              "End Date",
              "Notes",
              "Status",
              "Actions",
            ]}
            rows={rows.map((req: LeaveRequest) => (
              <Table.Tr key={req.id}>
                <Table.Td>
                  <Text size="sm">
                    {req.employeeId != null
                      ? roster.get(req.employeeId) ?? req.employeeId
                      : "-"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {LEAVE_TYPE_MAP[req.leaveType as LeaveType] ?? req.leaveType}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {req.startDate
                      ? new Date(req.startDate).toLocaleDateString()
                      : "-"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {req.endDate
                      ? new Date(req.endDate).toLocaleDateString()
                      : "-"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{req.note || "-"}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={STATUS_COLORS[req.status as RequestStatus]}>
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
            emptyMessage="No leave requests found"
          />
        )
      )}

      <ConfirmationModal
        opened={confirmOpen}
        title={
          actionType === "approve"
            ? "Approve Leave Request"
            : "Reject Leave Request"
        }
        message={
          actionType === "approve"
            ? "Are you sure you want to approve this leave request?"
            : "Are you sure you want to reject this leave request?"
        }
        confirmText={actionType === "approve" ? "Approve" : "Reject"}
        isDangerous={actionType === "reject"}
        isLoading={isUpdatingStatus}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setActionType(null);
          setSelected(null);
        }}
      />
    </div>
  );
}

export default LeaveTab;