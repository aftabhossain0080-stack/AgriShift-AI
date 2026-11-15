"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";
import { Globe } from "@phosphor-icons/react";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (nextLocale: "en" | "bn") => {
    if (nextLocale === currentLocale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const isBengali = currentLocale === "bn";

  return (
    <div
      role="group"
      aria-label={isBengali ? "ভাষা নির্বাচন" : "Language selection"}
      className={`inline-flex items-center gap-1 p-1 bg-offWhite border border-border rounded-md ${className}`}
    >
      <div
        className="pl-2 pr-1 text-soilBrown flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <Globe size={18} weight="regular" />
      </div>

      <button
        type="button"
        onClick={() => handleSelect("en")}
        disabled={isPending}
        aria-pressed={currentLocale === "en"}
        aria-label="Switch language to English"
        title="English"
        className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen ${
          currentLocale === "en"
            ? "bg-deepGreen text-wheat border border-deepGreen"
            : "bg-offWhite text-ink border border-transparent hover:text-deepGreen hover:border-border"
        } ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => handleSelect("bn")}
        disabled={isPending}
        aria-pressed={currentLocale === "bn"}
        aria-label="Switch language to Bengali"
        title="বাংলা"
        className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs sm:text-sm font-semibold rounded-md font-bengali transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen ${
          currentLocale === "bn"
            ? "bg-deepGreen text-wheat border border-deepGreen"
            : "bg-offWhite text-ink border border-transparent hover:text-deepGreen hover:border-border"
        } ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        BN
      </button>
    </div>
  );
}
