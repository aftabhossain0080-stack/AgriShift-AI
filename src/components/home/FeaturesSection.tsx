"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  ChartBar,
  Drop,
  ArrowsClockwise,
  Warning,
  ArrowRight,
  Scales,
  Plant,
} from "@phosphor-icons/react";

export function FeaturesSection() {
  const t = useTranslations("features");

  return (
    <section id="features" className="w-full border-b border-border bg-offWhite py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded border border-border bg-offWhite px-3 py-1 text-xs font-semibold uppercase tracking-wider text-soilBrown">
            <Scales size={14} weight="regular" className="text-deepGreen" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 font-body text-lg text-ink/85 leading-relaxed">
            Every agronomic recommendation synthesises multi-sensor Earth observation data into transparent decision metrics designed for smallholder farm management.
          </p>
        </div>

        {/* Asymmetric Editorial Layout (Rule 6: 60/40 split with varied block sizes, no row of three identical cards) */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-stretch">
          {/* Primary 60% Block: 100-Point Scoring Engine Deep Dive */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded border border-border bg-offWhite p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded border border-border bg-offWhite text-deepGreen">
                    <ChartBar size={22} weight="regular" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-ink">
                      100-Point Transparent Scoring
                    </h3>
                    <p className="text-xs text-soilBrown">
                      Auditable agronomic matrix based on ICAR and BCKV research
                    </p>
                  </div>
                </div>
                <span className="rounded border border-border px-2.5 py-1 text-xs font-semibold text-deepGreen">
                  0 to 100 pts
                </span>
              </div>

              <p className="mt-5 font-body text-sm sm:text-base text-ink/80 leading-relaxed">
                Rather than treating crop selection as a black-box suggestion, AgriShift AI breaks every recommendation down into four verifiable agronomic scores. Each crop is ranked independently against current field readings.
              </p>

              {/* Score Components Allocation */}
              <div className="mt-6 flex flex-col gap-4">
                <div className="rounded border border-border bg-offWhite p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">1. Temperature Suitability</span>
                    <span className="font-heading font-bold text-deepGreen">30 points max</span>
                  </div>
                  <p className="mt-1 text-xs text-ink/75 leading-relaxed">
                    Evaluates diurnal temperature ranges and night minimums from NASA POWER against crop-specific vegetative and flowering thresholds.
                  </p>
                  <div className="mt-2 h-2 w-full rounded bg-border/40 overflow-hidden">
                    <div className="h-full bg-deepGreen w-[30%]" />
                  </div>
                </div>

                <div className="rounded border border-border bg-offWhite p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">2. Soil Moisture Balance</span>
                    <span className="font-heading font-bold text-deepGreen">25 points max</span>
                  </div>
                  <p className="mt-1 text-xs text-ink/75 leading-relaxed">
                    Compares SMAP L4 surface and root-zone moisture percentiles to the required root-depth uptake for each target crop.
                  </p>
                  <div className="mt-2 h-2 w-full rounded bg-border/40 overflow-hidden">
                    <div className="h-full bg-deepGreen w-[25%]" />
                  </div>
                </div>

                <div className="rounded border border-border bg-offWhite p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">3. Rainfall & Water Budget</span>
                    <span className="font-heading font-bold text-deepGreen">25 points max</span>
                  </div>
                  <p className="mt-1 text-xs text-ink/75 leading-relaxed">
                    Monitors GPM IMERG 10-day precipitation accumulation and monsoon cessation dates to assess water adequacy.
                  </p>
                  <div className="mt-2 h-2 w-full rounded bg-border/40 overflow-hidden">
                    <div className="h-full bg-deepGreen w-[25%]" />
                  </div>
                </div>

                <div className="rounded border border-border bg-offWhite p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">4. Crop Rotation Synergy</span>
                    <span className="font-heading font-bold text-soilBrown">-20 to +20 points</span>
                  </div>
                  <p className="mt-1 text-xs text-ink/75 leading-relaxed">
                    Applies bonuses for legume breaks that restore soil nitrogen and penalises monoculture repetitions that build pest reservoirs.
                  </p>
                  <div className="mt-2 h-2 w-full rounded bg-border/40 overflow-hidden">
                    <div className="h-full bg-wheat w-[20%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-soilBrown">
                Rankings calculated across: Mustard, Lentil, Maize, Aman Paddy, Boro Paddy, Potato, Jute, Wheat.
              </span>
              <Link
                href="/demo"
                className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-deepGreen hover:text-soilBrown hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
              >
                <span>Test score generation</span>
                <ArrowRight size={16} weight="regular" />
              </Link>
            </div>
          </div>

          {/* Secondary 40% Column: Varied Functional Blocks */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Block A: Weekly Supplemental Irrigation Plan */}
            <div className="rounded border border-border bg-offWhite p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-offWhite text-deepGreen">
                  <Drop size={20} weight="regular" />
                </div>
                <h4 className="font-heading text-lg font-bold text-ink">
                  Weekly Irrigation Plan
                </h4>
              </div>
              <p className="mt-3 font-body text-sm text-ink/80 leading-relaxed">
                SMAP root-zone readings combine with Penman-Monteith reference evapotranspiration to calculate exact supplemental water needs in millimetres for the upcoming four weeks.
              </p>
              <div className="mt-4 grid grid-cols-4 gap-2 border-t border-border pt-3 text-center">
                <div className="rounded border border-border bg-offWhite p-2">
                  <div className="text-[10px] uppercase text-soilBrown">Week 1</div>
                  <div className="font-heading text-sm font-bold text-deepGreen mt-0.5">18 mm</div>
                </div>
                <div className="rounded border border-border bg-offWhite p-2">
                  <div className="text-[10px] uppercase text-soilBrown">Week 2</div>
                  <div className="font-heading text-sm font-bold text-deepGreen mt-0.5">22 mm</div>
                </div>
                <div className="rounded border border-border bg-offWhite p-2">
                  <div className="text-[10px] uppercase text-soilBrown">Week 3</div>
                  <div className="font-heading text-sm font-bold text-deepGreen mt-0.5">16 mm</div>
                </div>
                <div className="rounded border border-border bg-offWhite p-2">
                  <div className="text-[10px] uppercase text-soilBrown">Week 4</div>
                  <div className="font-heading text-sm font-bold text-deepGreen mt-0.5">12 mm</div>
                </div>
              </div>
            </div>

            {/* Block B: Rotation Advice & Soil Health */}
            <div className="rounded border border-border bg-offWhite p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-offWhite text-soilBrown">
                  <ArrowsClockwise size={20} weight="regular" />
                </div>
                <h4 className="font-heading text-lg font-bold text-ink">
                  Rotation Advice & Legume Breaks
                </h4>
              </div>
              <p className="mt-3 font-body text-sm text-ink/80 leading-relaxed">
                Flags nitrogen-depleting patterns in continuous paddy or potato fields. Prescribes short-duration legume breaks (lentil, pulse) that replenish organic nitrogen and break pathogen lifecycles.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-deepGreen">
                <Plant size={16} weight="regular" />
                <span>Conserves organic carbon and cuts fertiliser costs</span>
              </div>
            </div>

            {/* Block C: Climate Risk Alerts (Rule 11: 1px full border, icon for severity, no left stripe) */}
            <div className="rounded border border-border bg-offWhite p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-offWhite text-alertRed">
                  <Warning size={20} weight="regular" />
                </div>
                <h4 className="font-heading text-lg font-bold text-ink">
                  Climate Risk & Anomaly Alerts
                </h4>
              </div>
              <p className="mt-3 font-body text-sm text-ink/80 leading-relaxed">
                Generates dry-spell warnings and temperature-stress flags when GPM rainfall trends drop below median levels or NASA POWER tracks abnormal daytime highs during critical flowering stages.
              </p>
              <div className="mt-3 rounded border border-border bg-offWhite p-2.5 text-xs text-soilBrown leading-normal">
                Early alerts give smallholders lead time to adjust irrigation pumping schedules or apply protective mulch.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
