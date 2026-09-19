import { Grid, TextInput, Textarea } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { FormValues } from "./types";

interface PersonalStepProps {
  form: UseFormReturnType<FormValues>;
}

function PersonalStep({ form }: PersonalStepProps) {
  return (
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
    </Grid>
  );
}

export default PersonalStep;