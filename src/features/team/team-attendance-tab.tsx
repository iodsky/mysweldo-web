import { useState } from "react";
import { Loader } from "@mantine/core";
import { keepPreviousData } from "@tanstack/react-query";
import { useGetSubordinatesAttendances } from "@/api/generated/endpoints/attendance/attendance";
import { unwrapPage } from "@/api/helpers";
import { DateRangeFilter } from "@/components/date-range-filter";
import { AttendanceTable } from "@/features/attendance/attendance-table";
import type { Attendance } from "@/types";
import type { GetSubordinatesAttendancesParams } from "@/api/generated/model";

function AttendanceTab() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const params: GetSubordinatesAttendancesParams = {
    pageNo: page,
    limit: pageSize,
    startDate: startDate ?? undefined,
    endDate: endDate ?? undefined,
  };

  const { data, isLoading, isFetching, isError } = useGetSubordinatesAttendances(
    params,
    {
      query: {
        queryKey: ["subordinates", "attendances", page, pageSize, startDate, endDate] as const,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const { content: rows, meta } = unwrapPage<Attendance>(data);

  return (
    <div className="flex flex-col gap-5 flex-1">
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(d) => {
          setStartDate(d);
          setPage(0);
        }}
        onEndDateChange={(d) => {
          setEndDate(d);
          setPage(0);
        }}
        onClear={() => {
          setStartDate(null);
          setEndDate(null);
          setPage(0);
        }}
        clearLabel="Clear"
      />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : (
        meta && (
          <AttendanceTable
            rows={rows}
            meta={meta}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPage(0);
              setPageSize(size);
            }}
            onPageChange={(p) => setPage(p - 1)}
            isFetching={isFetching}
            isError={isError}
            emptyMessage="No attendance records found"
            showEmployee
          />
        )
      )}
    </div>
  );
}

export default AttendanceTab;