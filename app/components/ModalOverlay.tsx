"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalOverlayProps = {
  children: ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<"div">, "children">;

/**
 * Full-viewport modal backdrop rendered via portal on document.body so it
 * covers the sticky header (z-50) and is not clipped by main's stacking context.
 */
export function ModalOverlay({ children, className = "", ...props }: ModalOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[100] ${className}`.trim()} {...props}>
      {children}
    </div>,
    document.body
  );
}
