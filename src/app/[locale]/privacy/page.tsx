import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/layout";
import { Link } from "@/i18n/routing";
import {
  WarningCircle,
  ShieldCheck,
  ArrowLeft,
} from "@phosphor-icons/react/dist/ssr";

type PageProps = {
  params: { locale: string } | Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const isBengali = resolvedParams.locale === "bn";

  return {
    title: isBengali
      ? "গোপনীয়তা নীতি | AgriShift AI"
      : "Privacy Policy | AgriShift AI",
    description: isBengali
      ? "হুগলি জেলার কৃষকদের অবস্থান ও জমির তথ্য প্রক্রিয়াকরণ সংক্রান্ত AgriShift AI-এর বিস্তারিত গোপনীয়তা নীতি।"
      : "Detailed disclosures on location telemetry, field parameter handling, and data privacy for AgriShift AI in Hooghly, West Bengal.",
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale === "bn" ? "bn" : "en";
  const isBengali = locale === "bn";

  return (
    <div className="min-h-screen flex flex-col bg-offWhite text-ink">
      <Navbar />

      <main id="main-content" className="flex-1 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label={isBengali ? "ব্রেডক্রাম্ব ন্যাভিগেশন" : "Breadcrumb navigation"}
            className="flex items-center gap-2 text-sm text-soilBrown"
          >
            <Link
              href="/"
              className="min-h-[44px] inline-flex items-center gap-1.5 text-soilBrown hover:text-deepGreen hover:underline underline-offset-4 decoration-deepGreen rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
            >
              <ArrowLeft size={16} weight="regular" aria-hidden="true" />
              <span>{isBengali ? "হোম পেজে ফিরে যান" : "Back to Home"}</span>
            </Link>
            <span aria-hidden="true" className="text-border">/</span>
            <span className="text-ink font-semibold" aria-current="page">
              {isBengali ? "গোপনীয়তা নীতি" : "Privacy Policy"}
            </span>
          </nav>

          {/* Header */}
          <header className="space-y-4 border-b border-border pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-offWhite text-xs text-soilBrown uppercase tracking-wider font-semibold">
              <ShieldCheck size={16} weight="regular" aria-hidden="true" />
              <span>
                {isBengali
                  ? "ডেটা সুরক্ষা ও গোপনীয়তা প্রকাশ"
                  : "Data Governance & Privacy Disclosure"}
              </span>
            </div>

            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-deepGreen ${
                isBengali ? "font-bengali" : "font-heading"
              }`}
            >
              {isBengali ? "গোপনীয়তা নীতি" : "Privacy Policy"}
            </h1>

            <p className="text-sm sm:text-base text-soilBrown leading-relaxed">
              {isBengali
                ? "সংস্করণ ১.০ (খসড়া) | সর্বশেষ পরিমার্জন: নভেম্বর ২০২৬"
                : "Version 1.0 (Draft) | Last Updated: November 2026"}
            </p>
          </header>

          {/* Mandatory Prominent Lawyer Review Draft Banner */}
          <section
            aria-labelledby="draft-notice-heading"
            className="p-5 sm:p-6 rounded-md border border-border bg-offWhite space-y-2.5"
          >
            <div className="flex items-start gap-3">
              <span
                className="w-8 h-8 rounded-md border border-border bg-offWhite text-alertRed flex items-center justify-center shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <WarningCircle size={20} weight="regular" />
              </span>
              <div className="space-y-1">
                <h2
                  id="draft-notice-heading"
                  className="font-bold text-sm sm:text-base text-ink tracking-tight uppercase"
                >
                  DRAFT FOR REVIEW BY A LAWYER: This document is a preliminary operational draft and has not been finalized by licensed legal counsel.
                </h2>
                <p
                  className={`text-xs sm:text-sm text-soilBrown leading-relaxed ${
                    isBengali ? "font-bengali" : ""
                  }`}
                >
                  {isBengali
                    ? "আইনজীবী পর্যালোচনার জন্য খসড়া: এই নথিটি একটি প্রাথমিক কার্যক্ষম খসড়া এবং যোগ্য আইনি উপদেষ্টার দ্বারা চূড়ান্ত অনুমোদিত নয়। এই গোপনীয়তা প্রকাশনীতিতে ডেটা প্রক্রিয়াকরণ ও অবস্থান তথ্যের সঠিক পরিচালনা স্পষ্ট করা হয়েছে।"
                    : "This regulatory draft outlines operational data handling protocols during ongoing academic field trials. Finalized legal terminology will be validated by certified legal counsel prior to commercial dissemination."}
                </p>
              </div>
            </div>
          </section>

          {/* Detailed Explanation of Location and Field Data Handling */}
          <div className="space-y-10 sm:space-y-12 text-ink">
            {/* Section 1 */}
            <section aria-labelledby="section-1-title" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </span>
                <h2
                  id="section-1-title"
                  className={`text-xl sm:text-2xl font-bold text-deepGreen ${
                    isBengali ? "font-bengali" : "font-heading"
                  }`}
                >
                  {isBengali
                    ? "ভৌগোলিক স্থানাঙ্ক ও স্টেটলেস প্রসেসিং"
                    : "Geographic Coordinates and Stateless Processing"}
                </h2>
              </div>

              <div className={`space-y-3 text-sm sm:text-base leading-relaxed text-ink ${isBengali ? "font-bengali" : ""}`}>
                <p>
                  {isBengali
                    ? "AgriShift AI ব্যবহারের সময় কৃষকেরা তাদের অবস্থানের নাম, অক্ষাংশ এবং দ্রাঘিমাংশ প্রদান করেন। এই স্থানাঙ্কগুলি নাসা স্যাটেলাইট পর্যবেক্ষণ ডেটা অনুসন্ধানের জন্য ব্যবহৃত হয়।"
                    : "When users interact with AgriShift AI, they input a location name, latitude coordinate, and longitude coordinate representing their agricultural plot. These coordinates are used to retrieve satellite observations for that location."}
                </p>

                <p>
                  {isBengali
                    ? "এই স্থানাঙ্কগুলি কেবলমাত্র স্টেটলেস (Stateless) পদ্ধতিতে নাসা (NASA)-এর উন্মুক্ত আর্থ অবজারভেশন এপিআই (NASA POWER, GPM IMERG এবং SMAP) থেকে প্রাসঙ্গিক স্যাটেলাইট পর্যবেক্ষণ তথ্য অনুসন্ধানের জন্য সাময়িক মেমরিতে প্রক্রিয়াজাত হয়।"
                    : "These geographic coordinates are processed statelessly in volatile runtime memory solely to dispatch automated API requests to NASA Earth Observation data pipelines, including NASA POWER, GPM IMERG, and SMAP."}
                </p>

                <p className="font-semibold text-deepGreen">
                  {isBengali
                    ? "ভৌগোলিক স্থানাঙ্ক কোনো স্থায়ী ব্যবহারকারী ট্র্যাকিং ডাটাবেসে সংরক্ষণ করা হয় না।"
                    : "Coordinates are NOT stored in persistent user tracking databases."}
                </p>

                <p>
                  {isBengali
                    ? "প্ল্যাটফর্মটি কোনো পটভূমি জিপিএস ট্র্যাকিং করে না, ব্যবহারকারীর অবস্থানের কোনো ইতিহাস সংরক্ষণ করে না এবং ইন্টারনেট প্রোটোকল (আইপি) ঠিকানার সাথে নির্দিষ্ট কৃষকের জমি মানচিত্রের কোনো যোগসূত্র তৈরি করে না।"
                    : "The platform executes no background device GPS sniffing, maintains no persistent user geolocation histories, and does not link IP connection logs to specific agricultural parcels."}
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section aria-labelledby="section-2-title" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </span>
                <h2
                  id="section-2-title"
                  className={`text-xl sm:text-2xl font-bold text-deepGreen ${
                    isBengali ? "font-bengali" : "font-heading"
                  }`}
                >
                  {isBengali
                    ? "জমির বৈশিষ্ট্য ও কৃষি তথ্যের পরিচালনা"
                    : "Field Characteristics and Agronomic Inputs"}
                </h2>
              </div>

              <div className={`space-y-3 text-sm sm:text-base leading-relaxed text-ink ${isBengali ? "font-bengali" : ""}`}>
                <p>
                  {isBengali
                    ? "ব্যবহারকারী কর্তৃক প্রদত্ত তথ্যের মধ্যে রয়েছে জমির পরিমাণ (একরে), মাটির শ্রেণিবিভাগ (পলিমাটি, এঁটেল মাটি, বালুকাময় মাটি বা দোঁয়াশ মাটি), বর্তমান ফসল, পূর্ববর্তী ফসল এবং সেচ ব্যবস্থার প্রাপ্যতা সূচক।"
                    : "Field characteristics submitted by users include land area in acres, soil classification (Alluvial, Clay, Sandy, or Loamy), currently cultivated crops, previous rotation history, and irrigation infrastructure flags (such as canal supply, submersible tube well, shallow borewell, or rainfed status)."}
                </p>

                <p>
                  {isBengali
                    ? "এই পরামিতিগুলি শুধুমাত্র তাৎক্ষণিকভাবে কম্পিউটার মেমরিতে বিশ্লেষণ করা হয় যাতে বহুমাত্রিক কৃষি স্কোরিং ম্যাট্রিক্স, ফসল আবর্তন সুবিধা এবং সাপ্তাহিক সেচ সূচি প্রস্তুত করা যায়।"
                    : "These parameters are loaded into volatile system memory strictly to compute the multi-factor agronomic scoring matrix, assess rotational nitrogen synergies or disease carryover risks, and calculate weekly crop evapotranspiration water requirements."}
                </p>

                <p>
                  {isBengali
                    ? "ব্রাউজারে ফলাফল প্রদর্শনের পরপরই এই তথ্যগুলি সাময়িক মেমরি থেকে সম্পূর্ণ মুছে ফেলা হয়, অথবা ব্যক্তিগত পরিচয়হীন সামগ্রিক তথ্য হিসেবে আঞ্চলিক গবেষণা মেট্রিক্স (যেমন হুগলি অববাহিকায় সামগ্রিক ফসল রূপান্তরের সাধারণ ধারা) পরিমাপের জন্য কঠোরভাবে সংরক্ষিত হয়।"
                    : "Field characteristics are discarded from operational memory immediately upon completing the advisory response, or stored strictly in aggregated, anonymized formats for broad agronomic research metrics across the Hooghly basin."}
                </p>

                <p>
                  {isBengali
                    ? "এই পরামিতিগুলি কখনোই কোনো কৃষকের ব্যক্তিগত নাম, আধার নম্বর, ফোন নম্বর বা জমির খতিয়ান ও দাগ নম্বরের সাথে সংযুক্ত করা হয় না।"
                    : "Field characteristics are never linked to personal names, national identity identifiers, telephone numbers, or government land registry records."}
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section aria-labelledby="section-3-title" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </span>
                <h2
                  id="section-3-title"
                  className={`text-xl sm:text-2xl font-bold text-deepGreen ${
                    isBengali ? "font-bengali" : "font-heading"
                  }`}
                >
                  {isBengali
                    ? "তৃতীয় পক্ষের বিজ্ঞাপনের সম্পূর্ণ অনুপস্থিতি"
                    : "Zero Third-Party Advertising and Commercial Sales"}
                </h2>
              </div>

              <div className={`space-y-3 text-sm sm:text-base leading-relaxed text-ink ${isBengali ? "font-bengali" : ""}`}>
                <p>
                  {isBengali
                    ? "AgriShift AI প্ল্যাটফর্মে কোনো তৃতীয় পক্ষের বাণিজ্যিক বিজ্ঞাপন বা ট্র্যাকার নেই। আমরা ব্যবহারকারীদের ব্রাউজিং আচরণ পর্যবেক্ষণ করার জন্য কোনো বিজ্ঞাপন ট্র্যাকার, রিটার্গেটিং স্ক্রিপ্ট বা কুকি ব্যবহার করি না।"
                    : "AgriShift AI operates with a strict zero third-party advertising policy. We do not integrate advertising networks, tracking beacons, behavioral retargeting scripts, or commercial marketing pixels."}
                </p>

                <p>
                  {isBengali
                    ? "আমরা কৃষকের জমির আকার, ফসল পরিকল্পনা বা ভৌগোলিক অবস্থান কোনো বাণিজ্যিক বীজ নির্মাতা, সার কোম্পানি, কৃষি বীমা প্রতিষ্ঠান বা ডেটা ব্রোকারের কাছে কখনোই বিক্রি, ইজারা বা শেয়ার করি না।"
                    : "We maintain zero third-party data broker sales. No user-submitted field parameters, crop selections, or geographic coordinates are sold, leased, rented, or monetized with seed vendors, agrochemical corporations, insurance underwriters, or data brokers."}
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section aria-labelledby="section-4-title" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center font-bold text-sm shrink-0">
                  4
                </span>
                <h2
                  id="section-4-title"
                  className={`text-xl sm:text-2xl font-bold text-deepGreen ${
                    isBengali ? "font-bengali" : "font-heading"
                  }`}
                >
                  {isBengali
                    ? "উন্মুক্ত উৎস ও বৈজ্ঞানিক স্বচ্ছতা"
                    : "Open Source and Agronomic Transparency"}
                </h2>
              </div>

              <div className={`space-y-3 text-sm sm:text-base leading-relaxed text-ink ${isBengali ? "font-bengali" : ""}`}>
                <p>
                  {isBengali
                    ? "আমাদের ডেটা প্রক্রিয়াকরণ ও ফসল স্কোরিং অ্যালগরিদমগুলি ভারতীয় কৃষি গবেষণা পরিষদ (ICAR) এবং বিধানচন্দ্র কৃষি বিশ্ববিদ্যালয় (BCKV, মোহনপুর, নদীয়া/হুগলি)-এর অনুমোদিত কৃষি বৈজ্ঞানিক মানদণ্ড মেনে পরিচালিত হয়।"
                    : "Data processing rubrics and recommendation scoring algorithms adhere strictly to peer-reviewed agronomic benchmarks established by the Indian Council of Agricultural Research (ICAR) and Bidhan Chandra Krishi Viswavidyalaya (BCKV, Mohanpur, West Bengal)."}
                </p>

                <p>
                  {isBengali
                    ? "তাপমাত্রার বৃদ্ধি কাল (Growing Degree Days), ফসলের জলের চাহিদা (Crop Evapotranspiration ETc) এবং ডালজাতীয় ফসলের নাইট্রোজেন সংযোজনের হিসাবের সমস্ত গাণিতিক সূত্র উন্মুক্ত ও যাচাইযোগ্য।"
                    : "Mathematical formulas for thermal time accumulation (Growing Degree Days), reference crop evapotranspiration, root-zone soil moisture depletion, and legume nitrogen credit matrices are documented and open for scientific audit."}
                </p>

                <p>
                  {isBengali
                    ? "প্ল্যাটফর্মটি কোনো গোপন বা মালিকানাধীন কৃত্রিম ব্ল্যাক-বক্স মডেল ব্যবহার করে না। প্রতিটি সুপারিশের পেছনের বৈজ্ঞানিক যুক্তি স্বচ্ছভাবে তুলে ধরা হয়।"
                    : "The platform relies on transparent, verifiable agronomic formulas rather than inscrutable proprietary algorithms, allowing smallholders, agronomists, and institutions to inspect the scientific basis of every recommendation."}
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section aria-labelledby="section-5-title" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center font-bold text-sm shrink-0">
                  5
                </span>
                <h2
                  id="section-5-title"
                  className={`text-xl sm:text-2xl font-bold text-deepGreen ${
                    isBengali ? "font-bengali" : "font-heading"
                  }`}
                >
                  {isBengali
                    ? "ব্যবহারকারীর অধিকার ও বেনামে ব্যবহারের স্বাধীনতা"
                    : "User Rights and Anonymous Accessibility"}
                </h2>
              </div>

              <div className={`space-y-3 text-sm sm:text-base leading-relaxed text-ink ${isBengali ? "font-bengali" : ""}`}>
                <p>
                  {isBengali
                    ? "ক্ষুদ্র কৃষক ও ব্যবহারকারীদের সম্পূর্ণ বেনামে AgriShift AI ব্যবহার করার পূর্ণ স্বাধীনতা রয়েছে। কোনো অ্যাকাউন্ট তৈরি, ব্যবহারকারী নিবন্ধন বা ব্যক্তিগত পরিচয় প্রকাশের কোনো বাধ্যবাধকতা নেই।"
                    : "Smallholder farmers and community users possess the explicit right to use AgriShift AI anonymously without account registration, user logins, password management, or personal identity disclosure."}
                </p>

                <p>
                  {isBengali
                    ? "প্ল্যাটফর্মের সুপারিশ পেতে কোনো মোবাইল নম্বর, ইমেইল ঠিকানা বা সরকারি পরিচয়পত্র জমা দেওয়ার প্রয়োজন নেই।"
                    : "No mobile phone verification, email registration, or government identity documentation is required to generate crop recommendations or review irrigation guidance."}
                </p>

                <p>
                  {isBengali
                    ? "ব্যবহারকারীরা যেকোনো সময় তাদের স্থানীয় ব্রাউজার ক্যাশ ও কুকি মুছে ফেলে প্ল্যাটফর্ম ব্যবহারের সমস্ত চিহ্ন অপসারণ করতে পারেন।"
                    : "Users maintain complete autonomy to inspect all calculations, clear local device storage at their convenience, and terminate browsing sessions without leaving personal digital footprints."}
                </p>
              </div>
            </section>
          </div>

          {/* Privacy Contact */}
          <footer className="pt-8 border-t border-border space-y-4">
            <div className="p-4 rounded-md border border-border bg-offWhite flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-semibold text-deepGreen text-sm block">
                  {isBengali ? "গোপনীয়তা ও ডেটা অধিকার সংক্রান্ত যোগাযোগ" : "Privacy & Data Inquiries"}
                </span>
                <p className="text-xs text-soilBrown">
                  {isBengali
                    ? "ডেটা পরিচালনা নীতি বা উপগ্রহ তথ্যের ব্যবহার সম্পর্কে প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন।"
                    : "For inquiries regarding satellite telemetry processing or agronomic open-source protocols, please contact the AgriShift AI team."}
                </p>
              </div>

              <Link
                href="/terms"
                className="min-h-[44px] px-4 py-2 inline-flex items-center justify-center text-sm font-semibold text-deepGreen hover:text-soilBrown rounded-md border border-border hover:border-deepGreen transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
              >
                {isBengali ? "পরিষেবার শর্তাবলি পড়ুন" : "Read Terms of Service"}
              </Link>
            </div>
          </footer>
        </div>
      </main>

      <Footer />
    </div>
  );
}
