import { Button, Group, Modal, Stack, Text } from "@mantine/core";

interface ConfirmationModalProps {
  opened: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  opened,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const confirmColor = isDangerous ? "red" : "blue";

  return (
    <Modal opened={opened} onClose={onCancel} title={title} size="sm">
      <Stack gap="md">
        <Text>{message}</Text>
        <Group justify="flex-end">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button color={confirmColor} onClick={onConfirm} loading={isLoading}>
            {confirmText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
