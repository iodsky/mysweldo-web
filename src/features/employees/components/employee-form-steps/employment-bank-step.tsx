import { Divider, Grid, Select, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import {
  employmentStatusOptions,
  employmentTypeOptions,
} from "./options";
import type { FormValues } from "./types";

export interface SelectOption {
  value: string;
  label: string;
}

interface EmploymentBankStepProps {
  form: UseFormReturnType<FormValues>;
  supervisorOptions: SelectOption[];
  positionOptions: SelectOption[];
  departmentOptions: SelectOption[];
  positionsLoading: boolean;
  departmentsLoading: boolean;
}

function EmploymentBankStep({
  form,
  supervisorOptions,
  positionOptions,
  departmentOptions,
  positionsLoading,
  departmentsLoading,
}: EmploymentBankStepProps) {
  return (
    <Grid>
      <Grid.Col span={12}>
        <Divider label="Employment Details" labelPosition="left" />
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
        <Select
          label="Supervisor"
          placeholder="Select supervisor"
          data={supervisorOptions}
          {...form.getInputProps("supervisorId")}
          searchable
          clearable
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Select
          label="Position"
          placeholder="Select position"
          data={positionOptions}
          disabled={positionsLoading}
          {...form.getInputProps("positionId")}
          searchable
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Select
          label="Department"
          placeholder="Select department"
          data={departmentOptions}
          disabled={departmentsLoading}
          {...form.getInputProps("departmentId")}
          searchable
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <Divider label="Bank Details" labelPosition="left" mt="xs" />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Bank Name"
          placeholder="e.g. BDO"
          {...form.getInputProps("bankName")}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Account Number"
          placeholder="Account number"
          {...form.getInputProps("accountNumber")}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Account Holder Name"
          placeholder="Name on the account"
          {...form.getInputProps("accountHolderName")}
        />
      </Grid.Col>
    </Grid>
  );
}

export default EmploymentBankStep;