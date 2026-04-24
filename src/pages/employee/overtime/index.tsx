import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  Title,
  Badge,
  Loader,
  ActionIcon,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  createOvertimeRequest,
  getOwnOvertimeRequests,
  updateOvertimeRequest,
  deleteOvertimeRequest,
  type OvertimeRequestDto,
} from "../../../api/overtime";
import type { OvertimeRequest, PaginationFilters } from "../../../types";
import { notifications } from "@mantine/notifications";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import { MdEdit, MdDelete } from "react-icons/md";

function Overtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState<Date | string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [filters, setFilters] = useState<PaginationFilters>({
    pageNo: 0,
    limit: 10,
  });

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<Date | string | null>(null);
  const [editReason, setEditReason] = useState<string>("");

  // Delete state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["overtimeRequests", user?.employeeId, filters],
    queryFn: () => getOwnOvertimeRequests(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (request: OvertimeRequestDto) =>
      editingId
        ? updateOvertimeRequest(editingId, request)
        : createOvertimeRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["overtimeRequests", user?.employeeId],
      });
      setIsModalOpen(false);
      setEditingId(null);
      setDate(null);
      setEditDate(null);
      setReason("");
      setEditReason("");
      notifications.show({
        title: "Success",
        color: "green",
        message: editingId
          ? "Overtime request updated"
          : "Overtime request submitted",
        withBorder: true,
      });
    },
    onError: (error: unknown) => {
      const apiError = error as { status?: number; message?: string };
      if (apiError?.status === 409) {
        notifications.show({
          title: "Already Exists",
          color: "yellow",
          message: "Overtime request already exists for this day",
          withBorder: true,
        });
      } else {
        notifications.show({
          title: "Error",
          color: "red",
          message: apiError?.message || "Failed to save overtime request",
          withBorder: true,
        });
      }
    },
  });

  const { mutate: deleteRequest, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteOvertimeRequest(deletingId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["overtimeRequests", user?.employeeId],
      });
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      notifications.show({
        title: "Success",
        color: "green",
        message: "Overtime request deleted",
        withBorder: true,
      });
    },
    onError: (error: unknown) => {
      const apiError = error as { status?: number; message?: string };
      notifications.show({
        title: "Error",
        color: "red",
        message: apiError?.message || "Failed to delete overtime request",
        withBorder: true,
      });
    },
  });

  const requests: OvertimeRequest[] = data?.data ? data.data : [];
  const meta = data?.meta;

  const handleSubmit = () => {
    const submitDate = editingId ? editDate : date;
    const submitReason = editingId ? editReason : reason;

    if (submitDate) {
      const formatDate = (dateValue: Date | string) => {
        if (typeof dateValue === "string") return dateValue;
        return dateValue.toISOString().split("T")[0];
      };

      const request: OvertimeRequestDto = {
        date: formatDate(submitDate),
        ...(submitReason && { reason: submitReason }),
      };

      mutate(request);
    }
  };

  const handleEditClick = (request: OvertimeRequest) => {
    setEditingId(request.id);
    setEditDate(request.date);
    setEditReason(request.reason || "");
    setIsModalOpen(true);
  };

  const handleDeleteClick = (requestId: string) => {
    setDeletingId(requestId);
    setDeleteConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDate(null);
    setEditDate(null);
    setReason("");
    setEditReason("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "green";
      case "REJECTED":
        return "red";
      case "PENDING":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title>Overtime Requests</Title>
          <Button
            onClick={() => {
              setEditingId(null);
              setDate(null);
              setEditDate(null);
              setReason("");
              setEditReason("");
              setIsModalOpen(true);
            }}
          >
            New Request
          </Button>
        </Group>

        {/* Overtime Requests Section */}
        <Box>
          {isError && (
            <Text c="red" mb="md">
              Failed to retrieve overtime requests
            </Text>
          )}

          {isFetching && !requests.length ? (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          ) : requests.length === 0 ? (
            <Box
              style={{
                padding: "2rem",
                textAlign: "center",
                border: "1px dashed #ddd",
                borderRadius: "4px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <Text c="dimmed">No overtime requests found</Text>
            </Box>
          ) : (
            <Stack gap="md">
              {requests.map((request) => (
                <Box
                  key={request.id}
                  style={{
                    padding: "1.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Group justify="space-between" mb="sm">
                    <Box>
                      <Text fw={600} size="lg">
                        {request.date}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {request.overtimeHours} hours
                      </Text>
                    </Box>
                    <Group gap="xs">
                      <Badge color={getStatusColor(request.status)} size="lg">
                        {request.status}
                      </Badge>
                      {request.status === "PENDING" && (
                        <Group gap={4}>
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            onClick={() => handleEditClick(request)}
                          >
                            <MdEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => handleDeleteClick(request.id)}
                          >
                            <MdDelete size={16} />
                          </ActionIcon>
                        </Group>
                      )}
                    </Group>
                  </Group>

                  <Divider my="sm" />

                  {request.reason && (
                    <Box mb="sm">
                      <Text size="sm" fw={500} mb="0.25rem">
                        Reason:
                      </Text>
                      <Text size="sm" c="dimmed">
                        {request.reason}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}

              {/* Pagination Controls */}
              {meta && (meta.page > 0 || !meta.last) ? (
                <Group justify="center" mt="lg">
                  <Button
                    variant="outline"
                    disabled={meta.first}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        pageNo: prev.pageNo - 1,
                      }))
                    }
                  >
                    Previous
                  </Button>
                  <Text size="sm" c="dimmed">
                    Page {meta ? meta.page + 1 : 1}
                  </Text>
                  <Button
                    variant="outline"
                    disabled={meta.last}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        pageNo: prev.pageNo + 1,
                      }))
                    }
                  >
                    Next
                  </Button>
                </Group>
              ) : null}
            </Stack>
          )}
        </Box>
      </Stack>

      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Edit Overtime Request" : "New Overtime Request"}
        size="md"
      >
        <Stack gap="md">
          <DatePickerInput
            label="Date"
            placeholder="Select date"
            value={editingId ? editDate : date}
            onChange={editingId ? setEditDate : setDate}
            required
          />
          <Textarea
            label="Reason"
            placeholder="Add reason for overtime (optional)"
            value={editingId ? editReason : reason}
            onChange={(e) =>
              editingId
                ? setEditReason(e.currentTarget.value)
                : setReason(e.currentTarget.value)
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
              disabled={editingId ? !editDate : !date}
            >
              {editingId ? "Update" : "Submit"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ConfirmationModal
        opened={deleteConfirmOpen}
        title="Delete Overtime Request"
        message="Are you sure you want to delete this overtime request?"
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

export default Overtime;
