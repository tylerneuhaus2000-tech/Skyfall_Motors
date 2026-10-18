import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { type ReactNode, Suspense } from "react";
import { RandomVehicleButton } from "@/components/side-feature-widgets";
import { ArrowIcon, VehicleCard } from "@/components/vehicle-card";
import { listPublicAnnouncements } from "@/lib/announcement-store";
import { vehicles } from "@/lib/catalog";
import { getFirebaseServices } from "@/lib/firebase-admin";
import { getHomepageHighlightVehicleId } from "@/lib/order-store";
import { premiumVehicles } from "@/lib/premium-catalog";
import { getVehicleOfDay } from "@/lib/side-feature-domain";
import { vehicleReferencePhotos } from "@/lib/vehicle-images";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main id="main-content">
          <section className="hero">
            <div className="page-container page-content" role="status">
              SKYFALL MOTORS wird geladen …
            </div>
          </section>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  await connection();
  const now = new Date();
  const rotatingVehicle = getVehicleOfDay(vehicles, now);
  let homepageHighlightVehicleId: string | null = null;
  let announcements: Awaited<ReturnType<typeof listPublicAnnouncements>> = [];
  try {
    const services = getFirebaseServices();
    if (services) {
      homepageHighlightVehicleId = await getHomepageHighlightVehicleId(
        services.db,
        now.toISOString().slice(0, 10),
      );
      announcements = await listPublicAnnouncements(services.db);
    }
  } catch {
    homepageHighlightVehicleId = null;
  }
  const dailyVehicle =
    vehicles.find((vehicle) => vehicle.id === homepageHighlightVehicleId) ??
    rotatingVehicle;
  const heroPhoto = vehicleReferencePhotos["craftspeed-m3gtr"];
  const premiumCatalog = premiumVehicles.map((premium) => {
    const vehicle = vehicles.find((item) => item.id === premium.vehicleId);
    if (!vehicle)
      throw new Error(`Missing premium catalog vehicle: ${premium.vehicleId}`);
    return { ...vehicle, priceDiamonds: premium.priceDiamonds };
  });
  const premiumHighlights = [
    "craftspeed-huracanevo",
    "svmp-valkyrie",
    "craftspeed-360",
  ]
    .map((id) => premiumCatalog.find((vehicle) => vehicle.id === id))
    .filter((vehicle) => vehicle !== undefined);
  const inquiryVehicles = vehicles
    .filter(
      (vehicle) =>
        !premiumVehicles.some((premium) => premium.vehicleId === vehicle.id),
    )
    .slice(0, 3);
  const categoryCounts = Array.from(
    vehicles.reduce((counts, vehicle) => {
      counts.set(
        vehicle.vehicleClass,
        (counts.get(vehicle.vehicleClass) ?? 0) + 1,
      );
      return counts;
    }, new Map<string, number>()),
  ).sort((a, b) => a[0].localeCompare(b[0], "de"));

  return (
    <main id="main-content">
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Dein Autohaus im Survival
            </span>
            <h1>
              BMW M3 GTR.
              <br />
              <span>Die Premium-Kollektion.</span>
            </h1>
            <p className="hero-description">
              16 ausgewählte Fahrzeuge. Klare Diamantenpreise, nachvollziehbare
              Pack-Nachweise und ehrliche Angaben zur Serverfreigabe.
            </p>
            <div className="hero-actions">
              <Link className="button-primary" href="/fahrzeuge">
                Fahrzeuge entdecken
              </Link>
              <Link className="button-secondary" href="#so-funktionierts">
                Unser Prüfprozess
              </Link>
            </div>
            <p className="hero-note">
              <CheckIcon /> Pack-Nachweis ist keine Serverfreigabe. Bestellungen
              öffnen erst nach bestätigter Installation und bei verfügbarem
              Bestand.
            </p>
          </div>
          <figure className="hero-visual hero-visual-photo">
            <Image
              src={heroPhoto.src}
              alt={heroPhoto.alt}
              fill
              preload
              sizes="(max-width: 620px) 100vw, 50vw"
              className="vehicle-photo"
            />
            <span className="hero-photo-badge">
              BMW M3 GTR · REALFAHRZEUG-REFERENZ
            </span>
            <figcaption className="hero-photo-caption">
              <span>{heroPhoto.caption}</span>
              <span>
                Foto:{" "}
                <a href={heroPhoto.sourceUrl} target="_blank" rel="noreferrer">
                  {heroPhoto.author}
                </a>
                {" · "}
                <a href={heroPhoto.licenseUrl} target="_blank" rel="noreferrer">
                  {heroPhoto.license}
                </a>
                {` · ${heroPhoto.modificationNote}`}
              </span>
            </figcaption>
          </figure>
        </div>
        <section
          className="page-container hero-premium-highlights"
          aria-labelledby="premium-highlights-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Premium-Highlights
              </span>
              <h2 id="premium-highlights-title">
                Ikonen, ausgewählt für SKYFALL.
              </h2>
            </div>
          </div>
          <div className="vehicle-grid">
            {premiumHighlights.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </section>
      </section>

      <section className="trust-strip" aria-label="Prüfstatus">
        <div className="trust-inner">
          <div className="trust-item">
            <span className="trust-number">1.21.1</span>
            <div className="trust-copy">
              <strong>Java Edition</strong>
              <span>Pack-Version geprüft</span>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-number">NeoForge</span>
            <div className="trust-copy">
              <strong>Modloader</strong>
              <span>Aktuelle Releases geprüft</span>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-number">Survival</span>
            <div className="trust-copy">
              <strong>Herstellbarkeit</strong>
              <span>Pack-Angaben geprüft</span>
            </div>
          </div>
        </div>
      </section>

      {dailyVehicle && (
        <section className="section daily-vehicle-section">
          <div className="page-container daily-vehicle-layout">
            <div className="daily-vehicle-copy">
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Fahrzeug des Tages
              </span>
              <p className="daily-vehicle-date">
                Highlight ·{" "}
                {now.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "long",
                  timeZone: "UTC",
                })}
              </p>
              <h2>{dailyVehicle.name}</h2>
              <p>
                {dailyVehicle.packName} · {dailyVehicle.vehicleClass}
              </p>
              <p className="daily-vehicle-note">
                {homepageHighlightVehicleId
                  ? "Vom Inhaber für heute ausgewählt. Bestellbarkeit und Bestand werden unabhängig davon geprüft."
                  : "Packdaten belegt. Eine Freigabe für den SKYFALL-Server oder verfügbarer Bestand ist damit nicht bestätigt."}
              </p>
              <div className="hero-actions">
                <Link
                  className="button-primary"
                  href={`/fahrzeuge/${dailyVehicle.id}`}
                >
                  Fahrzeug ansehen
                </Link>
                <RandomVehicleButton
                  vehicleIds={vehicles.map(({ id }) => id)}
                />
              </div>
            </div>
            <VehicleCard vehicle={dailyVehicle} />
          </div>
        </section>
      )}

      {announcements.length > 0 && (
        <section
          className="section home-announcements"
          aria-labelledby="announcements-title"
        >
          <div className="page-container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> Aktuelles
                </span>
                <h2 id="announcements-title">Neuigkeiten bei SKYFALL</h2>
              </div>
            </div>
            <div className="home-announcement-list">
              {announcements.map((announcement) => (
                <article className="home-announcement" key={announcement.id}>
                  <h3>{announcement.title}</h3>
                  <p>{announcement.body}</p>
                  <time
                    dateTime={new Date(announcement.updatedAt).toISOString()}
                  >
                    {new Date(announcement.updatedAt).toLocaleDateString(
                      "de-DE",
                    )}
                  </time>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" id="fahrzeuge">
        <div className="page-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Der Katalog
              </span>
              <h2>Unsere Premium-Kollektion</h2>
              <p>
                16 ausgewählte Pack-Modelle mit festen Diamantenpreisen. Die
                Serververfügbarkeit wird separat bestätigt.
              </p>
            </div>
            <Link className="text-link" href="/fahrzeuge">
              Zum Fahrzeugkatalog <ArrowIcon />
            </Link>
          </div>
          <div className="vehicle-grid">
            {premiumCatalog.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
          <div className="status-banner home-banner">
            <span className="status-banner-icon">
              <CheckIcon />
            </span>
            <div>
              <strong>Geprüfte Fahrzeugdaten. Klare Freigaben.</strong>
              <p>
                Ein Packnachweis allein reicht nicht: Erst die bestätigte
                Serverinstallation und ein freigegebener Bestand öffnen eine
                Bestellung.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section home-inquiry-selection">
        <div className="page-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Weitere Modelle
              </span>
              <h2>Fahrzeuge auf Anfrage.</h2>
              <p>
                Für Modelle außerhalb der Premiumauswahl erstellt das Team
                individuelle Diamantenangebote.
              </p>
            </div>
            <Link className="text-link" href="/fahrzeuge">
              Alle Anfragefahrzeuge ansehen <ArrowIcon />
            </Link>
          </div>
          <div className="vehicle-grid">
            {inquiryVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </section>

      <section className="category-section" aria-labelledby="category-heading">
        <div className="page-container">
          <div className="category-heading-row">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Im Sortiment
              </span>
              <h2 id="category-heading">Fahrzeugklassen</h2>
            </div>
            <Link className="text-link" href="/fahrzeuge">
              Alle Modelle ansehen <ArrowIcon />
            </Link>
          </div>
          <div className="category-list">
            {categoryCounts.map(([category, count], index) => (
              <Link
                className="category-item"
                href={`/fahrzeuge?klasse=${encodeURIComponent(category)}`}
                key={category}
              >
                <span className="category-index">0{index + 1}</span>
                <strong>{category}</strong>
                <span className="category-count">
                  {count} {count === 1 ? "Modell" : "Modelle"}
                </span>
                <ArrowIcon />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted" id="so-funktionierts">
        <div className="page-container trust-panel">
          <div className="trust-panel-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Erst prüfen, dann anbieten
            </span>
            <h2>Jedes Modell hat eine belegte Herkunft.</h2>
            <p>
              Ein Modell landet erst im Katalog, wenn das Content-Pack zur
              Server-Version passt, der Name stimmt und die Survival-Herstellung
              bestätigt ist. Screenshots kommen aus dem echten Spiel und werden
              erst nach geklärter Quelle ergänzt.
            </p>
            <Link className="text-link" href="/ueber-uns">
              So arbeiten wir <ArrowIcon />
            </Link>
          </div>
          <ol className="verification-list">
            <li>
              <span className="verification-step">01</span>
              <div>
                <strong>Passendes Pack</strong>
                <p>
                  Version 1.21.1 und NeoForge werden anhand des Pack-Releases
                  geprüft.
                </p>
              </div>
            </li>
            <li>
              <span className="verification-step">02</span>
              <div>
                <strong>Richtiges Modell</strong>
                <p>
                  Pack-Name und Modellvariante müssen mit dem Produkt
                  übereinstimmen.
                </p>
              </div>
            </li>
            <li>
              <span className="verification-step">03</span>
              <div>
                <strong>Survival-Beschaffung</strong>
                <p>
                  Ein Fahrzeug wird nicht als Survival-Angebot geführt, wenn es
                  nur im Creative-Modus verfügbar ist.
                </p>
              </div>
            </li>
            <li>
              <span className="verification-step">04</span>
              <div>
                <strong>Bild und Bestand</strong>
                <p>
                  Nur freigegebene Spielaufnahmen und tatsächlich erfasste
                  Fahrzeuge werden später angezeigt.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Mehr als ein Autohaus
              </span>
              <h2>Weitere Bereiche entstehen.</h2>
              <p>
                Werkstatt, Gebrauchtwagen und Motorsport werden schrittweise
                aufgebaut.
              </p>
            </div>
          </div>
          <div className="service-grid">
            <ServiceCard
              icon={<WrenchIcon />}
              title="Werkstatt"
              text="Tuning, Reparaturen und Fertigungsaufträge — mit bestätigten Mod-Funktionen."
              href="/werkstatt"
            />
            <ServiceCard
              icon={<TrackIcon />}
              title="Rennstrecke"
              text="Streckeninfos, Regeln und später buchbare Testfahrten."
              href="/rennstrecke"
            />
            <ServiceCard
              icon={<TrophyIcon />}
              title="Race Center"
              text="Rennkalender, Anmeldungen und belegte Rundenzeiten."
              href="/race-center"
            />
          </div>
        </div>
      </section>

      <section className="page-container cta-section">
        <div className="cta-band">
          <div>
            <h2>Finde dein nächstes Fahrzeug.</h2>
            <p>Die geprüften Modelle sind im Katalog dokumentiert.</p>
          </div>
          <Link className="button-light" href="/fahrzeuge">
            Katalog ansehen <ArrowIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({
  icon,
  title,
  text,
  href,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link className="service-card" href={href}>
      <span className="service-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="coming-label">
        Bereich ansehen <ArrowIcon />
      </span>
    </Link>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5 12 4.2 4.2L19 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.6 6.4a5 5 0 0 0-6.3 6.3l-4.8 4.8a1.8 1.8 0 0 0 2.6 2.6l4.8-4.8a5 5 0 0 0 6.3-6.3l-3.1 3.1-3.1-3.1 3.6-2.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19c4-1 2-4 6-5s6 2 8 0c2-2 0-5-2-5s-3 2-1 3M5 5c3 1 4 4 2 6s-3 3-2 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 4h8v4a4 4 0 0 1-8 0V4ZM8 6H5v2a3 3 0 0 0 3 3m8-5h3v2a3 3 0 0 1-3 3m-4 2v4m-4 0h8m-9 3h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
