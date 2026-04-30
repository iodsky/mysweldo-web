import {
  Modal,
  Button,
  Stack,
  TextInput,
  Select,
  Grid,
  Group,
  Textarea,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmployee, updateEmployee } from "../api/employee";
import type {
  Employee,
  EmploymentStatus,
  EmploymentType,
  PayType,
  PayrollFrequency,
  EmployeeDto,
  ApiError,
} from "../types";

interface EmployeeFormProps {
  opened: boolean;
  onClose: () => void;
  employee?: Employee;
  isEditing?: boolean;
}

interface FormValues {
  firstName: string;
  lastName: string;
  birthday: string;
  address: string;
  phoneNumber: string;
  sssNumber: string;
  tinNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;
  supervisorId: number;
  positionId: string;
  departmetnId: string;
  status: EmploymentStatus;
  type: EmploymentType;
  startShift: string;
  endShift: string;
  salaryRate: number;
  salaryType: PayType;
  payrollFrequency: PayrollFrequency;
}

const employmentStatusOptions = [
  { value: "PROBATIONARY", label: "Probationary" },
  { value: "REGULAR", label: "Regular" },
  { value: "TERMINATED", label: "Terminated" },
  { value: "RESIGNED", label: "Resigned" },
];

const employmentTypeOptions = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACTUAL", label: "Contractual" },
  { value: "INTERN", label: "Intern" },
];

const payTypeOptions = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "DAILY", label: "Daily" },
  { value: "HOURLY", label: "Hourly" },
];

const payrollFrequencyOptions = [
  { value: "SEMI_MONTHLY", label: "Semi-Monthly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BI_WEEKLY", label: "Bi-Weekly" },
];

const handleApiError = (
  error: unknown,
  form: { setFieldError: (field: string, error: string) => void },
): void => {
  // Check for validation errors directly on the error object
  const apiError = error as Partial<ApiError>;

  if (apiError.validationErrors && Array.isArray(apiError.validationErrors)) {
    // Set field-level errors
    apiError.validationErrors.forEach(
      (validationError: { field: string; message: string }) => {
        form.setFieldError(validationError.field, validationError.message);
      },
    );
    // Show summary notification
    showNotification({
      title: "Validation Failed",
      message: "Please fix the highlighted fields and try again.",
      color: "red",
      autoClose: 5000,
    });
    return;
  }

  // Try to get message from error object
  if (apiError.message) {
    showNotification({
      title: "Error",
      message: apiError.message,
      color: "red",
      autoClose: 5000,
    });
    return;
  }

  // Generic error handling
  showNotification({
    title: "Error",
    message: "An unexpected error occurred. Please try again.",
    color: "red",
    autoClose: 5000,
  });
};

