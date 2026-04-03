import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Use for modal/drawer forms: always show a visible `label`; use `placeholder` on
 * inputs only for short examples or format hints (not as the sole field name).
 */
export interface ModalFormFieldProps {
  label: string;
  description?: string;
  error?: string;
  className?: string;
  /** Receive a stable id to pass to the control (Input, SelectTrigger, Textarea). */
  children: (controlId: string) => React.ReactNode;
}

export const ModalFormField: React.FC<ModalFormFieldProps> = ({
  label,
  description,
  error,
  className,
  children,
}) => {
  const controlId = React.useId();

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={controlId} className={cn(error && "text-destructive")}>
        {label}
      </Label>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {children(controlId)}
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  );
};
