import { Button } from "@mantine/core";
import { DateInput } from "@mantine/dates";

interface DateRangeFilterProps {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (value: string | null) => void;
  onEndDateChange: (value: string | null) => void;
  onClear: () => void;
  clearLabel?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  clearLabel = "Clear Filters",
}: DateRangeFilterProps) {
  return (
    <div className="flex items-end gap-2">
      <DateInput
        label="Start Date"
        placeholder="Pick start date"
        value={startDate}
        valueFormat="YYYY-MM-DD"
        onChange={onStartDateChange}
        clearable
        highlightToday
      />
      <DateInput
        label="End Date"
        placeholder="Pick end date"
        value={endDate}
        valueFormat="YYYY-MM-DD"
        onChange={onEndDateChange}
        clearable
        highlightToday
      />
      <Button variant="light" onClick={onClear}>
        {clearLabel}
      </Button>
    </div>
  );
}