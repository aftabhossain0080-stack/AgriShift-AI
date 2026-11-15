"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ListNumbers, ShieldCheck } from "@phosphor-icons/react";

export function MethodSection() {
  const t = useTranslations("methodSection");

  return (
    <section id="method" className="w-full border-b border-border bg-offWhite py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded border border-border bg-offWhite px-3 py-1 text-xs font-semibold uppercase tracking-wider text-soilBrown">
            <ListNumbers size={14} weight="regular" className="text-deepGreen" />
            <span>Operational Method</span>
          </div>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 font-body text-base sm:text-lg text-ink/80 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Numbered Steps 1 to 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Step 1 */}
          <div className="rounded border border-border bg-offWhite p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="font-heading text-3xl font-bold text-deepGreen block">
                {t("step1.num")}
              </span>
              <h3 className="mt-2 font-heading text-lg font-bold text-ink">
                {t("step1.title")}
              </h3>
              <p className="mt-2 font-body text-sm text-ink/80 leading-relaxed">
                {t("step1.desc")}
              </p>
            </div>
            <div className="pt-3 border-t border-border text-xs text-soilBrown">
              Local input parameters
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded border border-border bg-offWhite p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="font-heading text-3xl font-bold text-deepGreen block">
                {t("step2.num")}
              </span>
              <h3 className="mt-2 font-heading text-lg font-bold text-ink">
                {t("step2.title")}
              </h3>
              <p className="mt-2 font-body text-sm text-ink/80 leading-relaxed">
                {t("step2.desc")}
              </p>
            </div>
            <div className="pt-3 border-t border-border text-xs text-soilBrown">
              Direct telemetry ingestion
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded border border-border bg-offWhite p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="font-heading text-3xl font-bold text-deepGreen block">
                {t("step3.num")}
              </span>
              <h3 className="mt-2 font-heading text-lg font-bold text-ink">
                {t("step3.title")}
              </h3>
              <p className="mt-2 font-body text-sm text-ink/80 leading-relaxed">
                {t("step3.desc")}
              </p>
            </div>
            <div className="pt-3 border-t border-border text-xs text-soilBrown">
              ICAR-BCKV calibrated matrix
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded border border-border bg-offWhite p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="font-heading text-3xl font-bold text-deepGreen block">
                {t("step4.num")}
              </span>
              <h3 className="mt-2 font-heading text-lg font-bold text-ink">
                {t("step4.title")}
              </h3>
              <p className="mt-2 font-body text-sm text-ink/80 leading-relaxed">
                {t("step4.desc")}
              </p>
            </div>
            <div className="pt-3 border-t border-border text-xs text-soilBrown">
              Delivered in English and Bengali
            </div>
          </div>
        </div>

        {/* Small harvest-machinery.png beside post-harvest rotation details */}
        <div className="mt-12 rounded border border-border bg-offWhite p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Machinery Photo: Used once, small, cropped so brand logos are not the focal point */}
            <div className="lg:col-span-4">
              <div className="overflow-hidden rounded border border-border bg-offWhite max-w-sm">
                <div className="relative aspect-[4/3] w-full bg-offWhite overflow-hidden">
                  <Image
                    src="/images/harvest-machinery.png"
                    alt="Post-harvest residue management machinery operating in an agricultural field"
                    fill
                    sizes="(max-width: 1024px) 100vw, 30vw"
                    className="object-cover object-right"
                  />
                </div>
                <div className="p-3 border-t border-border bg-offWhite">
                  <p className="font-body text-xs text-soilBrown leading-relaxed">
                    Custom hiring centres provide shared straw choppers so smallholders avoid stubble burning between seasons.
                  </p>
                </div>
              </div>
            </div>

            {/* Rotation and soil preservation guidance */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={20} weight="regular" className="text-deepGreen shrink-0 mt-0.5" />
                <h3 className="font-heading text-xl font-bold text-ink">
                  Post-Harvest Soil Health and Residue Management
                </h3>
              </div>
              <p className="font-body text-base text-ink/80 leading-relaxed">
                {t("machineryCaption")}
              </p>
              <p className="font-body text-sm text-soilBrown leading-relaxed">
                Intensive potato and paddy rotations drain subsoil nutrients. AgriShift AI advises short-duration legume breaks such as lentil or pulse that restore biological nitrogen and prevent pathogen persistence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
