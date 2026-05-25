"use client";

import { useFormStatus } from "react-dom";

type Props = {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "cta" | "danger" | "accent" | "warning";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
};

export function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
  size = "md",
  onClick,
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={onClick}
      className={`btn btn-${size} btn-${variant}`}
    >
      {pending ? (pendingLabel ?? "Guardando…") : label}
    </button>
  );
}
