import { type InputHTMLAttributes } from "react";
import { WarningCircle } from "@phosphor-icons/react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  error?: string;
  helpText?: string;
}

export function Input({ id, label, error, helpText, className = "", ...rest }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          "w-full min-h-[44px] px-3 py-2",
          "bg-offWhite border rounded",
          "text-ink placeholder:text-ink/50",
          "focus:outline-none focus:ring-1",
          "transition-colors duration-150",
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
      />
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
