import { useState } from "react";
import {
  Button,
  Text,
  Modal,
  Select,
  Loader,
  Table,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { BsPlus } from "react-icons/bs";
import {
  useCreateLeaveCredits,
  useGetAllLeaveCredits,
} from "@/api/generated/endpoints/leave-credits/leave-credits";
import { useGetAllEmployees } from "@/api/generated/endpoints/employees/employees";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import type {
  EmployeeLeaveCredit,
  EmployeeBasic,
  LeaveType,
} from "@/types";
import { notifications } from "@mantine/notifications";
import { handleApiError } from "@/utils/error-handler";

const LEAVE_TYPES: LeaveType[] = [
  "VACATION",
  "SICK",
  "MATERNITY",
  "PATERNITY",
  "SOLO_PARENT",
  "BEREAVEMENT",
];

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  VACATION: "Vacation",
  SICK: "Sick",
  MATERNITY: "Maternity",
  PATERNITY: "Paternity",
  SOLO_PARENT: "Solo Parent",
  BEREAVEMENT: "Bereavement",
};

function LeaveCreditsTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [effectiveDate, setEffectiveDate] = useState<Date | string | null>(
    null,
  );

  const { data, isLoading, isFetching, isError } = useGetAllLeaveCredits(
    { pageNo: page, limit: 10 },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const { data: employeesData } = useGetAllEmployees(
    { pageNo: 0, limit: 100 },
    {
      query: {
        queryKey: ["employees"] as const,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
      },
    },
  );

  const pageData = unwrapPage<EmployeeLeaveCredit>(data);
  const credits: EmployeeLeaveCredit[] = pageData.content;
  const meta = pageData.meta;

  const { mutate: assignCredits, isPending: isAssigning } = useCreateLeaveCredits(
    {
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/leave-credits"] });
          setModalOpen(false);
          resetForm();
          notifications.show({
            title: "Success",
            color: "green",
            message: "Leave credits assigned successfully",
            withBorder: true,
          });
        },
        onError: handleApiError,
      },
    },
  );

  const resetForm = () => {
    setSelectedEmployeeId(null);
    setEffectiveDate(null);
  };

  const handleAssignSave = () => {
    if (!selectedEmployeeId || !effectiveDate) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Please fill in all required fields",
        withBorder: true,
      });
      return;
    }

    const dateStr =
      effectiveDate instanceof Date
        ? effectiveDate.toISOString().split("T")[0]
        : effectiveDate;

    assignCredits({
      data: {
        employeeId: Number(selectedEmployeeId),
        effectiveDate: dateStr,
      },
    });
  };

  const rows = credits.map((emp: EmployeeLeaveCredit) => (
    <Table.Tr key={emp.employeeId ?? ""}>
      <Table.Td>
        {emp.firstName ?? ""} {emp.lastName ?? ""}
      </Table.Td>
      {LEAVE_TYPES.map((type) => {
        const summary = (emp.credits ?? []).find((c) => c.type === type);
        return (
          <Table.Td key={type} ta="center">
            {summary != null ? summary.credits : "0"}
          </Table.Td>
        );
      })}
    </Table.Tr>
  ));

  return (
    <div className="flex flex-col gap-6 flex-1">
      <div className="flex justify-end">
        <Button leftSection={<BsPlus />} onClick={() => setModalOpen(true)}>
          Assign Credits
        </Button>
      </div>

      {isError && (
        <Text c="red" fw={500}>
          Failed to load leave credits
        </Text>
      )}

      {!isError && meta && (
        <PaginatedTable
          heading={[
            "Employee",
            ...LEAVE_TYPES.map((t) => LEAVE_TYPE_LABELS[t]),
          ]}
          rows={rows}
          meta={meta}
          onPageChange={(p) => setPage(p - 1)}
          isFetching={isFetching}
          isError={isError}
          emptyMessage="No leave credits found"
        />
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="Assign Leave Credits"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Employee"
            placeholder="Select employee"
            searchable
            data={
              unwrapPage<EmployeeBasic>(employeesData).content.map(
                (emp: EmployeeBasic) => ({
                  value: String(emp.id ?? ""),
                  label: `${emp.firstName ?? ""} ${emp.lastName ?? ""}`,
                }),
              )
            }
            value={selectedEmployeeId}
            onChange={setSelectedEmployeeId}
            required
          />

          <DatePickerInput
            label="Effective Date"
            placeholder="Select effective date"
            value={effectiveDate}
            onChange={setEffectiveDate}
            required
            highlightToday
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignSave} loading={isAssigning}>
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default LeaveCreditsTab;
