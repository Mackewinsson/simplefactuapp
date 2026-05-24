"use client";

import { CustomerModal } from "@/app/(chrome)/customers/CustomerModal";
import type { CustomerRow } from "@/app/(chrome)/customers/actions";

type CustomerFormModalProps = {
  onSave: (c: CustomerRow) => void;
  onClose: () => void;
};

/** Wrapper for invoice flow — maps onSave to CustomerModal.onSaved */
export function CustomerFormModal({ onSave, onClose }: CustomerFormModalProps) {
  return <CustomerModal onClose={onClose} onSaved={onSave} />;
}
