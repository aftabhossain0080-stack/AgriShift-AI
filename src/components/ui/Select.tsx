import { type SelectHTMLAttributes } from "react";
import { WarningCircle } from "@phosphor-icons/react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label?: string;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}

export function Select({ id, label, error, helpText, children, className = "", ...rest }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <select
        id={id}
        className={[
          "w-full min-h-[44px] px-3 py-2",
          "bg-offWhite border rounded",
          "text-ink",
          "focus:outline-none focus:ring-1",
          "transition-colors duration-150",
          "appearance-none cursor-pointer",
          error
            ? "border-alertRed focus:ring-alertRed focus:border-alertRed"
            : "border-border focus:ring-deepGreen focus:border-deepGreen",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        ].join(" ")}
        aria-describedby={
          error ? `${id}-error` : helpText ? `${id}-help` : undefined
        }
        aria-invalid={error ? true : undefined}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1 text-xs text-alertRed font-medium">
          <WarningCircle size={14} weight="regular" aria-hidden="true" />
          {error}
        </p>
      )}
      {!error && helpText && (
        <p id={`${id}-help`} className="text-xs text-soilBrown">
          {helpText}
        </p>
      )}
    </div>
  );
}
