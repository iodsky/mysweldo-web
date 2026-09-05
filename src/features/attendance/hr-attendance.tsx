import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Button,
  Menu,
  Modal,
  Select,
  Text,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { IconPencil, IconPlus, IconDotsVertical } from "@tabler/icons-react";
import {
  useCreateAttendance,
  useGetAllAttendances,
  useGetEmployeeAttendances,
  useUpdateAttendance,
} from "@/api/generated/endpoints/attendance/attendance";
import { unwrapPage } from "@/api/helpers";
import type { Attendance, AttendanceDto } from "@/types";
import type { GetAllAttendancesParams } from "@/api/generated/model";
import { notifications } from "@mantine/notifications";
import {
  formatDateTimePickerValue,
  toIsoDateTime,
} from "@/utils/date";
import { useEmployeeOptions } from "@/hooks/use-employee-options";
import { DateRangeFilter } from "@/components/date-range-filter";
import { AttendanceTable } from "@/features/attendance/attendance-table";

function Page() {
  const queryClient = useQueryClient();

  const [pageSize, setPageSize] = useState(10);

  // Fetch attendance
  const [filters, setFilters] = useState<GetAllAttendancesParams>({
    pageNo: 0,
    limit: pageSize,
    startDate: undefined,
    endDate: undefined,
  });

  const queryFilters = {
    pageNo: filters.pageNo,
    limit: filters.limit,
    startDate: filters.startDate,
    endDate: filters.endDate,
  };

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  const { options: employeeOptions } = useEmployeeOptions({
    queryKey: ["employees", "attendance-form"],
  });

  const { data: allData, isError, isFetching } = useGetAllAttendances(
    queryFilters,
    {
      query: {
        enabled: !selectedEmployeeId,
        placeholderData: keepPreviousData,
      },
    },
  );

  const { data: empData } = useGetEmployeeAttendances(
    Number(selectedEmployeeId),
    queryFilters,
    {
      query: {
        enabled: !!selectedEmployeeId,
        placeholderData: keepPreviousData,
      },
    },
  );

  const data = selectedEmployeeId ? empData : allData;

  // Add/Edit attendance
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAttendance, setSelectedAttendance] =
    useState<Attendance | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [timeIn, setTimeIn] = useState<string | null>(null);
  const [timeOut, setTimeOut] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedAttendance(null);
    setEmployeeId("");
    setTimeIn(null);
    setTimeOut(null);
  };

  const openCreateAttendance = () => {
    resetForm();
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditAttendance = (attendance: Attendance) => {
    setModalMode("edit");
    setIsModalOpen(true);
    setSelectedAttendance(attendance);
    setEmployeeId(String(attendance.employeeId ?? ""));
    setTimeIn(attendance.timeIn ? formatDateTimePickerValue(attendance.timeIn) : null);
    setTimeOut(
      attendance.timeOut ? formatDateTimePickerValue(attendance.timeOut) : null,
    );
  };

  const createMutation = useCreateAttendance({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/attendances"] });
        notifications.show({
          color: "green",
          title: "Success",
          message: "Attendance created successfully",
          withBorder: true,
        });
        setIsModalOpen(false);
        resetForm();
      },
    },
  });

  const updateMutation = useUpdateAttendance({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/attendances"] });
        notifications.show({
          color: "green",
          title: "Success",
          message: "Attendance updated successfully",
          withBorder: true,
        });
        setIsModalOpen(false);
        resetForm();
      },
    },
  });

  const handleUpdate = () => {
    if (!employeeId || !timeIn || !timeOut) return;

    const payload: AttendanceDto = {
      employeeId: Number(employeeId),
      timeIn: toIsoDateTime(timeIn),
      timeOut: toIsoDateTime(timeOut),
    };

    if (modalMode === "create") {
      createMutation.mutate({ data: payload });
      return;
    }

    if (!selectedAttendance?.id) return;

    updateMutation.mutate({ id: selectedAttendance.id, data: payload });
  };

  const pageData = unwrapPage<Attendance>(data);
  const rows: Attendance[] = pageData.content;
  const meta = pageData.meta;

  return (
    <>
      <div className="flex flex-col flex-1 gap-5 p-5">
        <Breadcrumbs>
            <Text size="sm">HR</Text>
            <Anchor size="sm">Attendances</Anchor>
          </Breadcrumbs>

          <div className="flex justify-between items-center">
            <div>
              <Text size="lg" fw={700}>
                Attendance Management
              </Text>
              <Text size="sm" c="dimmed">
                Track and manage employee attendances
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={14} />}
              onClick={openCreateAttendance}
            >
              New attendance
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <Select
              label="Employee"
              placeholder="All employees"
              data={employeeOptions}
              value={selectedEmployeeId}
              onChange={(value) => {
                setSelectedEmployeeId(value);
                setFilters((prev) => ({ ...prev, pageNo: 0 }));
              }}
              searchable
              clearable
              w={280}
            />
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
          </div>

          {meta && (
            <AttendanceTable
              rows={rows}
              meta={meta}
              isFetching={isFetching}
              isError={isError}
              errorMessage="Failed to load attendance records. Please try again or contact support."
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setFilters((prev) => ({ ...prev, limit: size, pageNo: 0 }));
              }}
              onPageChange={(page) =>
                setFilters((prev) => ({
                  ...prev,
                  pageNo: page - 1,
                }))
              }
              showEmployee
              renderActions={(row) => (
                <Menu shadow="md" position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconPencil size={14} />}
                      onClick={() => handleEditAttendance(row)}
                    >
                      Edit
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            />
          )}
      </div>

      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={modalMode === "create" ? "New attendance" : "Edit attendance"}
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Employee"
            placeholder="Select employee"
            data={employeeOptions}
            value={employeeId}
            onChange={(value) => setEmployeeId(value || "")}
            searchable
            clearable={modalMode === "create"}
            disabled={modalMode === "edit"}
          />
          <DateTimePicker
            label="Time in"
            placeholder="Pick date and time"
            value={timeIn}
            onChange={(value) => setTimeIn(value)}
            valueFormat="YYYY-MM-DD HH:mm"
            clearable={modalMode === "create"}
          />
          <DateTimePicker
            label="Time out"
            placeholder="Pick date and time"
            value={timeOut}
            onChange={(value) => setTimeOut(value)}
            valueFormat="YYYY-MM-DD HH:mm"
            clearable={modalMode === "create"}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleUpdate}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {modalMode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Page;
