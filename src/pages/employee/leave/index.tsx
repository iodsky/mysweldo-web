import {
  Box,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createLeaveRequest,
  getOwnLeaveCredits,
  getOwnLeaveRequests,
  updateLeaveRequest,
  deleteLeaveRequest,
} from "../../../api/leave";
import type { LeaveRequest, PaginationFilters } from "../../../types";
import { notifications } from "@mantine/notifications";
import type { LeaveType } from "../../../types/leave";
import { PaginatedTable } from "../../../components/PaginatedTable";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import { MdEdit, MdDelete } from "react-icons/md";

function Leave() {
  const { user } = useAuth();
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

  const { data, isFetching, isError } = useQuery({
    queryKey: ["leaverRequests", user?.employeeId, filters],
    queryFn: () => getOwnLeaveRequests(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: leaveCredits } = useQuery({
    queryKey: ["leaveCredits", user?.employeeId],
    queryFn: getOwnLeaveCredits,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 12, // 12 hours
  });

  const {
    mutate,
    isPending,
    isError: isErrorSubmitting,
  } = useMutation({
    mutationFn: (request: {
      startDate: string;
      endDate: string;
      leaveType: LeaveType;
      note?: string;
    }) =>
      editingId
        ? updateLeaveRequest(editingId, request)
        : createLeaveRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leaverRequests", user?.employeeId],
      });
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
        message: editingId
          ? "Leave request updated"
          : "Leave request submitted",
        withBorder: true,
      });
    },
    onError: (error: unknown) => {
      const apiError = error as { status?: number; message?: string };
      notifications.show({
        title: "Error",
        color: "red",
        message: apiError?.message || "Failed to save leave request",
        withBorder: true,
      });
    },
  });

  const { mutate: deleteRequest, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteLeaveRequest(deletingId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leaverRequests", user?.employeeId],
      });
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      notifications.show({
        title: "Success",
        color: "green",
        message: "Leave request deleted",
        withBorder: true,
      });
    },
    onError: (error: unknown) => {
      const apiError = error as { status?: number; message?: string };
      notifications.show({
        title: "Error",
        color: "red",
        message: apiError?.message || "Failed to delete leave request",
        withBorder: true,
      });
    },
  });

  const rows: LeaveRequest[] = data?.data ? data.data : [];
  const meta = data?.meta;
  const credits = leaveCredits?.data || [];

  const leaveTypeOptions = credits.map((credit) => ({
    value: credit.type,
    label: credit.type,
  }));

  const handleEditClick = (request: LeaveRequest) => {
    setEditingId(request.id);
    setEditStartDate(request.startDate);
    setEditEndDate(request.endDate);
    setEditLeaveType(request.leaveType);
    setEditNote(request.note || "");
    setIsModalOpen(true);
  };

  const handleDeleteClick = (requestId: string) => {
    setDeletingId(requestId);
    setDeleteConfirmOpen(true);
  };

  const leaveColumns = [
    { key: "leaveType", label: "Type" },
    { key: "startDate", label: "Start date" },
    { key: "endDate", label: "End date" },
    { key: "status", label: "Status" },
    { key: "note", label: "Notes" },
    {
      key: "actions",
      label: "Actions",
      isAction: true,
      actions: [
        {
          label: "Edit",
          icon: <MdEdit size={16} />,
          onClick: (row: LeaveRequest) => handleEditClick(row),
        },
        {
          label: "Delete",
          icon: <MdDelete size={16} color="red" />,
          onClick: (row: LeaveRequest) => handleDeleteClick(row.id),
        },
      ],
    },
  ];

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

      mutate({
        startDate: formatDate(submitStartDate),
        endDate: formatDate(submitEndDate),
        leaveType: submitLeaveType as LeaveType,
        ...(submitNote && { note: submitNote }),
      });
    }
  };

  return (
    <>
      <Stack gap="md">
        <Title>Leave</Title>

        {/* Leave Credits Section */}
        <Box>
          <Title order={3} mb="sm">
            Available Credits
          </Title>
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {credits.map((credit) => (
              <Box
                key={credit.id}
                style={{
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Text fw={600} mb="0.5rem">
                  {credit.type}
                </Text>
                <Text size="lg" fw={700} c="blue">
                  {credit.credits} days
                </Text>
                <Text size="sm" c="dimmed">
                  Effective: {credit.effectiveDate}
                </Text>
              </Box>
            ))}
            {credits.length === 0 && (
              <Text c="dimmed">No leave credits available</Text>
            )}
          </Box>
        </Box>
        <Group justify="end">
          <Button
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
        </Group>
        <PaginatedTable
          columns={leaveColumns}
          rows={rows}
          isFetching={isFetching}
          isError={isError}
          errorMessage="Failed to retrieve leave requests"
          emptyMessage="No Leave Request found"
          meta={meta}
          onPreviousPage={() =>
            setFilters((prev) => ({
              ...prev,
              pageNo: prev.pageNo - 1,
            }))
          }
          onNextPage={() =>
            setFilters((prev) => ({
              ...prev,
              pageNo: prev.pageNo + 1,
            }))
          }
        />
      </Stack>

      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Edit Leave Request" : "New Leave Request"}
        size="md"
      >
        <Stack gap="md">
          {isErrorSubmitting && (
            <Text c="red" size="sm">
              Failed to save leave request
            </Text>
          )}
          <DatePickerInput
            label="Start Date"
            placeholder="Select start date"
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
          <Group justify="flex-end">
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
          </Group>
        </Stack>
      </Modal>

      <ConfirmationModal
        opened={deleteConfirmOpen}
        title="Delete Leave Request"
        message="Are you sure you want to delete this leave request?"
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={() => deleteRequest()}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        }}
      />
    </>
  );
}

export default Leave;
