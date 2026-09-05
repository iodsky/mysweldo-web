import { notifications } from "@mantine/notifications";
import { isSessionExpiredError } from "@/api/client";
import type { ApiError, ValidationError } from "@/types";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

const humanizeField = (field: string): string =>
  field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_.-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim() || field;

export const extractApiError = (error: unknown): ApiError => {
  if (error && typeof error === "object") {
    const candidate = error as Partial<ApiError>;
    if (typeof candidate.status === "number" && typeof candidate.message === "string") {
      return candidate as ApiError;
    }

    const withResponse = error as { response?: { data?: unknown }; message?: unknown };
    const data = withResponse.response?.data;
    if (data && typeof data === "object") {
      const payload = data as Partial<ApiError>;
      if (typeof payload.message === "string") {
        return {
          timestamp: payload.timestamp ?? new Date().toISOString(),
          status: payload.status ?? 0,
          message: payload.message,
          path: payload.path,
          validationErrors: payload.validationErrors,
          duplicateField: payload.duplicateField,
        };
      }
    }

    if (typeof withResponse.message === "string") {
      return {
        timestamp: new Date().toISOString(),
        status: 0,
        message: withResponse.message,
      };
    }
  }

  return {
    timestamp: new Date().toISOString(),
    status: 0,
    message: FALLBACK_MESSAGE,
  };
};

export const getFieldErrors = (error: unknown): ValidationError[] =>
  extractApiError(error).validationErrors ?? [];

export const handleApiError = (error: unknown) => {
  // Session-expired 401s are already surfaced and redirected by the interceptor.
  if (isSessionExpiredError(error)) return;

  const apiError = extractApiError(error);

  if (apiError.validationErrors?.length) {
    notifications.show({
      title: "Validation Error",
      message: (
        <div className="flex flex-col gap-1">
          {apiError.validationErrors.map((err, index) => (
            <div key={index}>{`${humanizeField(err.field)}: ${err.message}`}</div>
          ))}
        </div>
      ),
      color: "red",
      withBorder: true,
    });
    return;
  }

  if (apiError.duplicateField) {
    notifications.show({
      title: "Duplicate",
      message: `${humanizeField(apiError.duplicateField.field)} already exists`,
      color: "red",
      withBorder: true,
    });
    return;
  }

  notifications.show({
    title: "Error",
    message: statusMessage(apiError) ?? apiError.message,
    color: "red",
    withBorder: true,
  });
};

const statusMessage = (apiError: ApiError): string | null => {
  switch (apiError.status) {
    case 401:
      return "Invalid email or password";
    case 403:
      return "You don't have permission to perform this action";
    case 404:
      return "The requested resource was not found";
    case 429:
      return "Too many requests. Please try again later";
    case 0:
      return "Cannot reach the server. Check your connection and try again";
  }
  if (apiError.status >= 500) {
    return "Something went wrong on our end. Please try again later";
  }
  return null;
};