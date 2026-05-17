import Link from "next/link";
import { APP_DISPLAY_NAME } from "@/lib/branding";

type Props = {
  href?: string;
  /** Classes for the clickable outer chrome (sizes, breakpoints). Inner text is `text-lg` by default. */
  className?: string;
};

/**
 * Logo wordmark for the chrome header: correct casing via {@link APP_DISPLAY_NAME},
 * legible asterisk spacing, plain text on the header surface.
 */
export function BrandWordmark({ href = "/", className }: Props) {
  const idx = APP_DISPLAY_NAME.indexOf("*");
  const before = idx === -1 ? APP_DISPLAY_NAME : APP_DISPLAY_NAME.slice(0, idx);
  const after = idx === -1 ? "" : APP_DISPLAY_NAME.slice(idx + 1);

  return (
    <Link
      href={href}
      aria-label={APP_DISPLAY_NAME}
      className={[
        "inline-flex shrink-0 items-center transition-opacity",
        "hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:rounded-sm",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span aria-hidden className="pointer-events-none">
        {idx === -1 ? (
          <span className="text-lg font-semibold text-slate-900 normal-case">{before}</span>
        ) : (
          <span className="flex items-baseline text-lg font-semibold tracking-tight text-slate-900 normal-case">
            <span>{before}</span>
            <span className="-mx-px translate-y-[-0.04em] px-0.5 text-base font-medium text-fg-muted">
              *
            </span>
            <span>{after}</span>
          </span>
        )}
      </span>
    </Link>
  );
}
