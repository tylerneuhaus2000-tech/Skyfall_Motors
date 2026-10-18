import type { Metadata } from "next";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const metadata: Metadata = { title: "Werkstatt" };

export default function WorkshopPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-container page-heading">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Werkstatt
          </span>
          <h1>Service, der zum Fahrzeug passt.</h1>
          <p>
            Leistungen werden erst angeboten, wenn sie für das jeweilige
            Minecraft-Mod-Fahrzeug belegt sind.
          </p>
        </div>
      </section>
      <SectionPlaceholder
        title="Werkstattaufträge sind noch nicht geöffnet"
        description="Es werden aktuell keine Tuning-, Reparatur- oder Fertigungsaufträge angenommen. Erst werden Mod-Funktionen und sichere Auftragsabläufe geprüft."
      />
    </main>
  );
}
