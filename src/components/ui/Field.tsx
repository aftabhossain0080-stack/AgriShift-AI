import { type ReactNode } from "react";
import { WarningCircle } from "@phosphor-icons/react";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  helpText?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, helpText, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          className="flex items-center gap-1 text-xs text-alertRed font-medium"
        >
          <WarningCircle size={14} weight="regular" aria-hidden="true" />
          {error}
        </p>
      )}
      {!error && helpText && (
        <p id={`${htmlFor}-help`} className="text-xs text-soilBrown">
          {helpText}
        </p>
      )}
    </div>
  );
}
