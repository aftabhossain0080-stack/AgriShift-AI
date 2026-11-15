import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  cleanDistDir: false,
  webpack: (config) => {
    // Disable webpack disk caching on OneDrive to avoid file lock collisions
    config.cache = false;
    return config;
  },
  ...(process.env.NEXT_STANDALONE === "true" ? { output: "standalone" } : {}),
};

export default withNextIntl(nextConfig);
