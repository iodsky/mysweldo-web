import { notifications } from "@mantine/notifications";
import type { ApiError } from "@/types";

export const handleApiError = (error: ApiError) => {
  if (error.validationErrors?.length) {
    error.validationErrors.forEach((err) => {
      notifications.show({
        title: "Validation Error",
        message: `${err.field}: ${err.message}`,
        color: "red",
        withBorder: true,
      });
    });
    return;
  }

  if (error.duplicateField) {
    notifications.show({
      title: "Duplicate",
      message: `${error.duplicateField.field} already exists`,
      color: "red",
      withBorder: true,
    });
    return;
  }

  notifications.show({
    title: "Error",
    message: error.message,
    color: "red",
    withBorder: true,
  });
};
