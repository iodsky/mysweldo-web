import { useState } from "react";
import {
  Button,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Modal,
  Textarea,
  Loader,
  Table,
  Breadcrumbs,
  Anchor,
  Select,
  FileInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { IconPlus, IconDotsVertical, IconCheck, IconX, IconTrash, IconPencil } from "@tabler/icons-react";
import {
  useCreateOvertimeRequest,
  useDeleteOvertimeRequest,
  useGetOvertimeRequests,
  useUpdateOvertimeRequest,
  useUpdateOvertimeRequestStatus,
} from "@/api/generated/endpoints/overtime-requests/overtime-requests";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type {
  OvertimeRequest,
  OvertimeRequestDto,
  RequestStatus,
} from "@/types";
import { notifications } from "@mantine/notifications";
import { REQUEST_STATUS_COLORS } from "@/features/shared/request-status";
import { formatDate } from "@/utils/date";
import { useEmployeeOptions } from "@/hooks/use-employee-options";
import { DateRangeFilter } from "@/components/date-range-filter";
import { useRequestApproval } from "@/features/shared/use-request-approval";

function Page() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string | null>(null);
  const [createReason, setCreateReason] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [editReason, setEditReason] = useState("");
  const [editRequest, setEditRequest] = useState<OvertimeRequest | null>(null);

  const {
    openConfirm,
    closeConfirm,
    confirm,
    actionType,
    confirmModalProps,
  } = useRequestApproval<OvertimeRequest>({ noun: "overtime request" });

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  const { options: employeeOptions } = useEmployeeOptions({
    queryKey: ["employees", "attendance-form"],
  });

  const { data, isLoading, isFetching, isError } = useGetOvertimeRequests(
    {
      pageNo: page,
      limit: pageSize,
      startDate: startDate ? formatDate(startDate) : undefined,
      endDate: endDate ? formatDate(endDate) : undefined,
    },
    {
      query: {
        queryKey: ["overtimeRequests", "all", page, pageSize, startDate, endDate] as const,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const pageData = unwrapPage<OvertimeRequest>(data);
  const requests = pageData.content;
  const meta = pageData.meta;

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: ["/overtime-requests"] });

  const { mutate: createRequest, isPending: isCreating } = useCreateOvertimeRequest(
    {
      mutation: {
        onSuccess: () => {
          invalidateList();
          setCreateModalOpen(false);
          setCreateDate(null);
          setCreateReason("");
          setSelectedEmployeeId(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Overtime request created",
            withBorder: true,
          });
        },
      },
    },
  );

  const { mutate: updateRequest, isPending: isUpdating } =
    useUpdateOvertimeRequest({
      mutation: {
        onSuccess: () => {
          invalidateList();
          setEditModalOpen(false);
          setEditRequest(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Overtime request updated",
            withBorder: true,
          });
        },
      },
    });

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateOvertimeRequestStatus({
      mutation: {
        onSuccess: () => {
          invalidateList();
          closeConfirm();
          notifications.show({
            title: "Success",
            color: "green",
            message: `Overtime request ${actionType}d`,
            withBorder: true,
          });
        },
      },
    });

  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteOvertimeRequest(
    {
      mutation: {
        onSuccess: () => {
          invalidateList();
          closeConfirm();
          notifications.show({
            title: "Success",
            color: "green",
            message: "Overtime request deleted",
            withBorder: true,
          });
        },
      },
    },
  );

  const handleEditClick = (request: OvertimeRequest) => {
    setEditRequest(request);
    setEditDate(request.date);
    setEditReason(request.reason || "");
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    updateRequest({
      id: editRequest?.id ?? "",
      data: {
        date: formatDate(editDate!),
        ...(editReason && { reason: editReason }),
      } as OvertimeRequestDto,
    });
  };

  const handleCreateSave = () => {
    createRequest({
      data: {
        date: formatDate(createDate!),
        employeeId: Number(selectedEmployeeId),
        ...(createReason && { reason: createReason }),
      } as OvertimeRequestDto,
    });
  };

  const handleConfirmAction = () => {
    confirm(updateStatus, deleteRequest);
  };

  return (
    <div className="flex flex-col gap-5 p-5 flex-1">
      <Breadcrumbs>
        <Text size="sm">HR</Text>
        <Anchor size="sm">Overtime Requests</Anchor>
      </Breadcrumbs>

      <div className="flex justify-between items-center">
        <div>
          <Text size="lg" fw={700}>
            Overtime Requests
          </Text>
          <Text size="sm" c="dimmed">
            Manage employee overtime requests
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setCreateDate(null);
            setCreateReason("");
            setSelectedEmployeeId(null);
            setCreateModalOpen(true);
          }}
        >
          New Request
        </Button>
      </div>

      <div className="flex justify-between items-end">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(d) => {
            setStartDate(d);
            setPage(0);
          }}
          onEndDateChange={(d) => {
            setEndDate(d);
            setPage(0);
          }}
          onClear={() => {
            setStartDate(null);
            setEndDate(null);
            setPage(0);
          }}
        />
      </div>

      {isError && (
        <Text c="red" fw={500}>
          Failed to load overtime requests
        </Text>
      )}

      {!isError && meta && (
        <PaginatedTable
          heading={[
            "Employee ID",
            "Date",
            "Hours",
            "Reason",
            "Status",
            "Actions",
          ]}
          rows={requests.map((request: OvertimeRequest) => (
            <Table.Tr key={request.id ?? ""}>
              <Table.Td>{request.employeeId}</Table.Td>
              <Table.Td>{request.date}</Table.Td>
              <Table.Td>{request.overtimeHours}</Table.Td>
              <Table.Td>{request.reason || "-"}</Table.Td>
              <Table.Td>
                <Badge color={REQUEST_STATUS_COLORS[request.status as RequestStatus]}>
                  {request.status}
                </Badge>
              </Table.Td>
              <Table.Td align="center">
                <Menu shadow="md">
                  <Menu.Target>
                    <ActionIcon
                      variant="transparent"
                      color="gray"
                      disabled={request.status !== "PENDING"}
                    >
                      <IconDotsVertical />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconPencil />}
                      onClick={() => handleEditClick(request)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconCheck />}
                      onClick={() => openConfirm(request, "approve")}
                    >
                      Approve
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconX />}
                      onClick={() => openConfirm(request, "reject")}
                    >
                      Reject
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash />}
                      color="red"
                      onClick={() => openConfirm(request, "delete")}
                    >
                      Delete
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
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      )}

      {/* Create Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="New Overtime Request"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Employee"
            placeholder="Select employee"
            required
            data={employeeOptions}
            value={selectedEmployeeId}
            onChange={(value) => {
              setSelectedEmployeeId(value);
            }}
            searchable
            clearable
          />
          <DateInput
            label="Date"
            placeholder="Select date"
            value={createDate}
            onChange={setCreateDate}
            required
            highlightToday
          />
          <Textarea
            label="Reason"
            placeholder="Add reason for overtime (optional)"
            value={createReason}
            onChange={(e) => setCreateReason(e.currentTarget.value)}
            minRows={3}
          />
          <FileInput
            label="Attachments"
            description="Attach proof of overtime work (optional)"
            placeholder="Select attachment"
            clearable
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSave}
              loading={isCreating}
              disabled={!createDate || !selectedEmployeeId}
            >
              Create Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditRequest(null);
        }}
        title="Edit Overtime Request"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Employee ID
            </Text>
            <Text>{editRequest?.employeeId}</Text>
          </div>
          <DateInput
            label="Date"
            placeholder="Select date"
            value={editDate}
            onChange={setEditDate}
            required
          />
          <Textarea
            label="Reason"
            placeholder="Add reason for overtime (optional)"
            value={editReason}
            onChange={(e) => setEditReason(e.currentTarget.value)}
            minRows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setEditRequest(null);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              loading={isUpdating}
              disabled={!editDate}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        {...confirmModalProps}
        isLoading={isUpdatingStatus || isDeleting}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}

export default Page;
