import {
  Drawer,
  Button,
  Stack,
  Group,
  Stepper,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAllEmployeesQueryKey, getGetEmployeeByIdQueryKey, useCreateEmployee, useUpdateEmployee } from "@/api/generated/endpoints/employees/employees";
import { useGetDepartmentOptions } from "@/api/generated/endpoints/departments/departments";
import { useGetPositionOptions } from "@/api/generated/endpoints/positions/positions";
import { useEmployeeOptions } from "@/hooks/use-employee-options";
import { unwrapData } from "@/api/helpers";
import type {
  Employee,
  EmployeeDto,
} from "../../types";
import { getFieldErrors } from "@/utils/error-handler";
import type { DepartmentDto, PositionDto, SalaryRequestPayFrequency } from "@/api/generated/model";
import PersonalStep from "./components/employee-form-steps/personal-step";
import EmploymentBankStep from "./components/employee-form-steps/employment-bank-step";
import CompensationStep from "./components/employee-form-steps/compensation-step";
import BenefitsStep from "./components/employee-form-steps/benefits-step";
import type { FormValues } from "./components/employee-form-steps/types";

interface EmployeeFormProps {
  opened: boolean;
  onClose: () => void;
  employee?: Employee;
  isEditing?: boolean;
}

const TOTAL_STEPS = 4;

const STEP_FIELDS: (keyof FormValues)[][] = [
  ["firstName", "lastName", "birthday", "phoneNumber", "address"],
  ["positionId", "departmentId"],
  ["salaryRate"],
];

