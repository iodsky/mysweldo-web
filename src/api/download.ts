import client from "./client";
import type { ReportDto } from "@/api/generated/model";

export async function downloadReportFile(report: ReportDto): Promise<void> {
  const response = await client.get(`/reports/${report.id}/download`, {
    responseType: "blob",
  });

  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = report.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}