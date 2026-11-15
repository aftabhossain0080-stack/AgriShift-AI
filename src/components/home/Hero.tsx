"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative w-full min-h-[88svh] flex items-center overflow-visible pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* 1. Full-bleed background with horizon in lower half (z-0 sits above page bg) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/field-sunset.png"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover object-[50%_60%]"
          aria-hidden="true"
        />
        {/* 2. Flat readability layer (contrast ratio > 4.5:1 against brightest sun) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: "rgba(20, 40, 31, 0.74)" }}
          aria-hidden="true"
        />
      </div>

      {/* 8px scale container: max 1200px, 24px mobile padding, 48px desktop padding */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* 3. Text Column: left aligned, max-width 38rem */}
          <div className="lg:col-span-7 max-w-[38rem] flex flex-col items-start gap-6">
            {/* Plain text eyebrow with 24px wheat rule */}
            <div className="flex items-center gap-3">
              <span className="w-6 h-[1px] bg-wheat shrink-0" aria-hidden="true" />
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-wheat">
                {t("eyebrow")}
              </span>
            </div>

            {/* H1 in Fraunces, off-white, with "satellite data" in wheat. Fluid clamp scales down to 1.9rem so 360px never clips */}
            <h1 className="font-heading text-offWhite text-[clamp(1.9rem,5.5vw,4.5rem)] leading-[1.05] tracking-[-0.01em] break-words">
              {t.rich("headline", {
                wheat: (chunks) => <span className="text-wheat">{chunks}</span>,
              })}
            </h1>

            {/* One paragraph in Source Sans 3, off-white, max 2 lines on desktop */}
            <p className="font-body text-[1.25rem] text-offWhite leading-snug max-w-xl">
              {t("subheadline")}
            </p>

            {/* ONE button only: wheat bg, ink text, 6px radius, 48px high */}
            <div className="pt-2">
              <Link
                href="/advice"
                className="inline-flex h-12 min-h-[48px] items-center justify-center px-6 rounded bg-wheat text-ink font-body text-base font-semibold transition-colors duration-150 hover:bg-soilBrown hover:text-offWhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wheat focus-visible:ring-offset-2 focus-visible:ring-offset-[#14281F]"
              >
                {t("cta")}
              </Link>
            </div>
          </div>

          {/* 4. Farmer Photo: editorial layout, 4:5 aspect ratio, 96px overlap on desktop */}
          <div className="lg:col-span-5 w-full">
            <div className="w-full max-w-[calc(100%-32px)] mx-auto lg:max-w-none relative z-20 aspect-[4/5] rounded overflow-hidden lg:-mb-[96px]">
              <Image
                src="/images/rice-transplanting.png"
                alt="Farmer transplanting rice seedlings in a flooded paddy"
                fill
                priority
                sizes="(min-width: 1024px) 34vw, 80vw"
                className="object-cover object-[50%_25%]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
