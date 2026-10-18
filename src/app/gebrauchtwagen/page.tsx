import type { Metadata } from "next";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const metadata: Metadata = { title: "Gebrauchtwagen" };

export default function UsedCarsPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-container page-heading">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Gebrauchtwagen
          </span>
          <h1>Fahrzeuge in neue Hände geben.</h1>
          <p>
            Ankauf und Marktplatz werden vorbereitet. Inserate erscheinen erst,
            wenn Eigentum und Verkauf sicher verwaltet werden können.
          </p>
        </div>
      </section>
      <SectionPlaceholder
        title="Noch keine Angebote"
        description="Der Gebrauchtwagenbereich ist noch nicht geöffnet. Es werden derzeit keine Inserate oder Ankaufsangebote angenommen."
        nextStep="Geprüfte Fahrzeuge ansehen"
      />
    </main>
  );
}
