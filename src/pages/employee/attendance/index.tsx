import { Button, Text, Title, Table } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useClockIn,
  useClockOut,
  useGetMyAttendances,
} from "@/api/generated/endpoints/attendance/attendance";
import { unwrapPage } from "@/api/helpers";
import type { Attendance } from "@/types";
import type { GetMyAttendancesParams } from "@/api/generated/model";
import { useState } from "react";
import PaginatedTable from "@/components/paginated-table";
import { handleApiError } from "@/utils/error-handler";

function Page() {
  const queryClient = useQueryClient();

  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState<GetMyAttendancesParams>({
    pageNo: 0,
    limit: pageSize,
    startDate: undefined,
    endDate: undefined,
  });

  const { data, isError, isFetching } = useGetMyAttendances(filters, {
    query: {
      placeholderData: keepPreviousData,
      staleTime: 1000 * 60 * 5, // 5 minutes - attendance changes frequently
      gcTime: 1000 * 60 * 60, // 1 hour
    },
  });

  const { mutate: clockInFn, isPending: isClockInPending } = useClockIn({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/attendances/me"] });
        notifications.show({
          title: "Success",
          message: "You have successfully clocked in for the day",
          color: "green",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const { mutate: clockOutFn, isPending: isClockOutPending } = useClockOut({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/attendances/me"] });
        notifications.show({
          title: "Success",
          message: "You have successfully clocked out for the day",
          color: "green",
          withBorder: true,
        });
      },
      onError: handleApiError,
    },
  });

  const pageData = unwrapPage<Attendance>(data);
  const rows: Attendance[] = pageData.content;
  const meta = pageData.meta;

  return (
    <div className="flex flex-col gap-4 flex-1">
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
              limit: pageSize,
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
          heading={["Date", "Time In", "Time Out", "Total Hours"]}
          isError={isError}
          emptyMessage="No attendances found"
          errorMessage="Failed to load your attendance records. Please try again."
          isFetching={isFetching}
          meta={meta} 
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setFilters((prev) => ({ ...prev, limit: size, pageNo: 0 }));
          }}
          onPageChange={(newPage) =>
            setFilters((prev) => ({
              ...prev,
              pageNo: newPage - 1,
            }))
          }
          rows={rows.map((attendance) => (
            <Table.Tr key={String(attendance.id)}>
              <Table.Td>
                <Text size="sm">{attendance.timeIn?.slice(0, 10) ?? "-"}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{attendance.timeIn?.slice(11, 16) ?? "-"}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{attendance.timeOut?.slice(11, 16) ?? "-"}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {typeof attendance.totalHours === "number"
                    ? attendance.totalHours
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
