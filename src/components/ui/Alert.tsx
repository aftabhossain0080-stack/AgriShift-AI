import { type ReactNode } from "react";
import { Info, WarningCircle, XCircle } from "@phosphor-icons/react";

type Severity = "info" | "warning" | "error";

interface AlertProps {
  severity: Severity;
  title?: string;
  children?: ReactNode;
}

const config: Record<
  Severity,
  {
    Icon: React.ElementType;
    borderClass: string;
    titleClass: string;
    iconClass: string;
  }
> = {
  info: {
    Icon: Info,
    borderClass: "border-border",
    titleClass: "text-ink",
    iconClass: "text-deepGreen",
  },
  warning: {
    Icon: WarningCircle,
    borderClass: "border-alertRed",
    titleClass: "text-alertRed",
    iconClass: "text-alertRed",
  },
  error: {
    Icon: XCircle,
    borderClass: "border-alertRed",
    titleClass: "text-alertRed",
    iconClass: "text-alertRed",
  },
};

export function Alert({ severity, title, children }: AlertProps) {
  const { Icon, borderClass, titleClass, iconClass } = config[severity];

  return (
    <div
      role="alert"
      className={[
        "flex gap-3 p-4 rounded border bg-offWhite",
        borderClass,
      ].join(" ")}
    >
      <Icon
        size={20}
        weight="regular"
        className={["shrink-0 mt-0.5", iconClass].join(" ")}
        aria-hidden="true"
      />
      <div className="space-y-1">
        {title && (
          <p className={["text-sm font-semibold", titleClass].join(" ")}>
            {title}
          </p>
        )}
        {children && (
          <div className="text-sm text-ink">{children}</div>
        )}
      </div>
    </div>
  );
}
