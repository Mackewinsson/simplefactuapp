"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PartnerNav() {
  const pathname = usePathname();

  const links = [
    { href: "/partner", label: "Resumen", exact: true },
    { href: "/partner/tenants/new", label: "Agregar cliente" },
  ];

  const getLinkClass = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return active
      ? "rounded-lg border border-outline-soft bg-surface px-3 py-1.5 text-xs font-bold text-fg shadow-sm font-display transition-all"
      : "rounded-lg px-3 py-1.5 text-xs font-semibold text-fg-muted hover:text-fg hover:bg-surface-muted/50 transition-all font-display";
  };

  return (
    <nav className="flex flex-wrap gap-2 border-b border-outline-soft/65 pb-4 items-center">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={getLinkClass(link.href, "exact" in link && link.exact)}>
          {link.label}
        </Link>
      ))}
      <Link href="/invoices" className="rounded-lg border border-accent/20 bg-accent-muted/40 px-3 py-1.5 text-xs font-bold text-accent hover:bg-accent-muted transition-all font-display ml-auto">
        Volver a la app
      </Link>
    </nav>
  );
}
