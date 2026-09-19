import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useGetAllBenefits } from "@/api/generated/endpoints/benefits/benefits";
import { unwrapPage } from "@/api/helpers";
import type { BenefitDto } from "@/api/generated/model";
import type { FormValues } from "./types";

interface BenefitsStepProps {
  form: UseFormReturnType<FormValues>;
}

function BenefitsStep({ form }: BenefitsStepProps) {
  const { data: benefitsResponse, isLoading: benefitsLoading } = useGetAllBenefits(
    { pageNo: 0, limit: 100 },
    {
      query: {
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    },
  );

  const benefitOptions = unwrapPage<BenefitDto>(benefitsResponse).content.map(
    (benefit) => ({
      value: benefit.code,
      label: benefit.description,
    }),
  );

  const addBenefit = () => {
    form.insertListItem("benefits", { benefitCode: "", amount: 0 });
  };

  const removeBenefit = (index: number) => {
    form.removeListItem("benefits", index);
  };

  if (form.values.benefits.length === 0) {
    return (
      <Stack align="flex-start">
        <Text size="sm" c="dimmed">
          No benefits assigned.
        </Text>
        <Button
          variant="light"
          type="button"
          leftSection={<IconPlus size={16} />}
          onClick={addBenefit}
          disabled={benefitsLoading}
        >
          Add Benefit
        </Button>
      </Stack>
    );
  }

  return (
    <Stack>
      {form.values.benefits.map((_, index) => (
        <Group key={index} align="flex-end" wrap="nowrap">
          <Select
            label="Benefit"
            placeholder="Select benefit"
            data={benefitOptions}
            searchable
            disabled={benefitsLoading}
            className="flex-1"
            {...form.getInputProps(`benefits.${index}.benefitCode`)}
          />
          <NumberInput
            label="Amount"
            min={100}
            step={100}
            decimalScale={2}
            placeholder="0.00"
            className="flex-1"
            {...form.getInputProps(`benefits.${index}.amount`)}
          />
          <ActionIcon
            color="red"
            variant="subtle"
            type="button"
            aria-label="Remove benefit"
            onClick={() => removeBenefit(index)}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      ))}
      <Button
        variant="light"
        type="button"
        leftSection={<IconPlus size={16} />}
        onClick={addBenefit}
        disabled={benefitsLoading}
      >
        Add Benefit
      </Button>
    </Stack>
  );
}

export default BenefitsStep;