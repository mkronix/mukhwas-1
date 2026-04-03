import React from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={handleCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <LoadingButton
          variant={variant === "destructive" ? "destructive" : "default"}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </LoadingButton>
      </div>
    </ResponsiveModal>
  );
};
