export const buildCsv = (columns: string[]): string =>
  columns.map((col) => (col.includes(",") ? `"${col}"` : col)).join(",");

export const downloadCsv = (filename: string, columns: string[]): void => {
  const blob = new Blob([buildCsv(columns)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};