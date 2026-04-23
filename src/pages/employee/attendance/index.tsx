import { Button, Group, Stack, Text, Box, Title } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  clockIn,
  clockOut,
  getEmployeeAttendances,
  type AttendanceFilters,
} from "../../../api/attendance";
import type { ApiError, Attendance } from "../../../types";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { PaginatedTable } from "../../../components/PaginatedTable";

function Attendance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [filters, setFilters] = useState<AttendanceFilters>({
    pageNo: 0,
    limit: 10,
    startDate: undefined,
    endDate: undefined,
  });

  const { data, isFetching, isError } = useQuery({
    queryKey: ["attendances", user?.employeeId, filters],
    queryFn: () => getEmployeeAttendances(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes - attendance changes frequently
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const { mutate: clockInFn, isPending: isClockInPending } = useMutation({
    mutationFn: clockIn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendances", user?.employeeId],
      });
      notifications.show({
        title: "Success",
        message: "You have successfully clocked in for the day",
        color: "green",
        withBorder: true,
      });
    },
    onError: (error: ApiError) => {
      notifications.show({
        title: "Attendance error",
        message: error.message ?? "An unexpected error has occured",
        color: "red",
        withBorder: true,
      });
    },
  });

  const { mutate: clockOutFn, isPending: isClockOutPending } = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendances", user?.employeeId],
      });
      notifications.show({
        title: "Success",
        message: "You have successfully clocked out for the day",
        color: "green",
        withBorder: true,
      });
    },
    onError: (error: ApiError) => {
      notifications.show({
        title: "Attendance error",
        message: error.message ?? "An unexpected error has occured",
        color: "red",
        withBorder: true,
      });
    },
  });

  const rows: Attendance[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  const attendanceColumns = [
    { key: "date", label: "Date" },
    { key: "timeIn", label: "Time In" },
    {
      key: "timeOut",
      label: "Time Out",
      render: (value: unknown) => (typeof value === "string" ? value : "-"),
    },
    {
      key: "totalHours",
      label: "Total Hours",
      render: (value: unknown) => (typeof value === "number" ? value : "-"),
    },
    {
      key: "overtimeHours",
      label: "Overtime",
      render: (value: unknown) => (typeof value === "number" ? value : "-"),
    },
  ];

  return (
    <Stack gap="md">
      {/* Header */}
      <div>
        <Title order={1}>Attendance</Title>
      </div>

      {/* Clock In/Out Buttons */}
      <Group justify="end">
        <Button onClick={() => clockInFn()} loading={isClockInPending}>
          Clock in
        </Button>
        <Button onClick={() => clockOutFn()} loading={isClockOutPending}>
          Clock out
        </Button>
      </Group>

      {/* Date Filters */}
      <Group align="flex-end">
        <DateInput
          label="Start Date"
          placeholder="Pick start date"
          value={filters.startDate ? new Date(filters.startDate) : null}
          valueFormat="YYYY-MM-DD"
          onChange={(date) =>
            setFilters((prev) => ({
              ...prev,
              startDate: date ? date.split("T")[0] : undefined,
              pageNo: 0,
            }))
          }
          clearable
        />
        <DateInput
          label="End Date"
          placeholder="Pick end date"
          value={filters.endDate ? new Date(filters.endDate) : null}
          valueFormat="YYYY-MM-DD"
          onChange={(date) =>
            setFilters((prev) => ({
              ...prev,
              endDate: date ? date.split("T")[0] : undefined,
              pageNo: 0,
            }))
          }
          clearable
        />
        <Button
          variant="light"
          onClick={() =>
            setFilters({
              pageNo: 0,
              limit: 10,
              startDate: undefined,
              endDate: undefined,
            })
          }
        >
          Clear Filters
        </Button>
      </Group>

      {/* Content */}
      <Box>
        {isError && (
          <Text c="red" fw={500}>
            Failed to load attendance data
          </Text>
        )}

        {!isError && (
          <>
            <PaginatedTable
              columns={attendanceColumns}
              rows={rows}
              isFetching={isFetching}
              isError={false}
              errorMessage="Failed to load attendance data"
              emptyMessage="No attendance records found"
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
          </>
        )}
      </Box>
    </Stack>
  );
}

export default Attendance;
