import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/layout";
import { Link } from "@/i18n/routing";
import {
  WarningCircle,
  FileText,
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
      ? "পরিষেবার শর্তাবলি | AgriShift AI"
      : "Terms of Service | AgriShift AI",
    description: isBengali
      ? "হুগলি জেলার ক্ষুদ্র কৃষকদের জন্য AgriShift AI প্ল্যাটফর্মের প্রাথমিক কার্যক্ষম পরিষেবার শর্তাবলি।"
      : "Preliminary operational terms of service for AgriShift AI smallholder advisory platform in Hooghly, West Bengal.",
  };
}

export default async function TermsPage({ params }: PageProps) {
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
              {isBengali ? "পরিষেবার শর্তাবলি" : "Terms of Service"}
            </span>
          </nav>

          {/* Header */}
          <header className="space-y-4 border-b border-border pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-offWhite text-xs text-soilBrown uppercase tracking-wider font-semibold">
              <FileText size={16} weight="regular" aria-hidden="true" />
              <span>
                {isBengali
                  ? "আইনি বিজ্ঞপ্তি ও পরিচালন নীতিমালা"
                  : "Legal Notice & Operational Guidelines"}
              </span>
            </div>

            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-deepGreen ${isBengali ? "font-bengali" : "font-heading"
                }`}
            >
              {isBengali ? "পরিষেবার শর্তাবলি" : "Terms of Service"}
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
                  className={`text-xs sm:text-sm text-soilBrown leading-relaxed ${isBengali ? "font-bengali" : ""
                    }`}
                >
                  {isBengali
                    ? "আইনজীবী পর্যালোচনার জন্য খসড়া: এই নথিটি একটি প্রাথমিক কার্যক্ষম খসড়া এবং যোগ্য আইনি উপদেষ্টার দ্বারা চূড়ান্ত অনুমোদিত নয়। প্রাতিষ্ঠানিক সম্প্রসারণের পূর্বে আইনি পরীক্ষা সম্পন্ন করা হবে, তবে প্ল্যাটফর্মের বর্তমান নীতি ও পরিচালন প্রতিশ্রুতি অবিলম্বে বহাল থাকবে।"
                    : "This regulatory notice serves as our interim operational framework. A finalized legal review by qualified legal practitioners will supersede this text prior to widespread deployment."}
                </p>
              </div>
            </div>
          </section>

          {/* Terms Content Sections */}
          <div className="space-y-10 sm:space-y-12 text-ink">
            {/* Section 1 */}
            <section aria-labelledby="section-1-title" className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </span>
                <h2
                  id="section-1-title"
                  className={`text-xl sm:text-2xl font-bold text-deepGreen ${isBengali ? "font-bengali" : "font-heading"
                    }`}
                >
                  {isBengali ? "শর্তাবলির গ্রহণযোগ্যতা" : "Acceptance of Terms"}
                </h2>
              </div>
              <div className={`space-y-3 text-sm sm:text-base leading-relaxed text-ink ${isBengali ? "font-bengali" : ""}`}>
                <p>
                  {isBengali
                    ? "AgriShift AI প্ল্যাটফর্ম ব্যবহার, পরিদর্শন বা এর মাধ্যমে কোনো তথ্য অনুসন্ধান করার দ্বারা আপনি নিশ্চিত করছেন যে আপনি এই পরিষেবার শর্তাবলি সম্পূর্ণ পড়েছেন, বুঝেছেন এবং এতে সম্মত হয়েছেন। আপনি যদি এই শর্তাবলির কোনো অংশের সাথে অসম্মত হন, তবে এই প্ল্যাটফর্ম ব্যবহার করা থেকে বিরত থাকুন।"
                    : "By accessing, browsing, or using the AgriShift AI platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree with any provision of these terms, you should immediately discontinue use of the platform."}
                </p>
                <p>
                  {isBengali
                    ? "এই শর্তাবলি সমস্ত দর্শক, ক্ষুদ্র কৃষক, কৃষি সম্প্রসারণ সহকারী, গবেষক এবং অংশীদার সমবায় সমিতির ক্ষেত্রে সমভাবে প্রযোজ্য যারা ওয়েব ইন্টারফেস বা সংশ্লিষ্ট এপিআই ব্যবহার করেন।"
                    : "These terms apply to all visitors, smallholder farmers, agricultural extension workers, agronomic researchers, and community organizations who access or interact with our web interface or associated data endpoints."}
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section aria-labelledby="section-2-title" className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </span>
                <h2
                  id="section-2-title"
                  className={`text-xl sm:text-2xl font-bold text-deepGreen ${isBengali ? "font-bengali" : "font-heading"
                    }`}
                >
                  {isBengali ? "কৃষি পরামর্শ পরিষেবার বিবরণ" : "Description of Advisory Service"}
                </h2>
              </div>
              <div className={`space-y-3 text-sm sm:text-base leading-relaxed text-ink ${isBengali ? "font-bengali" : ""}`}>
                <p>
                  {isBengali
                    ? "AgriShift AI হলো একটি উন্মুক্ত ও জনস্বার্থে নিবেদিত কৃষি পরামর্শমূলক প্ল্যাটফর্ম, যা বিশ্বব্যাপী ক্ষুদ্র কৃষকদের কৃষি সিদ্ধান্ত গ্রহণে সহায়তার জন্য তৈরি করা হয়েছে।"
                    : "AgriShift AI operates as a free, open-access public agronomic advisory platform designed to support smallholder farmers worldwide."}
                </p>
                <p>
                  {isBengali
                    ? "প্ল্যাটফর্মটি নাসা (NASA)-এর বিভিন্ন উপগ্রহ পর্যবেক্ষণ ডেটা সরাসরি সংশ্লেষণ করে। এর মধ্যে রয়েছে NASA POWER থেকে সৌর বিকিরণ, বায়ুর তাপমাত্রা ও আপেক্ষিক আর্দ্রতা, NASA GPM IMERG থেকে বৃষ্টিপাত ও খরার পরিস্থিতি এবং NASA SMAP থেকে উপরিভাগ ও মূল অঞ্চলের মাটির আর্দ্রতা সংক্রান্ত তথ্য।"
                    : "The platform synthesizes Earth Observation measurements from NASA satellite missions, including solar radiation and surface temperature from NASA POWER, precipitation and dry-spell tracking from NASA GPM IMERG, and surface and root-zone soil moisture estimates from NASA SMAP."}
                </p>
                <p>
                  {isBengali
                    ? "এই উপগ্রহ ডেটাকে স্থানীয় মাটির ধরন, মৌসুমি জলবায়ু এবং ফসল আবর্তনের ইতিহাসের সাথে মিলিয়ে আটটি প্রধান আঞ্চলিক ফসলের (সর্ষে, মসুর, ভুট্টা, আমন ধান, বোরো ধান, আলু, পাট এবং গম) জন্য ১০০-পয়েন্ট ভিত্তিক উপযোগিতা স্কোর তৈরি করা হয়। পাশাপাশি এটি সাপ্তাহিক সেচ পরিকল্পনা এবং জলবায়ু ঝুঁকি সংক্রান্ত সতর্কতা প্রদান করে।"
                    : "These satellite observations are combined with regional soil classifications, seasonal calendars, and crop rotation histories to generate transparent 100-point agronomic suitability scores for eight principal regional crops: Mustard, Lentil, Maize, Paddy (Aman), Paddy (Boro), Potato, Jute, and Wheat. In addition, the service computes weekly irrigation schedules and provides agro-climatic risk notifications."}
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section aria-labelledby="section-3-title" className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </span>
                <h2
                  id="section-3-title"
                  className={`text-xl sm:text-2xl font-bold text-deepGreen ${isBengali ? "font-bengali" : "font-heading"
                    }`}
                >
                  {isBengali ? "ফলাফলের ওপর ওয়ারেন্টির অস্বীকৃতি" : "No Warranty on Agronomic Outcomes"}
                </h2>
              </div>
              <div className={`space-y-3 text-sm sm:text-base leading-relaxed text-ink ${isBengali ? "font-bengali" : ""}`}>
                <p>
                  {isBengali
                    ? "উপগ্রহ থেকে প্রাপ্ত পর্যবেক্ষণ তথ্যগুলি আঞ্চলিক পর্যায়ের প্রাক্কলন প্রদান করে। স্থানীয় মাটির পরিবর্তন, বীজ অঙ্কুরোদগমের সক্ষমতা, আকস্মিক খরা বা অতিবৃষ্টি, জল নিষ্কাশন ব্যবস্থা এবং স্থানীয় পোকা-মাকড় বা রোগের আক্রমণ কেবল উপগ্রহ সেন্সর দিয়ে সম্পূর্ণ নিখুঁতভাবে পূর্বাভাস করা সম্ভব নয়।"
                    : "Satellite telemetry provides synoptic regional observations at pixel scales between 10 kilometres and 500 metres. Unseasonal localized convective rainfall, microclimatic variations, sub-field soil chemistry, seed viability, drainage anomalies, and unexpected pest infestations cannot be completely predicted by orbital sensors alone."}
                </p>
                <p>
                  {isBengali
                    ? "অতএব সমস্ত সুপারিশ, উপযোগিতা স্কোর, সেচের পরিমাণ এবং ঝুঁকি সতর্কতা কেবল তথ্যমূলক নির্দেশিকা হিসেবে ব্যবহৃত হবে। AgriShift AI কোনো নির্দিষ্ট ফসলের ফলন, বাজার মূল্য, লাভ বা অর্থনৈতিক ফলাফলের কোনো নিশ্চয়তা প্রদান করে না।"
                    : "Accordingly, all recommendations, suitability scores, irrigation estimates, and risk warnings are supplied strictly for informational guidance. AgriShift AI makes no warranty, express or implied, regarding harvest volume, crop yield, market prices, financial profit, or complete prevention of crop loss."}
                </p>
                <p>
                  {isBengali
                    ? "ফসল বাছাই, বীজ বপনের সময় নির্ধারণ, সার ও কীটনাশক প্রয়োগ, সেচ পরিচালনা এবং ফসল তোলার সমস্ত সিদ্ধান্তের পূর্ণ দায়িত্ব কৃষক ও ক্ষেত্রীয় পরিচালনাকারীদের নিজের।"
                    : "Smallholder farmers, agricultural extension officers, and community volunteers retain complete autonomy and sole responsibility for all planting choices, input purchases, irrigation timing, and agronomic management."}
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section aria-labelledby="section-4-title" className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center font-bold text-sm shrink-0">
                  4
                </span>
                <h2
                  id="section-4-title"
                  className={`text-xl sm:text-2xl font-bold text-deepGreen ${isBengali ? "font-bengali" : "font-heading"
                    }`}
                >
                  {isBengali ? "অ-বাণিজ্যিক ও উন্মুক্ত নীতি" : "Non-commercial and Open Access Policy"}
                </h2>
              </div>
              <div className={`space-y-3 text-sm sm:text-base leading-relaxed text-ink ${isBengali ? "font-bengali" : ""}`}>
                <p>
                  {isBengali
                    ? "AgriShift AI ক্ষুদ্র কৃষকদের জন্য সম্পূর্ণ বিনামূল্যে উন্মুক্ত। প্ল্যাটফর্মে কোনো সাবস্ক্রিপশন ফি, পে-ওয়াল, সদস্যতা ফি বা কোনো লুকানো খরচ নেই।"
                    : "AgriShift AI is provided completely free of charge to smallholder farmers, self-help groups, farmer producer organizations, and community workers. There are no subscription fees, paywalls, transactional charges, or premium paywalled tiers."}
                </p>
                <p>
                  {isBengali
                    ? "এই সেবাটি অ-বাণিজ্যিক গবেষণা এবং গণ-উদ্যোগ হিসেবে পরিচালিত হয়, যার লক্ষ্য হলো জলবায়ু পরিবর্তনের প্রেক্ষাপটে ক্ষুদ্র চাষীদের কাছে নির্ভরযোগ্য উপগ্রহ বিজ্ঞান পৌঁছে দেওয়া।"
                    : "The platform operates strictly as a non-commercial, public-interest research tool dedicated to democratizing Earth observation science for climate resilience in vulnerable rural agrarian ecosystems."}
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section aria-labelledby="section-5-title" className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center font-bold text-sm shrink-0">
                  5
                </span>
                <h2
                  id="section-5-title"
                  className={`text-xl sm:text-2xl font-bold text-deepGreen ${isBengali ? "font-bengali" : "font-heading"
                    }`}
                >
                  {isBengali ? "দায়বদ্ধতার সীমাবদ্ধতা" : "Limitation of Liability"}
                </h2>
              </div>
              <div className={`space-y-3 text-sm sm:text-base leading-relaxed text-ink ${isBengali ? "font-bengali" : ""}`}>
                <p>
                  {isBengali
                    ? "প্রযোজ্য আইনের অধীনে অনুমোদিত সর্বাধিক পরিসর পর্যন্ত, AgriShift AI, এর সহযোগী গবেষকগণ, সফটওয়্যার প্রস্তুতকারক দল এবং উপগ্রহ ডেটা প্রদানকারী প্রতিষ্ঠানসমূহ কোনো প্রত্যক্ষ, পরোক্ষ, আনুষঙ্গিক বা পরিণামস্বরূপ ক্ষতির জন্য দায়ী থাকবে না।"
                    : "To the maximum extent permitted under applicable law, AgriShift AI, its open-source contributors, collaborating researchers, institutions, and public data providers shall not be held liable for any direct, indirect, incidental, punitive, or consequential losses resulting from reliance on the advisory outputs."}
                </p>
                <p>
                  {isBengali
                    ? "এর মধ্যে কোনো সীমাবদ্ধতা ছাড়াই অন্তর্ভুক্ত রয়েছে ফসলের উৎপাদন হ্রাস, বীজের ব্যর্থতা, আর্থিক ক্ষতি, বা উপগ্রহ নেটওয়ার্ক বিভ্রাটজনিত কারণে সৃষ্ট বিভ্রান্তি।"
                    : "This includes, without limitation, losses arising from reduced crop yield, adverse weather events, seed germination failures, business interruptions, financial expenditures on agricultural inputs, or service outages caused by satellite telemetry delays or internet network failures."}
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section aria-labelledby="section-6-title" className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md border border-border bg-offWhite text-deepGreen flex items-center justify-center font-bold text-sm shrink-0">
                  6
                </span>
                <h2
                  id="section-6-title"
                  className={`text-xl sm:text-2xl font-bold text-deepGreen ${isBengali ? "font-bengali" : "font-heading"
                    }`}
                >
                  {isBengali ? "প্রযোজ্য আইন ও বিচারিক এখতিয়ার" : "Governing Law and Jurisdiction"}
                </h2>
              </div>
              <div className={`space-y-3 text-sm sm:text-base leading-relaxed text-ink ${isBengali ? "font-bengali" : ""}`}>
                <p>
                  {isBengali
                    ? "এই পরিষেবার শর্তাবলি এবং প্ল্যাটফর্ম ব্যবহার সংক্রান্ত যেকোনো দাবি ভারতের পশ্চিমবঙ্গ রাজ্য এবং ভারতের প্রচলিত আইন অনুসারে পরিচালিত ও ব্যাখ্যায়িত হবে।"
                    : "These Terms of Service and any questions regarding their interpretation, validity, or enforcement shall be governed by and construed in accordance with the laws of the State of West Bengal, India, and applicable federal laws of the Republic of India."}
                </p>
                <p>
                  {isBengali
                    ? "AgriShift AI ব্যবহার থেকে উদ্ভূত যেকোনো আইনি বিরোধ বা মামলা কেবল ভারতের পশ্চিমবঙ্গ রাজ্যের যথাযথ এখতিয়ারসম্পন্ন আদালতের আওতাভুক্ত থাকবে।"
                    : "Any dispute, claim, or legal action arising out of or relating to these terms or use of the AgriShift AI platform shall be subject to the exclusive jurisdiction of the competent courts having territorial jurisdiction in West Bengal, India."}
                </p>
              </div>
            </section>
          </div>

          {/* Contact and Legal Enquiries */}
          <footer className="pt-8 border-t border-border space-y-4">
            <div className="p-4 rounded-md border border-border bg-offWhite flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-semibold text-deepGreen text-sm block">
                  {isBengali ? "আইনি ও গবেষণা সংক্রান্ত জিজ্ঞাসা" : "Legal & Research Enquiries"}
                </span>
                <p className="text-xs text-soilBrown">
                  {isBengali
                    ? "শর্তাবলি বা প্রযুক্তিগত বিবরণ সম্পর্কিত তথ্যের জন্য আমাদের গবেষণা দলের সাথে যোগাযোগ করতে পারেন।"
                    : "For clarifications regarding operational parameters, reach out to the research team at AgriShift AI."}
                </p>
              </div>

              <Link
                href="/privacy"
                className="min-h-[44px] px-4 py-2 inline-flex items-center justify-center text-sm font-semibold text-deepGreen hover:text-soilBrown rounded-md border border-border hover:border-deepGreen transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen"
              >
                {isBengali ? "গোপনীয়তা নীতি পড়ুন" : "Read Privacy Policy"}
              </Link>
            </div>
          </footer>
        </div>
      </main>

      <Footer />
    </div>
  );
}
