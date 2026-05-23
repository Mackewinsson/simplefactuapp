"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();
  
  const links = [
    { href: "/admin", label: "Inicio", exact: true },
    { href: "/admin/users", label: "Usuarios" },
    { href: "/admin/jobs", label: "Jobs AEAT" },
    { href: "/admin/system", label: "Sistema" },
    { href: "/admin/support", label: "Soporte" },
    { href: "/admin/audit", label: "Auditoría" },
    { href: "/admin/events", label: "Eventos SIF" },
    { href: "/admin/leads", label: "Leads" },
  ];

  const getLinkClass = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return active
      ? "text-sm font-semibold text-fg border-b-2 border-primary pb-3 -mb-[13px] relative z-10 transition-all"
      : "text-sm text-fg-muted hover:text-fg hover:underline transition-all";
  };

  return (
    <nav className="flex flex-wrap gap-x-6 gap-y-2 border-b border-outline-soft pb-3 items-center">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={getLinkClass(link.href, link.exact)}>
          {link.label}
        </Link>
      ))}
      <Link href="/invoices" className="text-sm text-fg-muted hover:text-fg hover:underline transition-all ml-auto">
        Volver a la app
      </Link>
    </nav>
  );
}
