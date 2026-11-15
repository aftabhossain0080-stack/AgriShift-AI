"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Tractor,
  ArrowsClockwise,
  ArrowRight,
  ShieldCheck,
  Recycle,
} from "@phosphor-icons/react";

export function HarvestSection() {
  const t = useTranslations("harvest");

  return (
    <section id="harvest" className="w-full border-b border-border bg-offWhite py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded border border-border bg-offWhite px-3 py-1 text-xs font-semibold uppercase tracking-wider text-soilBrown">
            <Tractor size={14} weight="regular" className="text-deepGreen" />
            <span>Post-Harvest & Rotation</span>
          </div>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 font-body text-lg text-ink/85 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Editorial Layout: Small Cropped Machinery Image alongside Agronomic Reality */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Left Column: Machinery Photo Used ONCE, SMALL, Cropped away from commercial logos */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="max-w-md w-full overflow-hidden rounded border border-border bg-offWhite">
              {/* Cropped container with object-cover and object-position: right to de-emphasize brand logos */}
              <div className="relative aspect-[4/3] w-full bg-offWhite overflow-hidden">
                <Image
                  src="/images/harvest-machinery.png"
                  alt="Post-harvest residue management machinery operating in an agricultural field"
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  className="object-cover object-right"
                />
              </div>
              <div className="border-t border-border bg-offWhite p-4">
                <p className="font-body text-xs text-soilBrown leading-relaxed">
                  Field context: Custom hiring centres (CHCs) and village cooperatives deploy shared straw management machinery to help smallholders shred and incorporate crop residues quickly between seasons.
                </p>
              </div>
            </div>

            {/* Mandatory Context Note */}
            <div className="mt-4 max-w-md rounded border border-border bg-offWhite p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={18} weight="regular" className="text-deepGreen shrink-0 mt-0.5" />
                <p className="font-body text-xs text-ink/80 leading-relaxed">
                  <span className="font-semibold text-ink">Scale Reality:</span> Large-scale mechanised harvesters are rare among 1 to 3 acre smallholders, where custom hiring centres and cooperative equipment are emerging for post-harvest residue management.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Agronomic Practices and Transition Guidance */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Mechanisation Reality Card */}
            <div className="rounded border border-border bg-offWhite p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-offWhite text-deepGreen">
                  <Tractor size={20} weight="regular" />
                </div>
                <h3 className="font-heading text-xl font-bold text-ink">
                  {t("mechanisationTitle")}
                </h3>
              </div>
              <p className="mt-3 font-body text-sm sm:text-base text-ink/80 leading-relaxed">
                {t("mechanisationBody")}
              </p>
              <div className="mt-4 border-t border-border pt-3 text-xs text-soilBrown">
                Primary Agricultural Credit Societies (PACS) enable cost sharing so individual smallholders avoid heavy capital expenditure.
              </div>
            </div>

            {/* Rotation & Soil Protection Card */}
            <div className="rounded border border-border bg-offWhite p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-offWhite text-soilBrown">
                  <ArrowsClockwise size={20} weight="regular" />
                </div>
                <h3 className="font-heading text-xl font-bold text-ink">
                  {t("rotationTitle")}
                </h3>
              </div>
              <p className="mt-3 font-body text-sm sm:text-base text-ink/80 leading-relaxed">
                {t("rotationBody")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded border border-border bg-offWhite px-2.5 py-1 text-xs font-medium text-deepGreen">
                  Potato into Mustard: Breaks Nematode Cycles
                </span>
                <span className="rounded border border-border bg-offWhite px-2.5 py-1 text-xs font-medium text-deepGreen">
                  Paddy into Lentil: Restores Root-zone Nitrogen
                </span>
              </div>
            </div>

            {/* In-situ Stubble Retention Card */}
            <div className="rounded border border-border bg-offWhite p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-offWhite text-deepGreen">
                  <Recycle size={20} weight="regular" />
                </div>
                <h3 className="font-heading text-xl font-bold text-ink">
                  {t("stubbleTitle")}
                </h3>
              </div>
              <p className="mt-3 font-body text-sm sm:text-base text-ink/80 leading-relaxed">
                {t("stubbleBody")}
              </p>
              <div className="mt-4 border-t border-border pt-4 flex items-center justify-between">
                <span className="text-xs text-soilBrown">
                  Zero open burning preserves air quality and micro-biological soil activity.
                </span>
                <Link
                  href="/demo"
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-deepGreen hover:text-soilBrown hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
                >
                  <span>Evaluate rotation fit</span>
                  <ArrowRight size={16} weight="regular" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
