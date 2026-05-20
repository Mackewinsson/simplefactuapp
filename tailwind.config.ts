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
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
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
        accent: {
          DEFAULT: withAlpha("--color-accent"),
          hover: withAlpha("--color-accent-hover"),
          foreground: withAlpha("--color-accent-foreground"),
          muted: withAlpha("--color-accent-muted"),
          "muted-hover": withAlpha("--color-accent-muted-hover"),
          outline: withAlpha("--color-accent-outline"),
          "foreground-muted": withAlpha("--color-accent-foreground-muted"),
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
        code: {
          DEFAULT: withAlpha("--color-code"),
          foreground: withAlpha("--color-code-foreground"),
        },
        danger: {
          DEFAULT: withAlpha("--color-danger"),
          hover: withAlpha("--color-danger-hover"),
          outline: withAlpha("--color-danger-outline"),
          foreground: withAlpha("--color-danger-foreground"),
          emphasis: withAlpha("--color-danger-emphasis"),
          "emphasis-hover": withAlpha("--color-danger-emphasis-hover"),
          ring: withAlpha("--color-danger-ring"),
          border: withAlpha("--color-danger-border"),
        },
        warning: {
          DEFAULT: withAlpha("--color-warning"),
          hover: withAlpha("--color-warning-hover"),
          outline: withAlpha("--color-warning-outline"),
          foreground: withAlpha("--color-warning-foreground"),
          muted: withAlpha("--color-warning-muted"),
          strong: withAlpha("--color-warning-strong"),
          emphasis: withAlpha("--color-warning-emphasis"),
          "emphasis-hover": withAlpha("--color-warning-emphasis-hover"),
          deep: withAlpha("--color-warning-deep"),
          deeper: withAlpha("--color-warning-deeper"),
          pulse: withAlpha("--color-warning-pulse"),
        },
        success: {
          DEFAULT: withAlpha("--color-success"),
          hover: withAlpha("--color-success-hover"),
          outline: withAlpha("--color-success-outline"),
          foreground: withAlpha("--color-success-foreground"),
          emphasis: withAlpha("--color-success-emphasis"),
          deep: withAlpha("--color-success-deep"),
          bar: withAlpha("--color-success-bar"),
        },
        info: {
          outline: withAlpha("--color-info-outline"),
          deep: withAlpha("--color-info-deep"),
        },
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": withAlpha("--color-fg-muted"),
            "--tw-prose-headings": withAlpha("--color-fg"),
            "--tw-prose-lead": withAlpha("--color-fg-muted"),
            "--tw-prose-links": withAlpha("--color-accent"),
            "--tw-prose-bold": withAlpha("--color-fg"),
            "--tw-prose-counters": withAlpha("--color-fg-subtle"),
            "--tw-prose-bullets": withAlpha("--color-outline"),
            "--tw-prose-hr": withAlpha("--color-outline-soft"),
            "--tw-prose-quotes": withAlpha("--color-fg-muted"),
            "--tw-prose-quote-borders": withAlpha("--color-outline"),
            "--tw-prose-captions": withAlpha("--color-fg-subtle"),
            "--tw-prose-code": withAlpha("--color-fg"),
            "--tw-prose-pre-code": withAlpha("--color-code-foreground"),
            "--tw-prose-pre-bg": withAlpha("--color-code"),
            "--tw-prose-th-borders": withAlpha("--color-outline"),
            "--tw-prose-td-borders": withAlpha("--color-outline-soft"),
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
