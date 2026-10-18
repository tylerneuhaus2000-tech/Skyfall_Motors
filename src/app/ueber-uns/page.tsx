import type { Metadata } from "next";

export const metadata: Metadata = { title: "Über uns" };

export default function AboutPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-container page-heading">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Über SKYFALL MOTORS
          </span>
          <h1>Ein digitales Autohaus für dein Survival.</h1>
          <p>
            SKYFALL MOTORS entsteht als Fahrzeug- und Motorsportplattform für
            einen Minecraft-Survival-Multiplayer-Server.
          </p>
        </div>
      </section>
      <section className="page-container page-content">
        <div className="content-narrow">
          <h2>Nur Fahrzeuge, die wirklich passen.</h2>
          <p>
            Jedes Modell wird mit seiner Content-Pack-Version, dem Modloader und
            seiner Survival-Herstellung dokumentiert. Ein Wunschlisten-Eintrag
            allein macht ein Fahrzeug noch nicht verfügbar.
          </p>
          <h2>Keine erfundenen Bilder oder Ergebnisse.</h2>
          <p>
            Wenn keine geeignete Minecraft-Aufnahme mit geklärter Quelle
            vorliegt, zeigen wir „Bild folgt“. Rennergebnisse und Lagerbestände
            erscheinen erst, wenn sie tatsächlich erfasst wurden.
          </p>
          <div className="feature-list">
            <div className="feature-row">
              <strong>Fahrzeugkatalog</strong>
              <span>
                Geprüfte Pack-Angaben und editierbare SKYFALL-Planpreise.
              </span>
            </div>
            <div className="feature-row">
              <strong>Survival zuerst</strong>
              <span>
                Creative-only-Fahrzeuge werden nicht als Survival-Angebot
                geführt.
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
