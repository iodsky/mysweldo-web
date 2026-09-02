import {
  Button,
  Modal,
  Select,
  Text,
  Textarea,
  Title,
  ActionIcon,
  Menu,
  Table,
  Tooltip,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  useCreateLeaveRequest,
  useGetMyLeaveRequests,
  useUpdateLeaveRequest,
  useDeleteLeaveRequest,
} from "@/api/generated/endpoints/leave-requests/leave-requests";
import { useGetMyLeaveCredits } from "@/api/generated/endpoints/leave-credits/leave-credits";
import { unwrapData, unwrapPage } from "@/api/helpers";
import type { PaginationFilters, LeaveType, LeaveRequest } from "@/types";
import type { LeaveCreditDto } from "@/api/generated/model";
import { notifications } from "@mantine/notifications";
import PaginatedTable from "@/components/paginated-table";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { BsPencil, BsThreeDotsVertical } from "react-icons/bs";
import { handleApiError } from "@/utils/error-handler";

function Page() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | string | null>(null);
  const [endDate, setEndDate] = useState<Date | string | null>(null);
  const [leaveType, setLeaveType] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [filters, setFilters] = useState<PaginationFilters>({
    pageNo: 0,
    limit: 10,
  });

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStartDate, setEditStartDate] = useState<Date | string | null>(
    null,
  );
  const [editEndDate, setEditEndDate] = useState<Date | string | null>(null);
  const [editLeaveType, setEditLeaveType] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<string>("");

  // Delete state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isFetching, isError } = useGetMyLeaveRequests(filters, {
    query: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
    },
  });

  const { data: leaveCredits } = useGetMyLeaveCredits({
    query: {
      staleTime: 1000 * 60 * 30, // 30 minutes
      gcTime: 1000 * 60 * 60 * 12, // 12 hours
    },
  });

  const {
    mutate: createLeave,
    isPending: isCreatePending,
    isError: isErrorSubmitting,
  } = useCreateLeaveRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/leave-requests"] });
        queryClient.invalidateQueries({ queryKey: ["/leave-credits"] });
        setIsModalOpen(false);
        setEditingId(null);
        setStartDate(null);
        setEndDate(null);
        setLeaveType(null);
        setNote("");
        setEditStartDate(null);
        setEditEndDate(null);
        setEditLeaveType(null);
        setEditNote("");
        notifications.show({
          title: "Success",
          color: "green",
          message: "Leave request submitted",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: updateLeave, isPending: isUpdatePending } =
    useUpdateLeaveRequest({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/leave-requests"] });
          setIsModalOpen(false);
          setEditingId(null);
          setStartDate(null);
          setEndDate(null);
          setLeaveType(null);
          setNote("");
          setEditStartDate(null);
          setEditEndDate(null);
          setEditLeaveType(null);
          setEditNote("");
          notifications.show({
            title: "Success",
            color: "green",
            message: "Leave request updated",
            withBorder: true,
          });
        },
        onError: handleApiError,
      },
    });

  const isPending = isCreatePending || isUpdatePending;

  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteLeaveRequest(
    {
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/leave-requests"] });
          setDeleteConfirmOpen(false);
          setDeletingId(null);
          notifications.show({
            title: "Success",
            color: "green",
            message: "Leave request deleted",
            withBorder: true,
          });
        },
        onError: handleApiError,
      },
    },
  );

  const pageData = unwrapPage<LeaveRequest>(data);
  const rows: LeaveRequest[] = pageData.content;
  const meta = pageData.meta;
  const credits = unwrapData<LeaveCreditDto[]>(leaveCredits) ?? [];

  const leaveTypeOptions = credits.map((credit) => ({
    value: credit.type ?? "",
    label: credit.type ?? "",
  }));

  const handleEditClick = (request: LeaveRequest) => {
    setEditingId(request.id ?? null);
    setEditStartDate(request.startDate ?? null);
    setEditEndDate(request.endDate ?? null);
    setEditLeaveType(request.leaveType ?? null);
    setEditNote(request.note || "");
    setIsModalOpen(true);
  };

  const handleDeleteClick = (requestId: string) => {
    setDeletingId(requestId);
    setDeleteConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setStartDate(null);
    setEndDate(null);
    setLeaveType(null);
    setNote("");
    setEditStartDate(null);
    setEditEndDate(null);
    setEditLeaveType(null);
    setEditNote("");
  };

  const handleSubmit = () => {
    const submitStartDate = editingId ? editStartDate : startDate;
    const submitEndDate = editingId ? editEndDate : endDate;
    const submitLeaveType = editingId ? editLeaveType : leaveType;
    const submitNote = editingId ? editNote : note;

    if (submitStartDate && submitEndDate && submitLeaveType) {
      const formatDate = (date: Date | string) => {
        if (typeof date === "string") return date;
        return date.toISOString().split("T")[0];
      };

      const payload = {
        startDate: formatDate(submitStartDate),
        endDate: formatDate(submitEndDate),
        leaveType: submitLeaveType as LeaveType,
        ...(submitNote && { note: submitNote }),
      };

      if (editingId) {
        updateLeave({ id: editingId, data: payload });
      } else {
        createLeave({ data: payload });
      }
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 flex-1">
        <Title>Leave</Title>

        <div>
          <Title order={3} mb="sm">
            Available Credits
          </Title>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {credits.map((credit) => (
              <div className="p-4 border rounded-md border-gray-300 bg-gray-50" key={credit.id}>
                <Text fw={600} mb="0.5rem">
                  {credit.type}
                </Text>
                <Text size="lg" fw={700} c="blue">
                  {credit.credits} days
                </Text>
                <Text size="sm" c="dimmed">
                  Effective: {credit.effectiveDate}
                </Text>
              </div>
            ))}
            {credits.length === 0 && (
              <Text c="dimmed">No leave credits available</Text>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Tooltip
            label="No leave credits available. Please contact HR or wait for credits to be assigned."
            disabled={credits.length > 0}
          >
            <Button
              disabled={credits.length === 0}
              onClick={() => {
                setEditingId(null);
                setStartDate(null);
                setEndDate(null);
                setLeaveType(null);
                setNote("");
                setEditStartDate(null);
                setEditEndDate(null);
                setEditLeaveType(null);
                setEditNote("");
                setIsModalOpen(true);
              }}
            >
              New Request
            </Button>
          </Tooltip>
        </div>

        {meta && (
          <PaginatedTable
            heading={[
              "Type",
              "Start date",
              "End date",
              "Status",
              "Notes",
              "Actions",
            ]}
            isError={isError}
            emptyMessage="No leave requests found"
            errorMessage="Failed to load your leave requests. Please try again."
            isFetching={isFetching}
            meta={meta}
            onPageChange={(page) =>
              setFilters((prev) => ({
                ...prev,
                pageNo: page - 1,
              }))
            }
            rows={rows.map((request) => (
              <Table.Tr key={String(request.id)}>
                <Table.Td>
                  <Text size="sm">{request.leaveType}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{request.startDate}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{request.endDate}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{request.status}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{request.note || "-"}</Text>
                </Table.Td>
                <Table.Td>
                  <Menu shadow="md" position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" size="sm">
                        <BsThreeDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<BsPencil size={14} />}
                        onClick={() => handleEditClick(request)}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<BsThreeDotsVertical size={14} />}
                        color="red"
                        onClick={() => handleDeleteClick(request.id ?? "")}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          />
        )}
      </div>

      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Edit Leave Request" : "New Leave Request"}
        size="md"
      >
        <div className="flex flex-col gap-4">
          {isErrorSubmitting && (
            <Text c="red" size="sm">
              Failed to save leave request
            </Text>
          )}
          <DatePickerInput
            label="Start Date"
            placeholder="Select start date"
            highlightToday
            value={editingId ? editStartDate : startDate}
            onChange={editingId ? setEditStartDate : setStartDate}
          />
          <DatePickerInput
            label="End Date"
            placeholder="Select end date"
            value={editingId ? editEndDate : endDate}
            onChange={editingId ? setEditEndDate : setEndDate}
          />
          <Select
            label="Leave Type"
            placeholder="Select leave type"
            data={leaveTypeOptions}
            value={editingId ? editLeaveType : leaveType}
            onChange={editingId ? setEditLeaveType : setLeaveType}
          />
          <Textarea
            label="Note"
            placeholder="Add any additional notes (optional)"
            value={editingId ? editNote : note}
            onChange={(e) =>
              editingId
                ? setEditNote(e.currentTarget.value)
                : setNote(e.currentTarget.value)
            }
            minRows={3}
          />
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit()}
              loading={isPending}
              disabled={
                editingId
                  ? !editStartDate || !editEndDate || !editLeaveType
                  : !startDate || !endDate || !leaveType
              }
            >
              {editingId ? "Update" : "Submit"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        opened={deleteConfirmOpen}
        title="Delete Leave Request"
        message="Are you sure you want to delete this leave request?"
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={() => deleteRequest({ id: deletingId! })}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        }}
      />
    </>
  );
}

export default Page;
