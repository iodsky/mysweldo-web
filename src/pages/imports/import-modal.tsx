import { useState } from "react";
import {
  Modal,
  Button,
  Stack,
  Group,
  Text,
  SegmentedControl,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconDownload, IconFileText, IconUpload } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useImportEmployees,
  useImportUsers,
  type importEmployeesResponse,
  type importUsersResponse,
} from "@/api/generated/endpoints/csv-imports/csv-imports";
import { unwrapData } from "@/api/helpers";
import { handleApiError } from "@/utils/error-handler";
import { notifications } from "@mantine/notifications";
import { downloadCsv } from "@/utils/csv";
import { EMPLOYEE_COLUMNS, USER_COLUMNS } from "./columns";
import type { ImportJobLaunchResponse } from "@/api/generated/model";

export type ImportTypeValue = "EMPLOYEE" | "USER";

interface ImportModalProps {
  opened: boolean;
  onClose: () => void;
  allowedTypes: ImportTypeValue[];
}

const TYPE_LABELS: Record<ImportTypeValue, string> = {
  EMPLOYEE: "Employees",
  USER: "Users",
};

function ImportModal({ opened, onClose, allowedTypes }: ImportModalProps) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<ImportTypeValue>(
    () => allowedTypes[0] ?? "EMPLOYEE",
  );
  const [file, setFile] = useState<File | null>(null);

  const handleImported = (res?: importEmployeesResponse | importUsersResponse) => {
    const message = unwrapData<ImportJobLaunchResponse>(res)?.message;
    queryClient.invalidateQueries({ queryKey: ["/jobs"] });
    onClose();
    notifications.show({
      title: "Success",
      message: message ?? "Import launched successfully",
      color: "green",
      withBorder: true,
    });
  };

  const employeesMutation = useImportEmployees({
    mutation: {
      onSuccess: handleImported,
      onError: handleApiError,
    },
  });

  const usersMutation = useImportUsers({
    mutation: {
      onSuccess: handleImported,
      onError: handleApiError,
    },
  });

  const handleDownloadTemplate = () => {
    const columns = type === "EMPLOYEE" ? EMPLOYEE_COLUMNS : USER_COLUMNS;
    downloadCsv(
      `import-${type.toLowerCase()}-template.csv`,
      columns,
    );
  };

  const handleImport = () => {
    if (!file) return;
    if (type === "EMPLOYEE") {
      employeesMutation.mutate({ data: { file } });
    } else {
      usersMutation.mutate({ data: { file } });
    }
  };

  const isPending = employeesMutation.isPending || usersMutation.isPending;

  return (
    <Modal opened={opened} onClose={onClose} title="Import from CSV" centered>
      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb={4}>
            Import type
          </Text>
          <SegmentedControl
            value={type}
            onChange={(value) => setType(value as ImportTypeValue)}
            data={allowedTypes.map((t) => ({
              value: t,
              label: TYPE_LABELS[t],
            }))}
            fullWidth
          />
        </div>

        <Dropzone
          onDrop={(files) => setFile(files[0] ?? null)}
          onReject={() =>
            notifications.show({
              title: "Invalid file",
              message: "Only CSV files up to 10MB are supported",
              color: "red",
              withBorder: true,
            })
          }
          maxSize={10 * 1024 * 1024}
          accept={["text/csv", "application/vnd.ms-excel"]}
        >
          <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: "none" }}>
            {file ? (
              <>
                <IconFileText size={40} color="var(--mantine-color-blue-6)" />
                <div>
                  <Text size="sm" fw={500}>
                    {file.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {(file.size / 1024).toFixed(1)} KB — click to replace
                  </Text>
                </div>
              </>
            ) : (
              <>
                <IconUpload size={40} color="var(--mantine-color-dimmed)" />
                <div>
                  <Text size="sm" fw={500}>
                    Drag a CSV file here or click to select
                  </Text>
                  <Text size="xs" c="dimmed">
                    File must be a .csv, up to 10MB
                  </Text>
                </div>
              </>
            )}
          </Group>
        </Dropzone>

        <Group justify="space-between">
          <Button
            variant="outline"
            leftSection={<IconDownload size={16} />}
            onClick={handleDownloadTemplate}
          >
            Download template
          </Button>
          <Group>
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} loading={isPending} disabled={!file}>
              Import
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}

export default ImportModal;