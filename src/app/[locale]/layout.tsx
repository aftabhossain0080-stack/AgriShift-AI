import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { isRTL } from "@/lib/i18n/languages";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "AgriShift AI - Satellite Crop Advisory",
  description: "Satellite intelligence for smallholder farmers worldwide",
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "bn" }, { locale: "hi" }];
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const dir = isRTL(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className="bg-offWhite text-ink font-body">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
