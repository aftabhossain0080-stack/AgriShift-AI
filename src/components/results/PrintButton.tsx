"use client";

import React from "react";

export interface PrintButtonProps {
  className?: string;
}

export function PrintButton({ className = "" }: PrintButtonProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`min-h-[44px] px-4 py-2 border border-border rounded-[6px] bg-offWhite text-ink hover:border-deepGreen hover:text-deepGreen transition-colors inline-flex items-center justify-center gap-2 text-xs font-semibold ${className}`}
      aria-label="Print recommendation plan"
    >
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      <span>Print plan</span>
    </button>
  );
}

export default PrintButton;
