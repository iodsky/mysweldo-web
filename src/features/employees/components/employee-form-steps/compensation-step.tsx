import { Grid, NumberInput, Select } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { payTypeOptions, payrollFrequencyOptions } from "./options";
import type { FormValues } from "./types";

interface CompensationStepProps {
  form: UseFormReturnType<FormValues>;
}

function CompensationStep({ form }: CompensationStepProps) {
  return (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <NumberInput
          label="Basic Salary"
          min={0}
          step={100}
          decimalScale={2}
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
  );
}

export default CompensationStep;