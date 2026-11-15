import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import { Link } from "@/i18n/routing";
import {
  getCropProfileBySlug,
  getAllCropSlugs,
} from "@/lib/crop-knowledge";
import {
  Plant,
  Thermometer,
  Drop,
  Calendar,
  WarningCircle,
  ArrowLeft,
  CheckCircle,
  BookOpen,
} from "@phosphor-icons/react/dist/ssr";

interface PageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export function generateStaticParams() {
  const slugs = getAllCropSlugs();
  const locales = ["en", "bn"];
  const params: Array<{ locale: string; slug: string }> = [];

  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }

  return params;
}

export async function generateMetadata({
  params: { locale, slug },
}: PageProps): Promise<Metadata> {
  const crop = getCropProfileBySlug(slug);
  if (!crop) {
    return { title: "Crop Profile | AgriShift AI" };
  }

  const isBn = locale === "bn";
  const name = isBn ? crop.nameBn : crop.name;

  return {
    title: `${name} Agronomic Profile | AgriShift AI`,
    description: `ICAR and BCKV agronomic guidelines for cultivating ${name}.`,
  };
}

export default function CropDetailPage({
  params: { locale, slug },
}: PageProps) {
  const crop = getCropProfileBySlug(slug);
  if (!crop) {
    notFound();
  }

  const isBn = locale === "bn";

  return (
    <div className="flex min-h-screen flex-col bg-offWhite text-ink font-body">
      <Navbar />

      <main id="main-content" className="flex-1 w-full py-10 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-soilBrown">
            <Link
              href="/results"
              className="min-h-[44px] inline-flex items-center gap-1.5 text-soilBrown hover:text-deepGreen hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
            >
              <ArrowLeft size={16} weight="regular" />
              <span>{isBn ? "সুপারিশে ফিরে যান" : "Back to Recommendations"}</span>
            </Link>
            <span aria-hidden="true" className="text-border">/</span>
            <span className="font-semibold text-ink">{crop.name}</span>
          </nav>

          {/* Crop Profile Header Banner */}
          <div className="p-6 sm:p-8 bg-offWhite border border-border rounded space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded border border-border bg-[#E5ECE7] px-2.5 py-1 text-xs font-semibold text-deepGreen uppercase tracking-wider mb-2">
                  <Plant size={14} weight="regular" />
                  <span>Crop Agronomic Catalog</span>
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-ink">
                  {crop.name}
                </h1>
                <p className="font-bengali text-lg text-soilBrown font-medium">
                  {crop.nameBn}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-soilBrown block">
                  Botanical Classification
                </span>
                <span className="text-base font-semibold italic text-ink block">
                  {crop.botanical_name}
                </span>
                <span className="text-xs text-soilBrown block">
                  Family: {crop.family}
                </span>
              </div>
            </div>

            <p className="font-body text-base text-ink/85 leading-relaxed pt-2 border-t border-border">
              {crop.summary}
            </p>
          </div>

          {/* Key Agronomic Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#E9E4D9] rounded border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-soilBrown">
                <Thermometer size={16} weight="regular" className="text-deepGreen shrink-0" />
                <span>Thermal Range</span>
              </div>
              <p className="font-heading text-lg font-bold text-ink">
                {crop.optimal_temperature}
              </p>
              <p className="text-[11px] text-soilBrown">
                NASA POWER baseline
              </p>
            </div>

            <div className="p-4 bg-[#E9E4D9] rounded border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-soilBrown">
                <Drop size={16} weight="regular" className="text-deepGreen shrink-0" />
                <span>Water Demand</span>
              </div>
              <p className="font-heading text-lg font-bold text-ink">
                {crop.water_requirement_category}
              </p>
              <p className="text-[11px] text-soilBrown">
                {crop.total_water_requirement_mm}
              </p>
            </div>

            <div className="p-4 bg-[#E9E4D9] rounded border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-soilBrown">
                <Calendar size={16} weight="regular" className="text-deepGreen shrink-0" />
                <span>Crop Duration</span>
              </div>
              <p className="font-heading text-lg font-bold text-ink">
                {crop.duration_days}
              </p>
              <p className="text-[11px] text-soilBrown">
                Seasons: {crop.suitable_seasons.join(", ")}
              </p>
            </div>

            <div className="p-4 bg-[#E9E4D9] rounded border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-soilBrown">
                <Plant size={16} weight="regular" className="text-deepGreen shrink-0" />
                <span>Irrigations</span>
              </div>
              <p className="font-heading text-lg font-bold text-ink">
                {crop.recommended_irrigations} Scheduled
              </p>
              <p className="text-[11px] text-soilBrown">
                Critical growth stages
              </p>
            </div>
          </div>

          {/* Soil Dynamics and Rotation Impact */}
          <div className="p-6 bg-offWhite border border-border rounded space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <CheckCircle size={20} weight="regular" className="text-deepGreen shrink-0" />
              <h2 className="font-heading text-xl font-bold text-ink">
                Soil Nutrient and Rotation Dynamics
              </h2>
            </div>
            <p className="font-body text-sm sm:text-base text-ink/85 leading-relaxed">
              {crop.soil_impact}
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-soilBrown block mb-2">
                Favorable Soil Classifications:
              </span>
              <div className="flex flex-wrap gap-2">
                {crop.optimal_soils.map((soil) => (
                  <span
                    key={soil}
                    className="px-2.5 py-1 rounded border border-border bg-[#E9E4D9] text-xs font-semibold text-ink"
                  >
                    {soil}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sowing and Package of Practices */}
          <div className="p-6 bg-offWhite border border-border rounded space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="font-heading text-xl font-bold text-ink">
                Recommended Package of Practices
              </h2>
              <p className="text-xs text-soilBrown mt-1">
                Standard field agronomy guidelines for smallholder plots
              </p>
            </div>
            <ol className="space-y-3 font-body text-sm text-ink/85 list-decimal list-inside leading-relaxed">
              {crop.package_of_practices.map((practice, idx) => (
                <li key={idx} className="pl-1">
                  {practice}
                </li>
              ))}
            </ol>
          </div>

          {/* Pest, Disease, and Environmental Risks */}
          <div className="p-6 bg-offWhite border border-border rounded space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <WarningCircle size={20} weight="regular" className="text-alertRed shrink-0" />
              <h2 className="font-heading text-xl font-bold text-ink">
                Disease and Pest Advisories
              </h2>
            </div>
            <ul className="space-y-2.5 font-body text-sm text-ink/85 leading-relaxed">
              {crop.pest_and_disease_notes.map((pest, idx) => (
                <li key={idx} className="p-3 rounded border border-border bg-offWhite">
                  {pest}
                </li>
              ))}
            </ul>
          </div>

          {/* Agronomic Limitations */}
          <div className="p-6 bg-offWhite border border-border rounded space-y-4">
            <h2 className="font-heading text-xl font-bold text-ink border-b border-border pb-3">
              Agronomic Constraints and Limitations
            </h2>
            <ul className="space-y-2 font-body text-sm text-soilBrown leading-relaxed">
              {crop.limitations.map((lim, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-deepGreen font-bold">•</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional Sources */}
          <div className="p-5 bg-offWhite border border-border rounded space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen size={18} weight="regular" className="text-deepGreen shrink-0" />
              <h3 className="text-sm font-heading font-semibold text-ink">
                Research Citations and Advisory Sources
              </h3>
            </div>
            <div className="space-y-1 text-xs text-soilBrown">
              {crop.sources.map((src, idx) => (
                <p key={idx}>{src}</p>
              ))}
            </div>
          </div>

          {/* Bottom Action */}
          <div className="pt-4 flex items-center justify-between">
            <Link
              href="/results"
              className="min-h-[44px] px-6 py-2.5 rounded border border-deepGreen bg-deepGreen text-offWhite font-semibold hover:bg-soilBrown hover:border-soilBrown transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={18} weight="regular" />
              <span>{isBn ? "ফলাফল তালিকায় ফিরে যান" : "Back to Results"}</span>
            </Link>

            <Link
              href="/advice"
              className="min-h-[44px] px-6 py-2.5 rounded border border-border bg-offWhite text-soilBrown font-semibold hover:border-soilBrown hover:text-ink transition-colors inline-flex items-center gap-2"
            >
              <span>{isBn ? "নতুন মূল্যায়ন শুরু করুন" : "Start New Assessment"}</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
