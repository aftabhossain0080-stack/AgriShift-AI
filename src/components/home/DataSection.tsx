"use client";

import { useTranslations } from "next-intl";
import { GlobeHemisphereEast, Thermometer, CloudRain, Drop } from "@phosphor-icons/react";

export function DataSection() {
  const t = useTranslations("dataSection");

  return (
    <section id="data" className="w-full border-b border-border bg-offWhite py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded border border-border bg-offWhite px-3 py-1 text-xs font-semibold uppercase tracking-wider text-soilBrown">
            <GlobeHemisphereEast size={14} weight="regular" className="text-deepGreen" />
            <span>Earth Observation Feeds</span>
          </div>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 font-body text-base sm:text-lg text-ink/80 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Simple three-row definition list with differing row content */}
        <dl className="divide-y divide-border border-y border-border">
          {/* Row 1: NASA POWER */}
          <div className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <dt className="md:col-span-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded border border-border bg-offWhite text-deepGreen flex items-center justify-center shrink-0">
                <Thermometer size={22} weight="regular" />
              </span>
              <div>
                <span className="font-heading font-bold text-lg text-ink block">
                  {t("power.title")}
                </span>
                <span className="text-xs text-soilBrown block">
                  Agro-Climatology & Solar Radiation
                </span>
              </div>
            </dt>
            <dd className="md:col-span-8 font-body text-base text-ink/85 leading-relaxed pt-1">
              {t("power.desc")}
            </dd>
          </div>

          {/* Row 2: NASA GPM IMERG */}
          <div className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <dt className="md:col-span-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded border border-border bg-offWhite text-deepGreen flex items-center justify-center shrink-0">
                <CloudRain size={22} weight="regular" />
              </span>
              <div>
                <span className="font-heading font-bold text-lg text-ink block">
                  {t("gpm.title")}
                </span>
                <span className="text-xs text-soilBrown block">
                  Precipitation & Dry-Spell Monitoring
                </span>
              </div>
            </dt>
            <dd className="md:col-span-8 font-body text-base text-ink/85 leading-relaxed pt-1">
              {t("gpm.desc")}
            </dd>
          </div>

          {/* Row 3: NASA SMAP Level-4 */}
          <div className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <dt className="md:col-span-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded border border-border bg-offWhite text-deepGreen flex items-center justify-center shrink-0">
                <Drop size={22} weight="regular" />
              </span>
              <div>
                <span className="font-heading font-bold text-lg text-ink block">
                  {t("smap.title")}
                </span>
                <span className="text-xs text-soilBrown block">
                  Surface & Root-Zone Moisture Fractions
                </span>
              </div>
            </dt>
            <dd className="md:col-span-8 font-body text-base text-ink/85 leading-relaxed pt-1">
              {t("smap.desc")}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
