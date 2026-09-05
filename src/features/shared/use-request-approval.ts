import { useState } from "react";
import type { RequestStatus } from "@/types";

type RequestAction = "approve" | "reject" | "delete";

interface UseRequestApprovalOptions {
  noun: string;
}

export function useRequestApproval<T extends { id?: string | null }>({
  noun,
}: UseRequestApprovalOptions) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<RequestAction | null>(null);
  const [selected, setSelected] = useState<T | null>(null);

  const openConfirm = (request: T, action: RequestAction) => {
    setSelected(request);
    setActionType(action);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setActionType(null);
    setSelected(null);
  };

  const confirm = (
    updateStatus: (args: {
      id: string;
      params: { status: RequestStatus };
    }) => void,
    deleteRequest?: (args: { id: string }) => void,
  ) => {
    if (!selected?.id) return;
    if (actionType === "approve" || actionType === "reject") {
      updateStatus({
        id: selected.id,
        params: {
          status: actionType === "approve" ? "APPROVED" : "REJECTED",
        },
      });
    } else if (actionType === "delete" && deleteRequest) {
      deleteRequest({ id: selected.id });
    }
  };

  const title =
    actionType === "approve"
      ? `Approve ${noun}`
      : actionType === "reject"
        ? `Reject ${noun}`
        : `Delete ${noun}`;

  const message =
    actionType === "approve"
      ? `Are you sure you want to approve this ${noun}?`
      : actionType === "reject"
        ? `Are you sure you want to reject this ${noun}?`
        : `Are you sure you want to delete this ${noun}?`;

  const confirmText =
    actionType === "approve"
      ? "Approve"
      : actionType === "reject"
        ? "Reject"
        : "Delete";

  return {
    openConfirm,
    closeConfirm,
    confirm,
    actionType,
    selected,
    confirmModalProps: {
      opened: confirmOpen,
      title,
      message,
      confirmText,
      isDangerous: actionType === "delete" || actionType === "reject",
      onCancel: closeConfirm,
    },
  };
}