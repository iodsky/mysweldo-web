import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Button,
  Menu,
  Modal,
  Select,
  Table,
  Text,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { BsPencil, BsPlus, BsThreeDotsVertical } from "react-icons/bs";
import {
  createAttendance,
  getAllAttendances,
  getEmployeeAttendances,
  updateAttendance,
} from "@/api/attendance";
import type { AttendanceFilters } from "@/api/attendance";
import type { Attendance, AttendanceDto } from "@/types";
import PaginatedTable from "@/components/paginated-table";
import { getAllEmployees } from "@/api/employee";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

function Page() {
  const queryClient = useQueryClient();

  // Fetch attendance
  const [filters, setFilters] = useState<AttendanceFilters>({
    pageNo: 0,
    limit: 10,
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

  const { data: employeesData } = useQuery({
    queryKey: ["employees", "attendance-form"],
    queryFn: () =>
      getAllEmployees({
        pageNo: 0,
        limit: 100,
      }),
  });

  const { data, isError, isFetching } = useQuery({
    queryKey: [
      "attendances",
      selectedEmployeeId ? "employee" : "list",
      selectedEmployeeId,
      queryFilters,
    ],
    queryFn: () =>
      selectedEmployeeId
        ? getEmployeeAttendances(Number(selectedEmployeeId), filters)
        : getAllAttendances(filters),
    placeholderData: keepPreviousData,
  });

  // Add/Edit attendance
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAttendance, setSelectedAttendance] =
    useState<Attendance | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");

  const resetForm = () => {
    setSelectedAttendance(null);
    setEmployeeId("");
    setDate("");
    setTimeIn("");
    setTimeOut("");
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
    setEmployeeId(String(attendance.employeeId));
    setDate(attendance.date);
    setTimeIn(attendance.timeIn);
    setTimeOut(attendance.timeOut ?? "");
  };

  const createMutation = useMutation({
    mutationFn: (payload: AttendanceDto) => createAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      notifications.show({
        color: "green",
        title: "Success",
        message: "Attendance created successfully",
        withBorder: true,
      });
      setIsModalOpen(false);
      resetForm();
    },
    onError: handleApiError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AttendanceDto }) =>
      updateAttendance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      notifications.show({
        color: "green",
        title: "Success",
        message: "Attendance updated successfully",
        withBorder: true,
      });
      setIsModalOpen(false);
      resetForm();
    },
    onError: handleApiError,
  });

  const handleUpdate = () => {
    if (!employeeId || !date || !timeIn) return;

    const payload: AttendanceDto = {
      employeeId: Number(employeeId),
      date,
      timeIn,
      timeOut: timeOut || null,
    };

    if (modalMode === "create") {
      createMutation.mutate(payload);
      return;
    }

    if (!selectedAttendance) return;

    updateMutation.mutate({
      id: selectedAttendance.id,
      payload,
    });
  };

  const rows: Attendance[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  const employeeOptions = employeesData?.data
    ? employeesData.data.map((employee) => ({
        value: String(employee.id),
        label: `${employee.firstName} ${employee.lastName}`,
      }))
    : [];

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
              leftSection={<BsPlus size={14} />}
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
              heading={[
                "Employee",
                "Date",
                "Time In",
                "Time Out",
                "Total hours",
                "Overtime",
                "Actions",
              ]}
              isError={isError}
              errorMessage="Failed to load attendance records. Please try again or contact support."
              isFetching={isFetching}
              meta={meta}
              onPageChange={(page) =>
                setFilters((prev) => ({
                  ...prev,
                  pageNo: page - 1,
                }))
              }
              rows={rows.map((row: Attendance) => (
                <Table.Tr key={String(row.id)}>
                  <Table.Td>
                    <Text size="sm">
                      {`${row.employeeFirstName ?? ""} ${row.employeeLastName ?? ""}`.trim() ||
                        "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{row.date}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {typeof row.timeIn === "string"
                        ? row.timeIn.split(".")[0]
                        : "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {typeof row.timeOut === "string"
                        ? row.timeOut.split(".")[0]
                        : "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {typeof row.totalHours === "number"
                        ? row.totalHours
                        : "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {typeof row.overtimeHours === "number"
                        ? row.overtimeHours
                        : "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Menu shadow="md" position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" size="sm">
                          <BsThreeDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<BsPencil size={14} />}
                          onClick={() => handleEditAttendance(row)}
                        >
                          Edit
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
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
          <DateInput
            label="Date"
            valueFormat="YYYY-MM-DD"
            placeholder="YYYY-MM-DD"
            value={date ? new Date(`${date}T00:00:00`) : null}
            onChange={(nextDate) =>
              setDate(nextDate ? nextDate.split("T")[0] : "")
            }
          />
          <TimeInput
            label="Time in"
            value={timeIn ? timeIn.slice(0, 5) : ""}
            onChange={(e) => setTimeIn(e.target.value)}
          />
          <TimeInput
            label="Time out"
            value={timeOut ? timeOut.slice(0, 5) : ""}
            onChange={(e) => setTimeOut(e.target.value)}
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
