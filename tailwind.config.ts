import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        deepGreen: "#1E4D36",
        soilBrown: "#6B4A2F",
        wheat: "#D9B26A",
        ink: "#1B1F1C",
        alertRed: "#B3261E",
        offWhite: "#F6F3EC",
        border: "#D8D2C4",
      },
      borderRadius: {
        DEFAULT: "6px",
        none: "0",
        sm: "6px",
        md: "6px",
        lg: "6px",
        xl: "6px",
        full: "9999px",
      },
      fontFamily: {
        heading: ["Fraunces", "serif"],
        body: ["Source Sans 3", "sans-serif"],
        bengali: ["Noto Sans Bengali", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
