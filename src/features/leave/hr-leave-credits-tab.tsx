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
import { IconPlus } from "@tabler/icons-react";
import {
  useCreateLeaveCredits,
  useGetAllLeaveCredits,
} from "@/api/generated/endpoints/leave-credits/leave-credits";
import { unwrapPage } from "@/api/helpers";
import PaginatedTable from "@/components/paginated-table";
import type {
  EmployeeLeaveCredit,
} from "@/types";
import { notifications } from "@mantine/notifications";
import { LEAVE_TYPES, LEAVE_TYPE_LABELS } from "@/features/leave/leave-types";
import { formatDate } from "@/utils/date";
import { useEmployeeOptions } from "@/hooks/use-employee-options";

function LeaveCreditsTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [effectiveDate, setEffectiveDate] = useState<Date | string | null>(
    null,
  );

  const { data, isLoading, isFetching, isError } = useGetAllLeaveCredits(
    { pageNo: page, limit: pageSize },
    {
      query: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    },
  );

  const { options: employeeOptions } = useEmployeeOptions({
    queryKey: ["employees"],
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

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

    const dateStr = formatDate(effectiveDate);

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
        <Button leftSection={<IconPlus />} onClick={() => setModalOpen(true)}>
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
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPage(0);
            setPageSize(size);
          }}
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
            data={employeeOptions}
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
