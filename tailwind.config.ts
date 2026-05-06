import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.md",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: withAlpha("--color-primary"),
          hover: withAlpha("--color-primary-hover"),
          foreground: withAlpha("--color-primary-foreground"),
        },
        cta: {
          DEFAULT: withAlpha("--color-cta"),
          hover: withAlpha("--color-cta-hover"),
          foreground: withAlpha("--color-cta-foreground"),
          ring: withAlpha("--color-cta-ring"),
        },
        surface: {
          DEFAULT: withAlpha("--color-surface"),
          hover: withAlpha("--color-surface-hover"),
          muted: withAlpha("--color-surface-muted"),
        },
        outline: {
          DEFAULT: withAlpha("--color-outline"),
          soft: withAlpha("--color-outline-soft"),
        },
        fg: {
          DEFAULT: withAlpha("--color-fg"),
          muted: withAlpha("--color-fg-muted"),
          subtle: withAlpha("--color-fg-subtle"),
          link: withAlpha("--color-fg-link"),
        },
        danger: {
          DEFAULT: withAlpha("--color-danger"),
          hover: withAlpha("--color-danger-hover"),
          outline: withAlpha("--color-danger-outline"),
          foreground: withAlpha("--color-danger-foreground"),
        },
        warning: {
          DEFAULT: withAlpha("--color-warning"),
          hover: withAlpha("--color-warning-hover"),
          outline: withAlpha("--color-warning-outline"),
          foreground: withAlpha("--color-warning-foreground"),
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
