import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Text,
  Textarea,
  Title,
  Badge,
  Loader,
  ActionIcon,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  useCreateOvertimeRequest,
  useGetMyOvertimeRequests,
  useUpdateOvertimeRequest,
  useDeleteOvertimeRequest,
} from "@/api/generated/endpoints/overtime-requests/overtime-requests";
import { unwrapPage } from "@/api/helpers";
import type {
  OvertimeRequest,
  OvertimeRequestDto,
} from "@/types";
import type { GetMyOvertimeRequestsParams } from "@/api/generated/model";
import { notifications } from "@mantine/notifications";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { IconPencil, IconTrash } from "@tabler/icons-react";

function Page() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState<Date | string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [filters, setFilters] = useState<GetMyOvertimeRequestsParams>({
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

  const { data, isFetching, isError } = useGetMyOvertimeRequests(filters, {
    query: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
    },
  });

  const { mutate: submitRequest, isPending } = useCreateOvertimeRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/overtime-requests"] });
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
    },
  });

  const { mutate: updateRequest } = useUpdateOvertimeRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/overtime-requests"] });
        setIsModalOpen(false);
        setEditingId(null);
        setDate(null);
        setEditDate(null);
        setReason("");
        setEditReason("");
        notifications.show({
          title: "Success",
          color: "green",
          message: "Overtime request updated",
          withBorder: true,
        });
      },
    },
  });

  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteOvertimeRequest(
    {
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/overtime-requests"] });
          setDeleteConfirmOpen(false);
          setDeletingId(null);
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

  const pageData = unwrapPage<OvertimeRequest>(data);
  const requests: OvertimeRequest[] = pageData.content;
  const meta = pageData.meta;

  const handleSubmit = () => {
    const submitDate = editingId ? editDate : date;
    const submitReason = editingId ? editReason : reason;

    if (submitDate) {
      const formatDate = (dateValue: Date | string) => {
        if (typeof dateValue === "string") return dateValue;
        return dateValue.toISOString().split("T")[0];
      };

      const request = {
        date: formatDate(submitDate),
        ...(submitReason && { reason: submitReason }),
      } as OvertimeRequestDto;

      if (editingId) {
        updateRequest({ id: editingId, data: request });
      } else {
        submitRequest({ data: request });
      }
    }
  };

  const handleEditClick = (request: OvertimeRequest) => {
    setEditingId(request.id ?? null);
    setEditDate(request.date ?? null);
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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
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
        </div>

        {/* Overtime Requests Section */}
        <div>
          {isError && (
            <Text c="red" mb="md">
              Failed to retrieve overtime requests
            </Text>
          )}

          {isFetching && !requests.length ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
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
            <div className="flex flex-col gap-4">
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
                  <div className="flex justify-between mb-2.5">
                    <Box>
                      <Text fw={600} size="lg">
                        {request.date}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {request.overtimeHours} hours
                      </Text>
                    </Box>
                    <Group gap="xs">
                      <Badge color={getStatusColor(request.status ?? "")} size="lg">
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
                            <IconPencil size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => handleDeleteClick(request.id ?? "")}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      )}
                    </Group>
                  </div>

                  <Divider my="sm" />

                  {request.reason && (
                    <div className="mb-2.5">
                      <Text size="sm" fw={500} mb="0.25rem">
                        Reason:
                      </Text>
                      <Text size="sm" c="dimmed">
                        {request.reason}
                      </Text>
                    </div>
                  )}
                </Box>
              ))}

              {/* Pagination Controls */}
              {meta && ((meta.page ?? 0) > 0 || !(meta.last ?? true)) ? (
                <Group justify="center" mt="lg">
                  <Button
                    variant="outline"
                    disabled={meta.first ?? true}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        pageNo: (prev.pageNo ?? 0) - 1,
                      }))
                    }
                  >
                    Previous
                  </Button>
                  <Text size="sm" c="dimmed">
                    Page {meta ? (meta.page ?? 0) + 1 : 1}
                  </Text>
                  <Button
                    variant="outline"
                    disabled={meta.last ?? true}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        pageNo: (prev.pageNo ?? 0) + 1,
                      }))
                    }
                  >
                    Next
                  </Button>
                </Group>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Edit Overtime Request" : "New Overtime Request"}
        size="md"
      >
        <div className="flex flex-col gap-4">
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
        </div>
      </Modal>

      <ConfirmationModal
        opened={deleteConfirmOpen}
        title="Delete Overtime Request"
        message="Are you sure you want to delete this overtime request?"
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
