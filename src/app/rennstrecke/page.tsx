import type { Metadata } from "next";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const metadata: Metadata = { title: "Rennstrecke" };

export default function TrackPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-container page-heading">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Rennstrecke
          </span>
          <h1>Dein nächster Stint beginnt hier.</h1>
          <p>
            Streckenlayout, Regeln und Buchungsinformationen folgen, sobald die
            Skyfall-Strecke dokumentiert ist.
          </p>
        </div>
      </section>
      <SectionPlaceholder
        title="Strecke und Termine folgen"
        description="Aktuell sind weder Streckenplan noch Termine oder Mietfahrzeuge veröffentlicht. Es gibt noch keine Buchungen."
        nextStep="Zum Race Center"
      />
    </main>
  );
}
