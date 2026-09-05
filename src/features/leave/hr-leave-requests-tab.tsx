import { useState } from "react";
import {
  Button,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Select,
  Modal,
  Textarea,
  Loader,
  Table,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { IconPlus, IconDotsVertical, IconCheck, IconX } from "@tabler/icons-react";
import {
  useCreateLeaveRequest,
  useDeleteLeaveRequest,
  useGetLeaveRequests,
  useUpdateLeaveRequest,
  useUpdateLeaveRequestStatus,
} from "@/api/generated/endpoints/leave-requests/leave-requests";
import { useGetAllEmployees } from "@/api/generated/endpoints/employees/employees";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type {
  LeaveRequest,
  RequestStatus,
  LeaveType,
  EmployeeBasic,
} from "@/types";
import type { GetLeaveRequestsParams } from "@/api/generated/model";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconPencil } from "@tabler/icons-react";

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

function LeaveRequestsTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "delete" | null
  >(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null,
  );
  const [editStartDate, setEditStartDate] = useState<Date | string | null>(
    null,
  );
  const [editEndDate, setEditEndDate] = useState<Date | string | null>(null);
  const [editNote, setEditNote] = useState<string>("");

  // Create form state
  const [createEmployeeId, setCreateEmployeeId] = useState<number | null>(null);
  const [createLeaveType, setCreateLeaveType] = useState<string | null>(null);
  const [createStartDate, setCreateStartDate] = useState<Date | string | null>(
    null,
  );
  const [createEndDate, setCreateEndDate] = useState<Date | string | null>(
    null,
  );
  const [createNote, setCreateNote] = useState<string>("");

  const filters: GetLeaveRequestsParams = {
    pageNo: page,
    limit: pageSize,
  };

  const { data: employeesData } = useGetAllEmployees(
    { pageNo: 0, limit: 100 },
    {
      query: {
        queryKey: ["employees"] as const,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
      },
    },
  );

  const { data, isLoading, isFetching, isError } = useGetLeaveRequests(filters, {
    query: {
      queryKey: ["leaveRequests", page, pageSize, statusFilter] as const,
      staleTime: 1000 * 60 * 5,
      placeholderData: keepPreviousData,
    },
  });

  const pageData = unwrapPage<LeaveRequest>(data);
  const requests = pageData.content;
  const meta = pageData.meta;

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateLeaveRequestStatus({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["/leave-requests"],
          });
          queryClient.invalidateQueries({ queryKey: ["/leave-credits"] });
          setConfirmModalOpen(false);
          setActionType(null);
          setSelectedRequest(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: `Leave request ${actionType}ed successfully`,
            withBorder: true,
          });
        },
      },
    });

  const { mutate: createRequest, isPending: isCreating } = useCreateLeaveRequest(
    {
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/leave-requests"] });
          setCreateModalOpen(false);
          resetCreateForm();
          notifications.show({
            title: "Success",
            color: "green",
            message: "Leave request created successfully",
            withBorder: true,
          });
        },
      },
    },
  );

  const { mutate: updateRequest, isPending: isUpdating } = useUpdateLeaveRequest(
    {
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/leave-requests"] });
          setEditModalOpen(false);
          setSelectedRequest(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Leave request updated successfully",
            withBorder: true,
          });
        },
      },
    },
  );

  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteLeaveRequest(
    {
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/leave-requests"] });
          setConfirmModalOpen(false);
          setActionType(null);
          setSelectedRequest(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Leave request deleted successfully",
            withBorder: true,
          });
        },
      },
    },
  );

  const handleEditClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setEditStartDate(new Date(request.startDate));
    setEditEndDate(new Date(request.endDate));
    setEditNote(request.note || "");
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editStartDate || !editEndDate) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please select both start and end dates",
        withBorder: true,
      });
      return;
    }

    const startStr =
      editStartDate instanceof Date
        ? editStartDate.toISOString().split("T")[0]
        : editStartDate;
    const endStr =
      editEndDate instanceof Date
        ? editEndDate.toISOString().split("T")[0]
        : editEndDate;

    updateRequest({
      id: selectedRequest?.id ?? "",
      data: {
        leaveType: (selectedRequest?.leaveType ?? "VACATION") as LeaveType,
        startDate: startStr,
        endDate: endStr,
        note: editNote || undefined,
      },
    });
  };

  const resetCreateForm = () => {
    setCreateEmployeeId(null);
    setCreateLeaveType(null);
    setCreateStartDate(null);
    setCreateEndDate(null);
    setCreateNote("");
  };

  const handleCreateClick = () => {
    setCreateModalOpen(true);
    resetCreateForm();
  };

  const handleCreateSave = () => {
    if (
      !createEmployeeId ||
      !createLeaveType ||
      !createStartDate ||
      !createEndDate
    ) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please fill in all required fields",
        withBorder: true,
      });
      return;
    }

    const startStr =
      createStartDate instanceof Date
        ? createStartDate.toISOString().split("T")[0]
        : createStartDate;
    const endStr =
      createEndDate instanceof Date
        ? createEndDate.toISOString().split("T")[0]
        : createEndDate;

    createRequest({
      data: {
        employeeId: createEmployeeId,
        leaveType: createLeaveType as LeaveType,
        startDate: startStr,
        endDate: endStr,
        note: createNote || undefined,
      },
    });
  };

  const handleStatusAction = (request: LeaveRequest, action: RequestStatus) => {
    setSelectedRequest(request);
    setActionType(action === "APPROVED" ? "approve" : "reject");
    setConfirmModalOpen(true);
  };

  const handleDeleteClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setActionType("delete");
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (actionType === "approve" || actionType === "reject") {
      const status = (actionType === "approve"
        ? "APPROVED"
        : "REJECTED") as RequestStatus;
      updateStatus({ id: selectedRequest?.id ?? "", params: { status } });
    } else if (actionType === "delete") {
      deleteRequest({ id: selectedRequest?.id ?? "" });
    }
  };

  const rows = requests.map((request: LeaveRequest) => (
    <Table.Tr key={request.id ?? ""}>
      <Table.Td>{request.employeeId}</Table.Td>
      <Table.Td>{LEAVE_TYPE_MAP[request.leaveType as LeaveType]}</Table.Td>
      <Table.Td>
        {request.startDate ? new Date(request.startDate).toLocaleDateString() : "-"}
      </Table.Td>
      <Table.Td>
        {request.endDate ? new Date(request.endDate).toLocaleDateString() : "-"}
      </Table.Td>
      <Table.Td>{request.note || "-"}</Table.Td>
      <Table.Td>
        <Badge color={STATUS_COLORS[request.status as RequestStatus]}>
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
              onClick={() => handleEditClick(request)}
              leftSection={<IconPencil />}
            >
              Edit
            </Menu.Item>
            {request.status === "PENDING" && (
              <>
                <Menu.Item
                  onClick={() => handleStatusAction(request, "APPROVED")}
                  leftSection={<IconCheck />}
                >
                  Approve
                </Menu.Item>
                <Menu.Item
                  onClick={() => handleStatusAction(request, "REJECTED")}
                  leftSection={<IconX />}
                >
                  Reject
                </Menu.Item>
              </>
            )}
            <Menu.Item
              onClick={() => handleDeleteClick(request)}
              leftSection={<IconTrash />}
              color="red"
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  const getConfirmationMessage = () => {
    if (actionType === "approve")
      return "Are you sure you want to approve this leave request?";
    if (actionType === "reject")
      return "Are you sure you want to reject this leave request?";
    return "Are you sure you want to delete this leave request?";
  };

  const getConfirmationTitle = () => {
    if (actionType === "approve") return "Approve Leave Request";
    if (actionType === "reject") return "Reject Leave Request";
    return "Delete Leave Request";
  };

  return (
    <div className="flex flex-col gap-6 flex-1">
      <div className="flex items-end justify-end gap-2">
        <Select
          label="Filter by Status"
          placeholder="All"
          data={[
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
        />
        <Button leftSection={<IconPlus />} onClick={handleCreateClick}>
          Create Leave Request
        </Button>
      </div>

      {isError && (
        <Text c="red" fw={500}>
          Failed to load leave requests
        </Text>
      )}

      {!isError && meta && (
        <PaginatedTable
          heading={[
            "Employee ID",
            "Leave Type",
            "Start Date",
            "End Date",
            "Notes",
            "Status",
            "Actions",
          ]}
          rows={rows}
          meta={meta}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPage(0);
            setPageSize(size);
          }}
          onPageChange={(p) => setPage(p - 1)}
          isFetching={isFetching}
          isError={isError}
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
        onClose={() => {
          setCreateModalOpen(false);
          resetCreateForm();
        }}
        title="Create Leave Request"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Employee"
            placeholder="Select employee"
            searchable
            data={
              unwrapPage<EmployeeBasic>(employeesData).content.map(
                (emp: EmployeeBasic) => ({
                  value: String(emp.id ?? ""),
                  label: `${emp.firstName ?? ""} ${emp.lastName ?? ""}`,
                }),
              )
            }
            value={createEmployeeId?.toString() ?? null}
            onChange={(value) =>
              setCreateEmployeeId(value ? Number(value) : null)
            }
            required
          />

          <Select
            label="Leave Type"
            placeholder="Select leave type"
            data={[
              { value: "VACATION", label: "Vacation" },
              { value: "SICK", label: "Sick" },
              { value: "MATERNITY", label: "Maternity" },
              { value: "PATERNITY", label: "Paternity" },
              { value: "SOLO_PARENT", label: "Solo Parent" },
              { value: "BEREAVEMENT", label: "Bereavement" },
            ]}
            value={createLeaveType}
            onChange={setCreateLeaveType}
            required
          />

          <DatePickerInput
            label="Start Date"
            placeholder="Select start date"
            value={createStartDate}
            onChange={setCreateStartDate}
            required
            highlightToday
          />

          <DatePickerInput
            label="End Date"
            placeholder="Select end date"
            value={createEndDate}
            onChange={setCreateEndDate}
            required
            highlightToday
          />

          <Textarea
            label="Notes"
            placeholder="Add any notes..."
            value={createNote}
            onChange={(e) => setCreateNote(e.currentTarget.value)}
            minRows={3}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                resetCreateForm();
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSave} loading={isCreating}>
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
          setSelectedRequest(null);
        }}
        title="Edit Leave Request"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Employee ID
            </Text>
            <Text>{selectedRequest?.employeeId}</Text>
          </div>

          <DatePickerInput
            label="Start Date"
            placeholder="Select start date"
            value={editStartDate}
            onChange={setEditStartDate}
          />

          <DatePickerInput
            label="End Date"
            placeholder="Select end date"
            value={editEndDate}
            onChange={setEditEndDate}
          />

          <Textarea
            label="Notes"
            placeholder="Add any notes..."
            value={editNote}
            onChange={(e) => setEditNote(e.currentTarget.value)}
            minRows={3}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedRequest(null);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave} loading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        opened={confirmModalOpen}
        title={getConfirmationTitle()}
        message={getConfirmationMessage()}
        confirmText={
          actionType === "approve"
            ? "Approve"
            : actionType === "reject"
              ? "Reject"
              : "Delete"
        }
        isDangerous={actionType === "delete" || actionType === "reject"}
        isLoading={isUpdatingStatus || isDeleting}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setConfirmModalOpen(false);
          setActionType(null);
          setSelectedRequest(null);
        }}
      />
    </div>
  );
}

export default LeaveRequestsTab;
