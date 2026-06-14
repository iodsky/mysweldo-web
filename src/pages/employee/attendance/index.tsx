import { Button, Text, Title, Table } from "@mantine/core";
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
  getOwnAttendances,
  type AttendanceFilters,
} from "@/api/attendance";
import type { Attendance } from "@/types";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import PaginatedTable from "@/components/paginated-table";
import { handleApiError } from "@/utils/error-handler";

function Page() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [filters, setFilters] = useState<AttendanceFilters>({
    pageNo: 0,
    limit: 10,
    startDate: undefined,
    endDate: undefined,
  });

  const { data, isError, isFetching } = useQuery({
    queryKey: ["attendances", user?.employeeId, filters],
    queryFn: () => getOwnAttendances(filters),
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
    onError: handleApiError,
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
    onError: handleApiError,
  });

  const rows: Attendance[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-4"> 
      <Title order={1}>Attendance</Title>

      <div className="flex justify-end gap-4">
        <Button onClick={() => clockInFn()} loading={isClockInPending}>
          Clock in
        </Button>
        <Button onClick={() => clockOutFn()} loading={isClockOutPending}>
          Clock out
        </Button>
      </div>

      {/* Date Filters */}
      <div className="flex items-end gap-4 ">
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
          highlightToday
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
          highlightToday
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
      </div>  

      {meta && (
        <PaginatedTable
          heading={["Date", "Time In", "Time Out", "Total Hours", "Overtime"]}
          isError={isError}
          emptyMessage="No attendances found"
          errorMessage="Failed to load your attendance records. Please try again."
          isFetching={isFetching}
          meta={meta} 
          onPageChange={(newPage) =>
            setFilters((prev) => ({
              ...prev,
              pageNo: newPage - 1,
            }))
          }
          rows={rows.map((attendance) => (
            <Table.Tr key={String(attendance.id)}>
              <Table.Td>
                <Text size="sm">{attendance.date}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {typeof attendance.timeIn === "string"
                    ? attendance.timeIn.split(".")[0]
                    : "-"}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {typeof attendance.timeOut === "string"
                    ? attendance.timeOut.split(".")[0]
                    : "-"}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {typeof attendance.totalHours === "number"
                    ? attendance.totalHours
                    : "-"}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {typeof attendance.overtimeHours === "number"
                    ? attendance.overtimeHours
                    : "-"}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        />
      )}
    </div>
  );
}

export default Page;
