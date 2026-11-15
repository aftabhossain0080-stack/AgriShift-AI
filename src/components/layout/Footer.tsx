"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Plant } from "@phosphor-icons/react";
import { HUMAN_LOCALES } from "@/lib/i18n/languages";

export function Footer() {
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="w-full border-t border-border bg-offWhite text-ink mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Context (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="min-h-[44px] inline-flex items-center gap-2.5 text-deepGreen rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
              aria-label="AgriShift AI Home"
            >
              <span
                className="w-10 h-10 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                <Plant size={24} weight="regular" />
              </span>
              <span className="font-heading font-bold text-xl sm:text-2xl tracking-tight text-deepGreen">
                AgriShift AI
              </span>
            </Link>

            <p className="text-sm sm:text-base text-soilBrown leading-relaxed max-w-md">
              {tFooter("context")}
            </p>

            <div className="p-3.5 rounded-md border border-border bg-offWhite text-xs text-soilBrown max-w-lg leading-relaxed">
              <span className="font-semibold text-deepGreen block mb-1">
                {locale === "bn"
                  ? "আর্থ অবজারভেশন ডেটা উৎস"
                  : "Earth Observation Data Sources"}
              </span>
              {tFooter("notice")}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-base text-deepGreen tracking-tight">
              {tFooter("links")}
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className="min-h-[44px] inline-flex items-center text-sm text-soilBrown hover:text-deepGreen hover:underline underline-offset-4 decoration-deepGreen rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                >
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="min-h-[44px] inline-flex items-center text-sm text-soilBrown hover:text-deepGreen hover:underline underline-offset-4 decoration-deepGreen rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                >
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/demo"
                  className="min-h-[44px] inline-flex items-center text-sm text-soilBrown hover:text-deepGreen hover:underline underline-offset-4 decoration-deepGreen rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                >
                  {tNav("demo")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-base text-deepGreen tracking-tight">
              {tFooter("legal")}
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/terms"
                  className="min-h-[44px] inline-flex items-center text-sm text-soilBrown hover:text-deepGreen hover:underline underline-offset-4 decoration-deepGreen rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                >
                  {tNav("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="min-h-[44px] inline-flex items-center text-sm text-soilBrown hover:text-deepGreen hover:underline underline-offset-4 decoration-deepGreen rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                >
                  {tNav("privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Machine Translation Disclosure Notice */}
        {!(HUMAN_LOCALES as readonly string[]).includes(locale) && (
          <div className="mt-8 p-3 bg-offWhite border border-border rounded-[6px] text-xs text-soilBrown flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>This page is machine translated. Translations are automated for accessibility across 130+ languages.</span>
            <a
              href="mailto:translations@agrishift.org?subject=Translation%20Feedback"
              className="text-deepGreen underline font-semibold hover:text-soilBrown transition-colors"
            >
              Report a translation problem
            </a>
          </div>
        )}

        {/* Bottom Legal Disclaimer and Copyright */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-soilBrown leading-relaxed max-w-2xl">
            {tFooter("disclaimer")}
          </p>

          <p className="text-xs text-soilBrown shrink-0">
            © {new Date().getFullYear()} AgriShift AI. {tFooter("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
