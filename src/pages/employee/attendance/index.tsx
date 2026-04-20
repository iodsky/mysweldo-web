import {
  Button,
  Container,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
  Box,
} from "@mantine/core";
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

  return (
    <Container py="md">
      <Stack gap="md">
        {/* Header */}
        <div>
          <Title order={1}>Attendance</Title>
        </div>

        {/* Clock In/Out Buttons */}
        <Group>
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
            <Stack gap="md">
              {isFetching && rows.length === 0 ? (
                <Group justify="center" py="xl">
                  <Loader size="sm" />
                </Group>
              ) : rows.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  No attendance records found
                </Text>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <Table striped highlightOnHover withTableBorder={true}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Time In</Table.Th>
                        <Table.Th>Time Out</Table.Th>
                        <Table.Th>Total Hours</Table.Th>
                        <Table.Th>Overtime</Table.Th>
                      </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                      {rows.map((row) => (
                        <Table.Tr key={row.id}>
                          <Table.Td>{row.date}</Table.Td>
                          <Table.Td>{row.timeIn}</Table.Td>
                          <Table.Td>{row.timeOut ?? "-"}</Table.Td>
                          <Table.Td>{row.totalHours ?? "-"}</Table.Td>
                          <Table.Td>{row.overtimeHours ?? "-"}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {rows.length > 0 && (
                <Group justify="space-between">
                  <Button
                    disabled={meta?.first}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        pageNo: prev.pageNo - 1,
                      }))
                    }
                  >
                    Previous
                  </Button>

                  <Text>
                    Page {meta?.page} of {meta?.totalPages}
                  </Text>

                  <Button
                    disabled={meta?.last}
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
              )}
            </Stack>
          )}
        </Box>
      </Stack>
    </Container>
  );
}

export default Attendance;
