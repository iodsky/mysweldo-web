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
} from "../../../api/leave";
import type { LeaveRequest, PaginationFilters } from "../../../types";
import { notifications } from "@mantine/notifications";
import type { LeaveType } from "../../../types/leave";
import { PaginatedTable } from "../../../components/PaginatedTable";

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
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leaverRequests", user?.employeeId],
      });
      setIsModalOpen(false);
      setStartDate(null);
      setEndDate(null);
      setLeaveType(null);
      setNote("");
      notifications.show({
        title: "Success",
        color: "green",
        message: "Leave request submitted",
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

  const leaveColumns = [
    { key: "leaveType", label: "Type" },
    { key: "startDate", label: "Start date" },
    { key: "endDate", label: "End date" },
    { key: "status", label: "Status" },
    { key: "note", label: "Notes" },
  ];

  const handleSubmit = () => {
    if (startDate && endDate && leaveType) {
      const formatDate = (date: Date | string) => {
        if (typeof date === "string") return date;
        return date.toISOString().split("T")[0];
      };

      mutate({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        leaveType: leaveType as LeaveType,
        ...(note && { note }),
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
          <Button onClick={() => setIsModalOpen(true)}>New Request</Button>
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
        onClose={() => setIsModalOpen(false)}
        title="New Leave Request"
        size="md"
      >
        <Stack gap="md">
          {isErrorSubmitting && (
            <Text c="red" size="sm">
              Failed to create leave request
            </Text>
          )}
          <DatePickerInput
            label="Start Date"
            placeholder="Select start date"
            value={startDate}
            onChange={setStartDate}
          />
          <DatePickerInput
            label="End Date"
            placeholder="Select end date"
            value={endDate}
            onChange={setEndDate}
          />
          <Select
            label="Leave Type"
            placeholder="Select leave type"
            data={leaveTypeOptions}
            value={leaveType}
            onChange={setLeaveType}
          />
          <Textarea
            label="Note"
            placeholder="Add any additional notes (optional)"
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
            minRows={3}
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit()}
              loading={isPending}
              disabled={!startDate || !endDate || !leaveType}
            >
              Submit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default Leave;
