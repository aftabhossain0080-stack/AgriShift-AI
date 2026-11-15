import { type ReactNode } from "react";

type Variant =
  | "default"
  | "optimal"
  | "moderate"
  | "conditional"
  | "low"
  | "medium"
  | "high";

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-offWhite text-ink border-border",
  optimal: "bg-[#E5ECE7] text-deepGreen border-border",
  moderate: "bg-[#F5EEDF] text-soilBrown border-border",
  conditional: "bg-[#E9E4D9] text-soilBrown border-border",
  low: "bg-[#E9E4D9] text-soilBrown border-border",
  medium: "bg-[#F5EEDF] text-soilBrown border-border",
  high: "bg-[#F5E8E7] text-alertRed border-border",
};

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded border",
        "px-2 py-0.5 text-xs font-semibold",
        variantClasses[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