export function EmployeeForm({
  opened,
  onClose,
  employee,
  isEditing = false,
}: EmployeeFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    initialValues: employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          birthday: employee.birthday,
          address: employee.address,
          phoneNumber: employee.phoneNumber,
          sssNumber: employee.sssNumber,
          tinNumber: employee.tinNumber,
          philhealthNumber: employee.philhealthNumber,
          pagibigNumber: employee.pagIbigNumber,
          supervisorId: 0,
          positionId: "",
          departmetnId: "",
          status: employee.status as EmploymentStatus,
          type: employee.type as EmploymentType,
          startShift: employee.startShift,
          endShift: employee.endShift,
          salaryRate: employee.basicSalary,
          salaryType: "MONTHLY" as PayType,
          payrollFrequency: "MONTHLY" as PayrollFrequency,
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
          supervisorId: 0,
          positionId: "",
          departmetnId: "",
          status: "PROBATIONARY" as EmploymentStatus,
          type: "FULL_TIME" as EmploymentType,
          startShift: "",
          endShift: "",
          salaryRate: 0,
          salaryType: "MONTHLY" as PayType,
          payrollFrequency: "MONTHLY" as PayrollFrequency,
        },
    validate: {
      firstName: (value) => (!value ? "First name is required" : null),
      lastName: (value) => (!value ? "Last name is required" : null),
      birthday: (value) => (!value ? "Birthday is required" : null),
      phoneNumber: (value) => (!value ? "Phone number is required" : null),
      address: (value) => (!value ? "Address is required" : null),
    },
  });

  // Update form values when employee or modal opens
  useEffect(() => {
    if (opened && employee && isEditing) {
      form.setValues({
        firstName: employee.firstName,
        lastName: employee.lastName,
        birthday: employee.birthday,
        address: employee.address,
        phoneNumber: employee.phoneNumber,
        sssNumber: employee.sssNumber,
        tinNumber: employee.tinNumber,
        philhealthNumber: employee.philhealthNumber,
        pagibigNumber: employee.pagIbigNumber,
        supervisorId: 0,
        positionId: "",
        departmetnId: "",
        status: employee.status as EmploymentStatus,
        type: employee.type as EmploymentType,
        startShift: employee.startShift,
        endShift: employee.endShift,
        salaryRate:
          typeof employee.basicSalary === "number"
            ? employee.basicSalary
            : Number(employee.basicSalary) || 0,
        salaryType: "MONTHLY" as PayType,
        payrollFrequency: "MONTHLY" as PayrollFrequency,
      });
    } else if (opened && !isEditing) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, employee, isEditing]);

  const createMutation = useMutation({
    mutationFn: (formData: FormValues) => {
      const baseDto: EmployeeDto = {
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
        status: formData.status,
        type: formData.type,
        startShift: formData.startShift,
        endShift: formData.endShift,
        benefits: [],
        salaryRequest: {
          rate: formData.salaryRate,
          type: formData.salaryType,
          payrollFrequency: formData.payrollFrequency,
        },
      };

      // Only include optional fields if they have valid values
      if (formData.supervisorId > 0) {
        baseDto.supervisorId = formData.supervisorId;
      }
      if (formData.positionId) {
        baseDto.positionId = formData.positionId;
      }
      if (formData.departmetnId) {
        baseDto.departmentId = formData.departmetnId;
      }

      return createEmployee(baseDto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      handleApiError(error, form);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: FormValues) => {
      const baseDto: EmployeeDto = {
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
        status: formData.status,
        type: formData.type,
        startShift: formData.startShift,
        endShift: formData.endShift,
        benefits: [],
        salaryRequest: {
          rate: formData.salaryRate,
          type: formData.salaryType,
          payrollFrequency: formData.payrollFrequency,
        },
      };

      // Only include optional fields if they have valid values
      if (formData.supervisorId > 0) {
        baseDto.supervisorId = formData.supervisorId;
      }
      if (formData.positionId) {
        baseDto.positionId = formData.positionId;
      }
      if (formData.departmetnId) {
        baseDto.departmentId = formData.departmetnId;
      }

      return updateEmployee(parseInt(employee!.id), baseDto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
    onError: (error: Error) => {
      handleApiError(error, form);
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: FormValues) => {
    if (isEditing && employee) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEditing ? "Edit Employee" : "Create New Employee"}
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="First Name"
                placeholder="John"
                {...form.getInputProps("firstName")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Last Name"
                placeholder="Doe"
                {...form.getInputProps("lastName")}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Birthday"
                type="date"
                {...form.getInputProps("birthday")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Phone Number"
                placeholder="+1 234 567 8900"
                {...form.getInputProps("phoneNumber")}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Address"
                placeholder="123 Main Street..."
                {...form.getInputProps("address")}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Employment Status"
                placeholder="Select status"
                data={employmentStatusOptions}
                {...form.getInputProps("status")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Employment Type"
                placeholder="Select type"
                data={employmentTypeOptions}
                {...form.getInputProps("type")}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Start Shift"
                type="time"
                {...form.getInputProps("startShift")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="End Shift"
                type="time"
                {...form.getInputProps("endShift")}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="SSS Number"
                placeholder="xx-xxxxxxx-x"
                {...form.getInputProps("sssNumber")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="TIN Number"
                placeholder="xxx-xxx-xxx-xxx"
                {...form.getInputProps("tinNumber")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="PhilHealth Number"
                placeholder="xxxx-xxxx-xxx"
                {...form.getInputProps("philhealthNumber")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Pag-IBIG Number"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                {...form.getInputProps("pagibigNumber")}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Supervisor ID"
                type="number"
                placeholder="0"
                {...form.getInputProps("supervisorId")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Position ID"
                placeholder="Enter position ID"
                {...form.getInputProps("positionId")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Department ID"
                placeholder="Enter department ID"
                {...form.getInputProps("departmetnId")}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Basic Salary"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.getInputProps("salaryRate")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Salary Type"
                placeholder="Select salary type"
                data={payTypeOptions}
                {...form.getInputProps("salaryType")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Payroll Frequency"
                placeholder="Select payroll frequency"
                data={payrollFrequencyOptions}
                {...form.getInputProps("payrollFrequency")}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="lg">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {isEditing ? "Update Employee" : "Create Employee"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
