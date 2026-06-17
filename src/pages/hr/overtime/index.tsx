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
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { BsPlus, BsThreeDotsVertical, BsCheck, BsX } from "react-icons/bs";
import { MdDeleteOutline, MdOutlineModeEdit } from "react-icons/md";
import {
  getAllOvertimeRequests,
  createOvertimeRequest,
  updateOvertimeRequest,
  updateOvertimeRequestStatus,
  deleteOvertimeRequest,
} from "@/api/overtime";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type {
  OvertimeRequest,
  OvertimeRequestDto,
  RequestStatus,
} from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";
import { getAllEmployees } from "@/api/employee";

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: "yellow",
  APPROVED: "green",
  REJECTED: "red",
};

const formatDate = (d: Date | string) =>
  typeof d === "string" ? d : d.toISOString().split("T")[0];

function Page() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string | null>(null);
  const [createReason, setCreateReason] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [editReason, setEditReason] = useState("");

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "delete" | null
  >(null);
  const [selectedRequest, setSelectedRequest] =
    useState<OvertimeRequest | null>(null);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  const { data: employeesData } = useQuery({
    queryKey: ["employees", "attendance-form"],
    queryFn: () =>
      getAllEmployees({
        pageNo: 0,
        limit: 100,
      }),
  });

  const employeeOptions = employeesData?.data
    ? employeesData.data.map((employee) => ({
        value: String(employee.id),
        label: `${employee.firstName} ${employee.lastName}`,
      }))
    : [];

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["overtimeRequests", "all", page, startDate, endDate],
    queryFn: () =>
      getAllOvertimeRequests({
        pageNo: page,
        limit: 10,
        startDate: startDate ? formatDate(startDate) : undefined,
        endDate: endDate ? formatDate(endDate) : undefined,
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  const requests = data?.data || [];
  const meta = data?.meta;

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: ["overtimeRequests", "all"] });

  const { mutate: createRequest, isPending: isCreating } = useMutation({
    mutationFn: (dto: OvertimeRequestDto) => createOvertimeRequest(dto),
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
    onError: handleApiError,
  });

  const { mutate: updateRequest, isPending: isUpdating } = useMutation({
    mutationFn: (dto: OvertimeRequestDto) =>
      updateOvertimeRequest(selectedRequest!.id, dto),
    onSuccess: () => {
      invalidateList();
      setEditModalOpen(false);
      setSelectedRequest(null);
      notifications.show({
        title: "Success",
        color: "green",
        message: "Overtime request updated",
        withBorder: true,
      });
    },
    onError: handleApiError,
  });

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (status: RequestStatus) =>
      updateOvertimeRequestStatus(selectedRequest!.id, status),
    onSuccess: () => {
      invalidateList();
      setConfirmModalOpen(false);
      setActionType(null);
      setSelectedRequest(null);
      notifications.show({
        title: "Success",
        color: "green",
        message: `Overtime request ${actionType}d`,
        withBorder: true,
      });
    },
    onError: handleApiError,
  });

  const { mutate: deleteRequest, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteOvertimeRequest(selectedRequest!.id),
    onSuccess: () => {
      invalidateList();
      setConfirmModalOpen(false);
      setActionType(null);
      setSelectedRequest(null);
      notifications.show({
        title: "Success",
        color: "green",
        message: "Overtime request deleted",
        withBorder: true,
      });
    },
    onError: handleApiError,
  });

  const handleEditClick = (request: OvertimeRequest) => {
    setSelectedRequest(request);
    setEditDate(request.date);
    setEditReason(request.reason || "");
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    updateRequest({
      date: formatDate(editDate!),
      ...(editReason && { reason: editReason }),
    });
  };

  const handleCreateSave = () => {
    createRequest({
      date: formatDate(createDate!),
      employeeId: selectedEmployeeId!,
      ...(createReason && { reason: createReason }),
    });
  };

  const handleConfirmAction = () => {
    if (actionType === "approve") updateStatus("APPROVED");
    else if (actionType === "reject") updateStatus("REJECTED");
    else if (actionType === "delete") deleteRequest();
  };

  const getConfirmationTitle = () => {
    if (actionType === "approve") return "Approve Overtime Request";
    if (actionType === "reject") return "Reject Overtime Request";
    return "Delete Overtime Request";
  };

  const getConfirmationMessage = () => {
    if (actionType === "approve")
      return "Are you sure you want to approve this overtime request?";
    if (actionType === "reject")
      return "Are you sure you want to reject this overtime request?";
    return "Are you sure you want to delete this overtime request?";
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
          leftSection={<BsPlus size={16} />}
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
        <div className="flex items-end gap-2">
          <DateInput
            label="Start Date"
            placeholder="Pick start date"
            value={startDate}
            valueFormat="YYYY-MM-DD"
            onChange={(d) => {
              setStartDate(d);
              setPage(0);
            }}
            clearable
            highlightToday
          />
          <DateInput
            label="End date"
            placeholder="Pick end date"
            value={endDate}
            valueFormat="YYYY-MM-DD"
            onChange={(d) => {
              setEndDate(d);
              setPage(0);
            }}
            clearable
            highlightToday
          />
        </div>
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
            <Table.Tr key={request.id}>
              <Table.Td>{request.employeeId}</Table.Td>
              <Table.Td>{request.date}</Table.Td>
              <Table.Td>{request.overtimeHours}</Table.Td>
              <Table.Td>{request.reason || "-"}</Table.Td>
              <Table.Td>
                <Badge color={STATUS_COLORS[request.status]}>
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
                      <BsThreeDotsVertical />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<MdOutlineModeEdit />}
                      onClick={() => handleEditClick(request)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<BsCheck />}
                      onClick={() => {
                        setSelectedRequest(request);
                        setActionType("approve");
                        setConfirmModalOpen(true);
                      }}
                    >
                      Approve
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<BsX />}
                      onClick={() => {
                        setSelectedRequest(request);
                        setActionType("reject");
                        setConfirmModalOpen(true);
                      }}
                    >
                      Reject
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<MdDeleteOutline />}
                      color="red"
                      onClick={() => {
                        setSelectedRequest(request);
                        setActionType("delete");
                        setConfirmModalOpen(true);
                      }}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
          meta={meta}
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
          setSelectedRequest(null);
        }}
        title="Edit Overtime Request"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Employee ID
            </Text>
            <Text>{selectedRequest?.employeeId}</Text>
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
                setSelectedRequest(null);
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

export default Page;
