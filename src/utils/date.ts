export const formatDate = (d: Date | string): string =>
  typeof d === "string" ? d : d.toISOString().split("T")[0];

export const formatDateTimePickerValue = (iso: string): string => {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const toIsoDateTime = (pickerValue: string): string =>
  `${pickerValue.replace(" ", "T")}:00`;