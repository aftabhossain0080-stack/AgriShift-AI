"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Plant, List, X } from "@phosphor-icons/react";
import { LanguageCombobox } from "./LanguageCombobox";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll state: transparent at <= 8px, solid #F6F3EC after 8px
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const switchLocale = (newLocale: "en" | "bn") => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  const isHomeActive = pathname === "/";
  const isAdviceActive = pathname === "/advice";

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-150",
        isScrolled
          ? "bg-offWhite text-ink border-b border-border"
          : "bg-transparent text-offWhite",
      ].join(" ")}
    >
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-wheat focus:text-ink focus:rounded focus:ring-2 focus:ring-wheat min-h-[44px] inline-flex items-center text-sm font-semibold"
      >
        {locale === "bn" ? "মূল বিষয়বস্তুতে যান" : "Skip to main content"}
      </a>

      {/* 8px scale container: max 1200px, 24px mobile padding, 48px desktop padding */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="h-16 lg:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className={[
              "min-h-[44px] inline-flex items-center gap-2.5 rounded transition-colors duration-150 shrink-0",
              isScrolled
                ? "text-deepGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                : "text-offWhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wheat",
            ].join(" ")}
            aria-label="AgriShift AI Home"
          >
            <span
              className={[
                "w-9 h-9 sm:w-10 sm:h-10 rounded border flex items-center justify-center shrink-0 transition-colors duration-150",
                isScrolled
                  ? "border-border bg-offWhite text-deepGreen"
                  : "border-wheat/40 bg-[#14281F]/[0.40] text-wheat",
              ].join(" ")}
              aria-hidden="true"
            >
              <Plant size={22} weight="regular" />
            </span>
            <span className="font-heading font-bold text-lg sm:text-xl tracking-tight">
              AgriShift AI
            </span>
          </Link>

          {/* Desktop Navigation Links (Home, Get Advice, About only) */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label={locale === "bn" ? "প্রধান নেভিগেশন" : "Main Navigation"}
          >
            <Link
              href="/"
              className={[
                "min-h-[44px] inline-flex items-center text-sm font-medium transition-colors duration-150 rounded px-1",
                isScrolled
                  ? isHomeActive
                    ? "text-deepGreen font-semibold underline underline-offset-4"
                    : "text-ink hover:text-deepGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                  : isHomeActive
                  ? "text-wheat font-semibold underline underline-offset-4"
                  : "text-offWhite hover:text-wheat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wheat",
              ].join(" ")}
            >
              {t("home")}
            </Link>

            <Link
              href="/advice"
              className={[
                "min-h-[44px] inline-flex items-center text-sm font-medium transition-colors duration-150 rounded px-1",
                isScrolled
                  ? isAdviceActive
                    ? "text-deepGreen font-semibold underline underline-offset-4"
                    : "text-ink hover:text-deepGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                  : isAdviceActive
                  ? "text-wheat font-semibold underline underline-offset-4"
                  : "text-offWhite hover:text-wheat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wheat",
              ].join(" ")}
            >
              {t("advice")}
            </Link>

            <Link
              href="/#problem"
              className={[
                "min-h-[44px] inline-flex items-center text-sm font-medium transition-colors duration-150 rounded px-1",
                isScrolled
                  ? "text-ink hover:text-deepGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                  : "text-offWhite hover:text-wheat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wheat",
              ].join(" ")}
            >
              {t("about")}
            </Link>
          </nav>

          {/* Desktop Right Side: Language Combobox + Quick Switcher + Primary Button */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageCombobox isScrolled={isScrolled} />

            {/* Language Switcher */}
            <div
              role="group"
              aria-label="Language selection"
              className={[
                "inline-flex p-0.5 rounded border transition-colors duration-150",
                isScrolled ? "border-border bg-offWhite" : "border-wheat/40 bg-transparent",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => switchLocale("en")}
                aria-label="English"
                className={[
                  "min-h-[36px] min-w-[36px] px-2.5 py-1 text-xs font-semibold rounded transition-colors duration-150",
                  locale === "en"
                    ? isScrolled
                      ? "bg-deepGreen text-offWhite"
                      : "bg-wheat text-ink"
                    : isScrolled
                    ? "text-soilBrown hover:text-ink focus-visible:ring-2 focus-visible:ring-deepGreen"
                    : "text-offWhite/80 hover:text-wheat focus-visible:ring-2 focus-visible:ring-wheat",
                ].join(" ")}
                aria-pressed={locale === "en"}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => switchLocale("bn")}
                aria-label="বাংলা"
                className={[
                  "min-h-[36px] min-w-[36px] px-2.5 py-1 text-xs font-semibold rounded transition-colors duration-150",
                  locale === "bn"
                    ? isScrolled
                      ? "bg-deepGreen text-offWhite"
                      : "bg-wheat text-ink"
                    : isScrolled
                    ? "text-soilBrown hover:text-ink focus-visible:ring-2 focus-visible:ring-deepGreen"
                    : "text-offWhite/80 hover:text-wheat focus-visible:ring-2 focus-visible:ring-wheat",
                ].join(" ")}
                aria-pressed={locale === "bn"}
              >
                বাংলা
              </button>
            </div>

            {/* Primary Action Button */}
            <Link
              href="/advice"
              className={[
                "min-h-[44px] inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded transition-colors duration-150",
                isScrolled
                  ? "bg-deepGreen text-offWhite hover:bg-soilBrown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                  : "bg-wheat text-ink hover:bg-soilBrown hover:text-offWhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wheat",
              ].join(" ")}
            >
              {t("primaryCta")}
            </Link>
          </div>

          {/* Mobile Right: Menu Button (44px touch target, visible against bright sun) */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={[
                "min-w-[44px] min-h-[44px] p-2 rounded border flex items-center justify-center transition-colors duration-150",
                isScrolled
                  ? "border-border bg-offWhite text-ink hover:text-deepGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                  : "border-wheat/50 bg-[#14281F]/[0.60] text-wheat hover:bg-[#14281F]/[0.80] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wheat",
              ].join(" ")}
              aria-expanded={isOpen}
              aria-label={
                isOpen
                  ? locale === "bn"
                    ? "মেনু বন্ধ করুন"
                    : "Close menu"
                  : locale === "bn"
                  ? "মেনু খুলুন"
                  : "Open menu"
              }
            >
              {isOpen ? <X size={26} weight="regular" /> : <List size={26} weight="regular" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Full-Width Dropdown Panel */}
      {isOpen && (
        <div className="md:hidden w-full bg-offWhite text-ink border-b border-border shadow-none">
          <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-4">
            <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
              <Link
                href="/"
                className={[
                  "min-h-[48px] flex items-center px-3 rounded text-base font-medium transition-colors duration-150",
                  isHomeActive
                    ? "text-deepGreen font-semibold bg-[#E5ECE7]"
                    : "text-ink hover:bg-[#E9E4D9]",
                ].join(" ")}
              >
                {t("home")}
              </Link>
              <Link
                href="/advice"
                className={[
                  "min-h-[48px] flex items-center px-3 rounded text-base font-medium transition-colors duration-150",
                  isAdviceActive
                    ? "text-deepGreen font-semibold bg-[#E5ECE7]"
                    : "text-ink hover:bg-[#E9E4D9]",
                ].join(" ")}
              >
                {t("advice")}
              </Link>
              <Link
                href="/#problem"
                className="min-h-[48px] flex items-center px-3 rounded text-base font-medium text-ink hover:bg-[#E9E4D9] transition-colors duration-150"
              >
                {t("about")}
              </Link>
            </nav>

            {/* Mobile Language Switcher */}
            <div className="pt-2 border-t border-border flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-soilBrown font-medium">
                  {locale === "bn" ? "ভাষা নির্বাচন:" : "Language:"}
                </span>
                <LanguageCombobox isScrolled={true} />
              </div>
              <div
                role="group"
                aria-label="Language selection"
                className="inline-flex p-0.5 rounded border border-border bg-offWhite self-end"
              >
                <button
                  type="button"
                  onClick={() => switchLocale("en")}
                  className={[
                    "min-h-[40px] px-3 py-1 text-xs font-semibold rounded transition-colors duration-150",
                    locale === "en" ? "bg-deepGreen text-offWhite" : "text-soilBrown",
                  ].join(" ")}
                  aria-pressed={locale === "en"}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => switchLocale("bn")}
                  className={[
                    "min-h-[40px] px-3 py-1 text-xs font-semibold rounded transition-colors duration-150",
                    locale === "bn" ? "bg-deepGreen text-offWhite" : "text-soilBrown",
                  ].join(" ")}
                  aria-pressed={locale === "bn"}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* Mobile Primary Button */}
            <div className="pt-2">
              <Link
                href="/advice"
                className="min-h-[48px] w-full flex items-center justify-center px-4 py-2.5 text-base font-semibold rounded bg-deepGreen text-offWhite hover:bg-soilBrown transition-colors duration-150"
              >
                {t("primaryCta")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Named alias so existing imports of Navbar remain fully compatible
export { Header as Navbar };
