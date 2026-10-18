import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="page-container page-content">
      <section className="not-found-card">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> Nicht gefunden
        </span>
        <h1 className="placeholder-heading">
          Diese Seite wurde nicht gefunden.
        </h1>
        <p className="placeholder-copy">
          Der Link ist möglicherweise veraltet oder der Eintrag ist nicht mehr
          verfügbar. Du kannst zum Fahrzeugkatalog zurückkehren oder dich in
          deinem Kundenbereich anmelden.
        </p>
        <div className="not-found-actions">
          <Link className="button-primary" href="/fahrzeuge">
            Zum Fahrzeugkatalog
          </Link>
          <Link className="text-link" href="/kundenbereich">
            Zum Kundenbereich
          </Link>
        </div>
      </section>
    </main>
  );
}
