"use client";

import { useFormStatus } from "react-dom";

type Props = {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "cta" | "danger";
  size?: "sm" | "md";
  onClick?: () => void;
};

export function SubmitButton({ label, pendingLabel, variant = "primary", size = "md", onClick }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={onClick}
      className={`btn btn-${size} btn-${variant} disabled:opacity-70 disabled:pointer-events-none`}
    >
      {pending ? (pendingLabel ?? "Guardando…") : label}
    </button>
  );
}
