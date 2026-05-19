"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/blog/articles";

interface Props {
  articles: Pick<
    Article,
    "slug" | "title" | "excerpt" | "date" | "readingMinutes" | "tags"
  >[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const AUTO_ADVANCE_MS = 5000;

export function BlogCarousel({ articles }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = articles.length;

  const goTo = useCallback(
    (index: number) => {
      setActive(((index % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, paused, next]);

  // Touch / drag support
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Artículos del blog"
    >
      {/* Track */}
      <div
        ref={trackRef}
        className="overflow-hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {articles.map((article, i) => (
            <article
              key={article.slug}
              className="w-full flex-none px-1"
              aria-hidden={i !== active}
            >
              <Link
                href={`/blog/${article.slug}`}
                className="group block rounded-xl border border-outline-soft bg-surface p-5 transition-shadow hover:shadow-sm"
                tabIndex={i !== active ? -1 : undefined}
              >
                <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <time dateTime={article.date} className="text-xs text-fg-subtle">
                    {formatDate(article.date)}
                  </time>
                  <span className="text-xs text-fg-subtle">·</span>
                  <span className="text-xs text-fg-subtle">
                    {article.readingMinutes}&nbsp;min
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-fg transition-colors group-hover:text-brand sm:text-lg">
                  {article.title}
                </h3>
                <p className="line-clamp-2 text-sm text-fg-muted">
                  {article.excerpt}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full border border-outline-soft px-2 py-0.5 text-xs text-fg-subtle"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand">
                  Leer artículo
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between">
        {/* Dots */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Diapositivas">
          {articles.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Artículo ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 bg-fg"
                  : "w-1.5 bg-outline-soft hover:bg-fg-subtle"
              }`}
            />
          ))}
        </div>

        {/* Prev / Next buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            aria-label="Artículo anterior"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-outline-soft bg-surface text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M8.5 10.5L5 7l3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Artículo siguiente"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-outline-soft bg-surface text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M5.5 3.5L9 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