export function EmployeeForm({
  opened,
  onClose,
  employee,
  isEditing = false,
}: EmployeeFormProps) {
  const queryClient = useQueryClient();
  const [active, setActive] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);

  // Fetch departments
  const { data: departmentsResponse, isLoading: departmentsLoading } =
    useGetDepartmentOptions({
      query: {
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    });

  // Fetch positions
  const { data: positionsResponse, isLoading: positionsLoading } =
    useGetPositionOptions({
      query: {
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    });

  // Transform departments to Select options
  const departmentOptions = (unwrapData<DepartmentDto[]>(departmentsResponse) ??
    []).map((dept) => ({
    value: dept.id,
    label: dept.title,
  }));

  // Transform positions to Select options
  const positionOptions = (unwrapData<PositionDto[]>(positionsResponse) ?? []).map(
    (pos) => ({
      value: pos.id,
      label: pos.title,
    }),
  );

  const { options: employeeOptions } = useEmployeeOptions({
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Exclude the employee being edited so they can't supervise themselves
  const supervisorOptions = isEditing && employee?.id != null
    ? employeeOptions.filter((opt) => opt.value !== String(employee.id))
    : employeeOptions;

  const form = useForm<FormValues>({
    initialValues: employee
      ? {
          firstName: employee.firstName ?? "",
          lastName: employee.lastName ?? "",
          birthday: employee.birthday ?? "",
          address: employee.address ?? "",
          phoneNumber: employee.phoneNumber ?? "",
          sssNumber: employee.sssNumber ?? "",
          tinNumber: employee.tinNumber ?? "",
          philhealthNumber: employee.philhealthNumber ?? "",
          pagibigNumber: employee.pagIbigNumber ?? "",
          supervisorId: employee.supervisor?.id != null ? String(employee.supervisor.id) : "",
          positionId: employee.position?.id ?? "",
          departmentId: employee.department?.id ?? "",
          status: (employee.status as FormValues["status"]) ?? "PROBATIONARY",
          type: (employee.type as FormValues["type"]) ?? "FULL_TIME",
          startShift: employee.startShift ?? "",
          endShift: employee.endShift ?? "",
          salaryRate: employee.salary?.rate ?? 0,
          salaryType: (employee.salary?.payType as FormValues["salaryType"]) ?? "MONTHLY",
          payrollFrequency: (employee.salary?.payFrequency as FormValues["payrollFrequency"]) ??
            "MONTHLY",
          bankName: employee.bankName ?? "",
          accountNumber: employee.accountNumber ?? "",
          accountHolderName: employee.accountHolderName ?? "",
          benefits:
            employee.benefits?.map((benefit) => ({
              benefitCode: benefit.benefit,
              amount: benefit.amount,
            })) ?? [],
        }
      : {
          firstName: "",
          lastName: "",
          birthday: "",
          address: "",
          phoneNumber: "",
          sssNumber: "",
          tinNumber: "",
          philhealthNumber: "",
          pagibigNumber: "",
          supervisorId: "",
          positionId: "",
          departmentId: "",
          status: "PROBATIONARY",
          type: "FULL_TIME",
          startShift: "",
          endShift: "",
          salaryRate: 0,
          salaryType: "MONTHLY",
          payrollFrequency: "MONTHLY",
          bankName: "",
          accountNumber: "",
          accountHolderName: "",
          benefits: [],
        },
    validate: {
      firstName: (value) => (!value ? "First name is required" : null),
      lastName: (value) => (!value ? "Last name is required" : null),
      birthday: (value) => (!value ? "Birthday is required" : null),
      phoneNumber: (value) => (!value ? "Phone number is required" : null),
      address: (value) => (!value ? "Address is required" : null),
      positionId: (value) => (!value ? "Position is required" : null),
      departmentId: (value) => (!value ? "Department is required" : null),
      salaryRate: (value) => (value <= 0 ? "Basic salary must be greater than 0" : null),
    },
  });

  // Reset stepper when the drawer opens
  useEffect(() => {
    if (opened) {
      setActive(0);
      setMaxVisited(0);
    }
  }, [opened]);

  // Update form values when employee or modal opens
  useEffect(() => {
    if (opened && employee && isEditing) {
      form.setValues({
        firstName: employee.firstName ?? "",
        lastName: employee.lastName ?? "",
        birthday: employee.birthday ?? "",
        address: employee.address ?? "",
        phoneNumber: employee.phoneNumber ?? "",
        sssNumber: employee.sssNumber ?? "",
        tinNumber: employee.tinNumber ?? "",
        philhealthNumber: employee.philhealthNumber ?? "",
        pagibigNumber: employee.pagIbigNumber ?? "",
        supervisorId: employee.supervisor?.id != null ? String(employee.supervisor.id) : "",
        positionId: employee.position?.id ?? "",
        departmentId: employee.department?.id ?? "",
        status: (employee.status as FormValues["status"]) ?? "PROBATIONARY",
        type: (employee.type as FormValues["type"]) ?? "FULL_TIME",
        startShift: employee.startShift ?? "",
        endShift: employee.endShift ?? "",
        salaryRate: employee.salary?.rate ?? 0,
        salaryType: (employee.salary?.payType as FormValues["salaryType"]) ?? "MONTHLY",
        payrollFrequency: (employee.salary?.payFrequency as FormValues["payrollFrequency"]) ??
          "MONTHLY",
        bankName: employee.bankName ?? "",
        accountNumber: employee.accountNumber ?? "",
        accountHolderName: employee.accountHolderName ?? "",
        benefits:
          employee.benefits?.map((benefit) => ({
            benefitCode: benefit.benefit,
            amount: benefit.amount,
          })) ?? [],
      });
    } else if (opened && !isEditing) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, employee, isEditing]);

  const buildDto = (formData: FormValues): EmployeeDto => ({
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthday: formData.birthday,
      address: formData.address,
      phoneNumber: formData.phoneNumber,
      governmentId: {
        sssNumber: formData.sssNumber,
        tinNumber: formData.tinNumber,
        philhealthNumber: formData.philhealthNumber,
        pagIbigNumber: formData.pagibigNumber,
      },
      supervisorId: formData.supervisorId ? Number(formData.supervisorId) : undefined,
      positionId: formData.positionId,
      departmentId: formData.departmentId,
      status: formData.status,
      type: formData.type,
      startShift: formData.startShift,
      endShift: formData.endShift,
      benefits: formData.benefits,
      salaryRequest: {
        rate: formData.salaryRate,
        payType: formData.salaryType,
        payFrequency: formData.payrollFrequency as SalaryRequestPayFrequency,
      },
      bankName: formData.bankName.trim() || undefined,
      accountNumber: formData.accountNumber.trim() || undefined,
      accountHolderName: formData.accountHolderName.trim() || undefined,
    });

  const createMutation = useCreateEmployee({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAllEmployeesQueryKey() });
        form.reset();
        onClose();
      },
      onError: (error: unknown) => {
        getFieldErrors(error).forEach((err) => {
          form.setFieldError(err.field, err.message);
        });
      },
    },
  });

  const updateMutation = useUpdateEmployee({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAllEmployeesQueryKey() });
        if (employee?.id != null) {
          queryClient.invalidateQueries({ queryKey: getGetEmployeeByIdQueryKey(employee.id) });
        }
        onClose();
        notifications.show({
          color: "green",
          title: "Success",
          message: "Employee updated successfully",
        });
      },
      onError: (error: unknown) => {
        getFieldErrors(error).forEach((err) => {
          form.setFieldError(err.field, err.message);
        });
      },
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: FormValues) => {
    const dto = buildDto(values);
    if (isEditing && employee?.id) {
      updateMutation.mutate({ id: employee.id, data: dto });
    } else {
      createMutation.mutate({ data: dto });
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    if (step === TOTAL_STEPS - 1) {
      let ok = true;
      form.values.benefits.forEach((benefit, index) => {
        if (!benefit.benefitCode) {
          form.setFieldError(`benefits.${index}.benefitCode`, "Select a benefit");
          ok = false;
        }
        if (benefit.amount < 100) {
          form.setFieldError(`benefits.${index}.amount`, "Minimum is 100");
          ok = false;
        }
      });
      return ok;
    }
    const fields = STEP_FIELDS[step] ?? [];
    const results = await Promise.all(
      fields.map((field) => Promise.resolve(form.validateField(field))),
    );
    return results.every((result) => !result.hasError);
  };

  const handleNext = async () => {
    const valid = await validateStep(active);
    if (!valid) return;
    const next = Math.min(active + 1, TOTAL_STEPS - 1);
    setActive(next);
    setMaxVisited((m) => Math.max(m, next));
  };

  const handleClose = () => {
    form.reset();
    setActive(0);
    setMaxVisited(0);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title={isEditing ? "Edit Employee" : "Create New Employee"}
      position="right"
      size="lg"
      styles={{
        body: { flex: 1, display: "flex", flexDirection: "column" },
      }}
    >
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="flex flex-col flex-1"
      >
        <Stack gap="md" className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <Stepper
              active={active}
              onStepClick={(step) => {
                if (isEditing || step <= maxVisited) {
                  setActive(step);
                }
              }}
              size="xs"
              mb="lg"
            >
              <Stepper.Step label="Personal" />
              <Stepper.Step label="Employment" />
              <Stepper.Step label="Compensation" />
              <Stepper.Step label="Benefits" />
            </Stepper>

            {active === 0 && <PersonalStep form={form} />}
            {active === 1 && (
              <EmploymentBankStep
                form={form}
                supervisorOptions={supervisorOptions}
                positionOptions={positionOptions}
                departmentOptions={departmentOptions}
                positionsLoading={positionsLoading}
                departmentsLoading={departmentsLoading}
              />
            )}
            {active === 2 && <CompensationStep form={form} />}
            {active === 3 && <BenefitsStep form={form} />}
          </div>

          <Group justify="flex-end" mt="lg" className="border-t border-gray-200 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {active > 0 && (
              <Button
                variant="default"
                type="button"
                onClick={() => setActive((a) => a - 1)}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            {active < TOTAL_STEPS - 1 ? (
              <Button type="button" onClick={handleNext}>Next</Button>
            ) : (
              <Button
                type="button"
                loading={isLoading}
                onClick={() => form.onSubmit(handleSubmit)()}
              >
                {isEditing ? "Update Employee" : "Create Employee"}
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}