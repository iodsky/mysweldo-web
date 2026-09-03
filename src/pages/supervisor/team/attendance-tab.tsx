import { useState } from "react";
import { Button, Loader, Table, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { keepPreviousData } from "@tanstack/react-query";
import { useGetSubordinatesAttendances } from "@/api/generated/endpoints/attendance/attendance";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import type { Attendance } from "@/types";
import type { GetSubordinatesAttendancesParams } from "@/api/generated/model";

function AttendanceTab() {
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const params: GetSubordinatesAttendancesParams = {
    pageNo: page,
    limit: 10,
    startDate: startDate ?? undefined,
    endDate: endDate ?? undefined,
  };

  const { data, isLoading, isFetching, isError } = useGetSubordinatesAttendances(
    params,
    {
      query: {
        queryKey: ["subordinates", "attendances", page, startDate, endDate] as const,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const { content: rows, meta } = unwrapPage<Attendance>(data);

  return (
    <div className="flex flex-col gap-5 flex-1">
      <div className="flex items-end gap-2">
        <DateInput
          label="Start Date"
          placeholder="Pick start date"
          value={startDate}
          valueFormat="YYYY-MM-DD"
          onChange={(d) => {
            setStartDate(d);
            setPage(0);
          }}
          clearable
          highlightToday
        />
        <DateInput
          label="End Date"
          placeholder="Pick end date"
          value={endDate}
          valueFormat="YYYY-MM-DD"
          onChange={(d) => {
            setEndDate(d);
            setPage(0);
          }}
          clearable
          highlightToday
        />
        <Button
          variant="light"
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
            setPage(0);
          }}
        >
          Clear
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : (
        meta && (
          <PaginatedTable
            heading={["Employee", "Date", "Time In", "Time Out", "Total Hours"]}
            rows={rows.map((row: Attendance) => (
              <Table.Tr key={String(row.id)}>
                <Table.Td>
                  <Text size="sm">
                    {`${row.employeeFirstName ?? ""} ${row.employeeLastName ?? ""}`.trim() ||
                      "-"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.timeIn?.slice(0, 10) ?? "-"}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.timeIn?.slice(11, 16) ?? "-"}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.timeOut?.slice(11, 16) ?? "-"}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {typeof row.totalHours === "number" ? row.totalHours : "-"}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
            meta={meta}
            onPageChange={(p) => setPage(p - 1)}
            isFetching={isFetching}
            isError={isError}
            emptyMessage="No attendance records found"
          />
        )
      )}
    </div>
  );
}

export default AttendanceTab;