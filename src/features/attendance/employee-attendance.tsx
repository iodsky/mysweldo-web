import { Button, Title } from "@mantine/core";
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
import { DateRangeFilter } from "@/components/date-range-filter";
import { AttendanceTable } from "@/features/attendance/attendance-table";

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
      <DateRangeFilter
        startDate={filters.startDate ?? null}
        endDate={filters.endDate ?? null}
        onStartDateChange={(date) =>
          setFilters((prev) => ({
            ...prev,
            startDate: date ?? undefined,
            pageNo: 0,
          }))
        }
        onEndDateChange={(date) =>
          setFilters((prev) => ({
            ...prev,
            endDate: date ?? undefined,
            pageNo: 0,
          }))
        }
        onClear={() =>
          setFilters({
            pageNo: 0,
            limit: pageSize,
            startDate: undefined,
            endDate: undefined,
          })
        }
      />  

      {meta && (
        <AttendanceTable
          rows={rows}
          meta={meta}
          isFetching={isFetching}
          isError={isError}
          emptyMessage="No attendances found"
          errorMessage="Failed to load your attendance records. Please try again."
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
        />
      )}
    </div>
  );
}

export default Page;
