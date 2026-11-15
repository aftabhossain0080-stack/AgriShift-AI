"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { MapPin } from "@phosphor-icons/react";

export function ProblemSection() {
  const t = useTranslations("problem");

  return (
    <section id="problem" className="w-full border-b border-border bg-offWhite py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded border border-border bg-offWhite px-3 py-1 text-xs font-semibold uppercase tracking-wider text-soilBrown">
            <MapPin size={14} weight="regular" className="text-deepGreen" />
            <span>Smallholder Field Context</span>
          </div>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-center">
          {/* Left Column: Landscape image in 1px bordered frame with respectful caption */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="overflow-hidden rounded border border-border bg-offWhite">
              <div className="relative aspect-[16/10] w-full bg-offWhite">
                <Image
                  src="/images/bullock-plough.png"
                  alt="A smallholder farmer preparing dry soil using a traditional wooden plough drawn by two white bullocks"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="border-t border-border bg-offWhite p-4">
                <p className="font-body text-xs text-soilBrown leading-relaxed">
                  Field reality: Land preparation using traditional draft cattle. On plots between 1 and 3 acres, soil texture, drainage, and residual moisture dictate crop viability long before seed purchase.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Two short paragraphs on guesswork and unpredictable weather. Plain prose. */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-base sm:text-lg text-ink/85 font-body leading-relaxed">
            <p>
              {t("body1")}
            </p>
            <p>
              {t("body2")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
