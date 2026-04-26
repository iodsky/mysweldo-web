import { useState } from "react";
import {
  Container,
  Stack,
  Text,
  Title,
  Card,
  Group,
  Badge,
  Grid,
  Loader,
  Center,
  Pagination,
  Button,
  Modal,
  Divider,
  Table,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { getEmployeePayslips, type PayslipsFilter } from "../../../api/payroll";
import type { Payslip } from "../../../types";

function PayslipPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<PayslipsFilter>({
    pageNo: 0,
    limit: 10,
  });
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["payslips", user?.employeeId, filters],
    queryFn: () => getEmployeePayslips(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const payslips: Payslip[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  const handlePeriodChange = (value: string | null) => {
    setSelectedPeriod(value);
    if (value) {
      // Extract YYYY-MM from the date string (handles both YYYY-MM-DD and YYYY-MM formats)
      const period = value.substring(0, 7);
      setFilters((prev) => ({
        ...prev,
        period,
        pageNo: 0, // Reset to first page
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        period: undefined,
        pageNo: 0,
      }));
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      pageNo: page - 1, // Pagination component uses 1-based indexing
    }));
  };

  const handleViewDetails = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayslip(null);
  };

  if (isError) {
    return (
      <Container>
        <Center className="h-screen">
          <Stack align="center" gap="md">
            <Text size="lg" fw={700} c="red">
              Failed to load payslips
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>Payslips</Title>
            <Text size="sm" c="dimmed" mt={4}>
              View your payslips and earning details
            </Text>
          </div>
          <MonthPickerInput
            label="Filter by Period"
            placeholder="Select period"
            value={selectedPeriod}
            onChange={handlePeriodChange}
            clearable
          />
        </Group>

        {/* Loading State */}
        {isFetching && payslips.length === 0 && (
          <Center className="h-96">
            <Loader size="xl" />
          </Center>
        )}

        {/* Empty State */}
        {!isFetching && payslips.length === 0 && (
          <Center className="h-96">
            <Stack align="center" gap="md">
              <Text size="lg" c="dimmed">
                No payslips found
              </Text>
            </Stack>
          </Center>
        )}

        {/* Payslips Grid */}
        {payslips.length > 0 && (
          <Grid>
            {payslips.map((payslip) => (
              <Grid.Col key={payslip.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    {/* Header */}
                    <Group justify="space-between" align="flex-start">
                      <div>
                        <Text fw={600} size="sm">
                          {payslip.employeeName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {payslip.designation}
                        </Text>
                      </div>
                      <Badge size="sm" variant="light">
                        {payslip.periodStartDate} to {payslip.periodEndDate}
                      </Badge>
                    </Group>

                    {/* Attendance Info */}
                    <div>
                      <Text size="xs" fw={500} c="dimmed" mb={4}>
                        Attendance
                      </Text>
                      <Group grow>
                        <div>
                          <Text size="sm" fw={600}>
                            {payslip.daysWorked}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Days Worked
                          </Text>
                        </div>
                        <div>
                          <Text size="sm" fw={600}>
                            {payslip.absences}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Absences
                          </Text>
                        </div>
                      </Group>
                    </div>

                    {/* Overtime */}
                    {payslip.overtimeMinutes > 0 && (
                      <div>
                        <Text size="xs" fw={500} c="dimmed" mb={4}>
                          Overtime
                        </Text>
                        <Group>
                          <div>
                            <Text size="sm" fw={600}>
                              {Math.round(payslip.overtimeMinutes / 60)} hrs
                            </Text>
                            <Text size="xs" c="dimmed">
                              Hours
                            </Text>
                          </div>
                          <div>
                            <Text size="sm" fw={600}>
                              ₱{payslip.overtimePay.toFixed(2)}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Pay
                            </Text>
                          </div>
                        </Group>
                      </div>
                    )}

                    {/* Pay Summary */}
                    <Stack gap={8}>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Gross Pay
                        </Text>
                        <Text size="sm" fw={600}>
                          ₱{payslip.grossPay.toFixed(2)}
                        </Text>
                      </Group>
                      {payslip.totalBenefits > 0 && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Benefits
                          </Text>
                          <Text size="sm" fw={600} c="green">
                            +₱{payslip.totalBenefits.toFixed(2)}
                          </Text>
                        </Group>
                      )}
                      {payslip.totalDeductions > 0 && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Deductions
                          </Text>
                          <Text size="sm" fw={600} c="red">
                            -₱{payslip.totalDeductions.toFixed(2)}
                          </Text>
                        </Group>
                      )}
                      <Group justify="space-between" className="border-t pt-2">
                        <Text size="sm" fw={700}>
                          Net Pay
                        </Text>
                        <Text size="md" fw={700} c="blue">
                          ₱{payslip.netPay.toFixed(2)}
                        </Text>
                      </Group>
                    </Stack>

                    {/* View Details Button */}
                    <Button
                      variant="light"
                      fullWidth
                      size="sm"
                      onClick={() => handleViewDetails(payslip)}
                    >
                      View Details
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {payslips.length > 0 && meta && meta.totalPages > 1 && (
          <Group justify="center">
            <Pagination
              value={meta.page + 1}
              onChange={handlePageChange}
              total={meta.totalPages}
              disabled={isFetching}
            />
          </Group>
        )}
      </Stack>

      {/* Payslip Details Modal */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={`Payslip Details - ${selectedPayslip?.periodStartDate || ""} to ${selectedPayslip?.periodEndDate || ""}`}
        size="lg"
        styles={{
          body: {
            maxHeight: "70vh",
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
        }}
      >
        {selectedPayslip && (
          <Stack gap="md">
            {/* Employee Information */}
            <div>
              <Group justify="space-between" mb="md">
                <div>
                  <Text fw={700} size="lg">
                    {selectedPayslip.employeeName}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedPayslip.designation}
                  </Text>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Text size="sm" c="dimmed">
                    Employee ID
                  </Text>
                  <Text fw={600} size="md">
                    {selectedPayslip.employeeId}
                  </Text>
                </div>
              </Group>
              <Divider />
            </div>

            {/* Attendance Information */}
            <div>
              <Text fw={600} mb="sm">
                Attendance
              </Text>
              <Group grow>
                <div>
                  <Text size="xs" c="dimmed">
                    Days Worked
                  </Text>
                  <Text fw={600}>{selectedPayslip.daysWorked}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Absences
                  </Text>
                  <Text fw={600}>{selectedPayslip.absences}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Tardiness (mins)
                  </Text>
                  <Text fw={600}>{selectedPayslip.tardinessMinutes}</Text>
                </div>
              </Group>
              <Group grow mt="sm">
                <div>
                  <Text size="xs" c="dimmed">
                    Undertime (mins)
                  </Text>
                  <Text fw={600}>{selectedPayslip.undertimeMinutes}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Overtime (mins)
                  </Text>
                  <Text fw={600}>{selectedPayslip.overtimeMinutes || 0}</Text>
                </div>
              </Group>
              <Divider my="md" />
            </div>

            {/* Rates */}
            <div>
              <Text fw={600} mb="sm">
                Rates
              </Text>
              <Group grow>
                <div>
                  <Text size="xs" c="dimmed">
                    Monthly Rate
                  </Text>
                  <Text fw={600}>
                    ₱{selectedPayslip.monthlyRate.toFixed(2)}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Semi-Monthly Rate
                  </Text>
                  <Text fw={600}>
                    ₱{selectedPayslip.semiMonthlyRate.toFixed(2)}
                  </Text>
                </div>
              </Group>
              <Group grow mt="sm">
                <div>
                  <Text size="xs" c="dimmed">
                    Daily Rate
                  </Text>
                  <Text fw={600}>₱{selectedPayslip.dailyRate.toFixed(2)}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Hourly Rate
                  </Text>
                  <Text fw={600}>₱{selectedPayslip.hourlyRate.toFixed(2)}</Text>
                </div>
              </Group>
              <Divider my="md" />
            </div>

            {/* Benefits */}
            {selectedPayslip.benefits.length > 0 && (
              <div>
                <Text fw={600} mb="sm">
                  Benefits
                </Text>
                <Table striped>
                  <Table.Tbody>
                    {selectedPayslip.benefits.map((benefit, idx) => (
                      <Table.Tr key={idx}>
                        <Table.Td>{benefit.benefit}</Table.Td>
                        <Table.Td align="right">
                          ₱{benefit.amount.toFixed(2)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    <Table.Tr>
                      <Table.Td fw={700}>Total Benefits</Table.Td>
                      <Table.Td align="right" fw={700} c="green">
                        ₱{selectedPayslip.totalBenefits.toFixed(2)}
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
                <Divider my="md" />
              </div>
            )}

            {/* Deductions */}
            {selectedPayslip.deductions.length > 0 && (
              <div>
                <Text fw={600} mb="sm">
                  Deductions
                </Text>
                <Table striped>
                  <Table.Tbody>
                    {selectedPayslip.deductions.map((deduction, idx) => (
                      <Table.Tr key={idx}>
                        <Table.Td>{deduction.deduction}</Table.Td>
                        <Table.Td align="right">
                          ₱{deduction.amount.toFixed(2)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    <Table.Tr>
                      <Table.Td fw={700}>Total Deductions</Table.Td>
                      <Table.Td align="right" fw={700} c="red">
                        ₱{selectedPayslip.totalDeductions.toFixed(2)}
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
                <Divider my="md" />
              </div>
            )}

            {/* Pay Summary */}
            <div>
              <Text fw={600} mb="sm">
                Pay Summary
              </Text>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text>Gross Pay</Text>
                  <Text fw={600}>₱{selectedPayslip.grossPay.toFixed(2)}</Text>
                </Group>
                {selectedPayslip.totalBenefits > 0 && (
                  <Group justify="space-between">
                    <Text>Benefits</Text>
                    <Text fw={600} c="green">
                      +₱{selectedPayslip.totalBenefits.toFixed(2)}
                    </Text>
                  </Group>
                )}
                {selectedPayslip.totalDeductions > 0 && (
                  <Group justify="space-between">
                    <Text>Deductions</Text>
                    <Text fw={600} c="red">
                      -₱{selectedPayslip.totalDeductions.toFixed(2)}
                    </Text>
                  </Group>
                )}
                <Divider />
                <Group justify="space-between">
                  <Text fw={700} size="lg">
                    NET PAY
                  </Text>
                  <Text fw={700} size="lg" c="blue">
                    ₱{selectedPayslip.netPay.toFixed(2)}
                  </Text>
                </Group>
              </Stack>
            </div>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

export default PayslipPage;
