"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";

const navigation = [
  { href: "/fahrzeuge", label: "Fahrzeuge" },
  { href: "/gebrauchtwagen", label: "Gebrauchtwagen" },
  { href: "/rennstrecke", label: "Rennstrecke" },
  { href: "/race-center", label: "Race Center" },
  { href: "/werkstatt", label: "Werkstatt" },
  { href: "/ueber-uns", label: "Über uns" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="SKYFALL MOTORS Startseite">
          <span className="brand-name">SKYFALL</span>
          <span className="brand-subtitle">MOTORS</span>
        </Link>
        <nav className="desktop-nav" aria-label="Hauptnavigation">
          <NavigationLinks />
        </nav>
        <div className="header-actions">
          <Link className="header-cta" href="/kundenbereich">
            Kundenbereich
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      <nav
        className="mobile-nav"
        id="mobile-navigation"
        aria-label="Mobile Navigation"
        data-open={menuOpen}
      >
        <NavigationLinks onNavigate={() => setMenuOpen(false)} />
        <Link
          className="nav-link"
          href="/kundenbereich"
          onClick={() => setMenuOpen(false)}
        >
          Kundenbereich
        </Link>
      </nav>
    </header>
  );
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Suspense fallback={<NavigationItems onNavigate={onNavigate} />}>
      <ActiveNavigationItems onNavigate={onNavigate} />
    </Suspense>
  );
}

function ActiveNavigationItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <NavigationItems pathname={pathname} onNavigate={onNavigate} />;
}

function NavigationItems({
  pathname,
  onNavigate,
}: {
  pathname?: string;
  onNavigate?: () => void;
}) {
  return navigation.map((item) => {
    const active =
      pathname === item.href || pathname?.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={item.href}
        className="nav-link"
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    );
  });
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
