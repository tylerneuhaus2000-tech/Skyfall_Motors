import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  TestDriveRequestForm,
  VehicleWaitlistForm,
} from "@/components/side-feature-forms";
import { PlaceholderIcon, VehicleCard } from "@/components/vehicle-card";
import { VehicleInquiryForm } from "@/components/vehicle-inquiry-form";
import {
  CompareButton,
  RecentlyViewedTracker,
  WishlistButton,
} from "@/components/vehicle-local-tools";
import { getCurrentAccount } from "@/lib/account";
import { findVehicle, formatDiamondPrice, vehicles } from "@/lib/catalog";
import { getFirebaseServices, isFirebaseReady } from "@/lib/firebase-admin";
import { getInventoryView } from "@/lib/order-store";
import { getPremiumVehicle } from "@/lib/premium-catalog";
import { canJoinVehicleWaitlist } from "@/lib/side-feature-domain";
import type { PublicVehicleReviewView } from "@/lib/side-feature-store";
import {
  listPublicVehicleReviews,
  listWishlist,
} from "@/lib/side-feature-store";
import { findVehicleCandidate } from "@/lib/vehicle-candidates";
import { getVehicleReferencePhoto } from "@/lib/vehicle-images";

type VehiclePageProps = PageProps<"/fahrzeuge/[id]">;

export async function generateMetadata({
  params,
}: VehiclePageProps): Promise<Metadata> {
  const { id } = await params;
  const item = findVehicle(id) ?? findVehicleCandidate(id);
  return { title: item ? item.name : "Fahrzeug nicht gefunden" };
}

export default function VehicleDetailPage(props: VehiclePageProps) {
  return (
    <Suspense
      fallback={
        <main id="main-content">
          <section className="page-container page-content">
            <div className="account-card" role="status">
              <p>Fahrzeugdetails werden geladen …</p>
            </div>
          </section>
        </main>
      }
    >
      <VehicleDetailContent params={props.params} />
    </Suspense>
  );
}

async function VehicleDetailContent({
  params,
}: Pick<VehiclePageProps, "params">) {
  await connection();
  const { id } = await params;
  const vehicle = findVehicle(id);
  const candidate = vehicle ? undefined : findVehicleCandidate(id);
  const item = vehicle ?? candidate;
  if (!item) notFound();

  let inventory = null;
  let reviews: PublicVehicleReviewView[] = [];
  let isWishlisted = false;
  const account = await getCurrentAccount();
  const services = isFirebaseReady() ? getFirebaseServices() : null;
  if (vehicle && isFirebaseReady()) {
    if (services) {
      try {
        [inventory, reviews] = await Promise.all([
          getInventoryView(services.db, vehicle.id),
          listPublicVehicleReviews(services.db, vehicle.id),
        ]);
        if (account) {
          const wishlisted = await listWishlist(services.db, account.id);
          isWishlisted = wishlisted.includes(vehicle.id);
        }
      } catch {
        reviews = [];
      }
    }
  }

  const isVerified = Boolean(vehicle);
  const premium = getPremiumVehicle(item.id);
  const isAvailable = inventory?.canOrder === true;
  const waitlistOpen = Boolean(
    vehicle &&
      inventory &&
      canJoinVehicleWaitlist({
        orderEligible: inventory.orderEligible,
        approved: inventory.approved,
        serverInstallationConfirmed: inventory.serverInstallationConfirmed,
        availableUnits: inventory.availableUnits,
        reservedUnits: inventory.reservedUnits,
      }),
  );
  const photo = vehicle ? getVehicleReferencePhoto(vehicle.id) : undefined;
  const relatedVehicles = vehicles
    .filter((other) => other.packId === item.packId && other.id !== item.id)
    .slice(0, 3);
  return (
    <main id="main-content">
      {vehicle && <RecentlyViewedTracker vehicleId={vehicle.id} />}
      <section className="page-hero">
        <div className="page-container page-heading">
          <span className="eyebrow">
            <span className="eyebrow-dot" />{" "}
            {item.manufacturer
              ? `${item.manufacturer} · ${item.packName}`
              : item.packName}
          </span>
          <h1>{item.name}</h1>
          <p>{item.sourceNote}</p>
        </div>
      </section>
      <section className="page-container page-content detail-layout">
        <figure
          className={`detail-media${photo ? " detail-media-with-photo" : ""}`}
        >
          <span className="detail-media-mark" aria-hidden="true">
            SKYFALL / MOTORS
          </span>
          {photo ? (
            <>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 760px) 100vw, 55vw"
                className="vehicle-photo"
              />
              <figcaption className="detail-photo-credit">
                <span className="detail-photo-label">
                  Realfahrzeug-Referenz · Ingame-Bild folgt
                </span>
                <span>{photo.caption}</span>
                <span>
                  Foto:{" "}
                  <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
                    {photo.author}
                  </a>
                  {" · Lizenz: "}
                  <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                    {photo.license}
                  </a>
                </span>
                <span>{photo.modificationNote}</span>
              </figcaption>
            </>
          ) : (
            <>
              <PlaceholderIcon />
              <figcaption className="image-status">
                Bild folgt · Rechte ungeklärt
              </figcaption>
            </>
          )}
        </figure>
        <div className="detail-card">
          <span
            className={`catalog-status${isAvailable ? " catalog-status-open" : ""}`}
          >
            {!isVerified
              ? candidate?.status === "incompatible"
                ? "Zielversion inkompatibel"
                : "Kandidat · nicht nachgewiesen"
              : isAvailable
                ? "Serverbestand freigegeben"
                : "Serverprüfung/Freigabe offen"}
          </span>
          <p className="detail-intro">
            {vehicle
              ? "Dieses Modell ist in einem Archiv für Minecraft 1.21.1 / NeoForge nachgewiesen. Das bestätigt weder die Installation auf dem SKYFALL-Server noch den Lagerbestand."
              : candidate?.sourceNote}
          </p>
          <div className="detail-price">
            <span>
              {premium
                ? "Fester SKYFALL-Premiumpreis"
                : "Individuelles Angebot"}
            </span>
            <strong>
              {premium ? (
                <>
                  {formatDiamondPrice(premium.priceDiamonds)}{" "}
                  <span className="diamond">💎</span>
                </>
              ) : (
                "Preis auf Anfrage"
              )}
            </strong>
          </div>
          <div className="detail-local-actions">
            <CompareButton vehicleId={item.id} />
            {vehicle && (
              <WishlistButton
                vehicleId={vehicle.id}
                signedIn={Boolean(account)}
                initialSaved={isWishlisted}
              />
            )}
          </div>
          <div className="detail-facts">
            <Fact
              label="Content-Pack"
              value={`${item.packName}${item.packVersion ? ` ${item.packVersion}` : ""}`}
            />
            <Fact
              label="Minecraft"
              value={
                vehicle
                  ? vehicle.gameVersion
                  : (candidate?.gameVersion ?? "Nicht bestätigt")
              }
            />
            <Fact
              label="Modloader"
              value={
                vehicle
                  ? vehicle.loader
                  : (candidate?.loader ?? "Nicht bestätigt")
              }
            />
            <Fact label="Fahrzeugklasse" value={item.vehicleClass} />
            {vehicle && (
              <Fact
                label="Survival-Herstellung"
                value={
                  vehicle.survivalCrafting === "confirmed"
                    ? "Rezept in der Packdatei vorhanden"
                    : vehicle.survivalCrafting === "unconfirmed"
                      ? "Noch nicht bestätigt"
                      : "Nicht unterstützt"
                }
              />
            )}
            <Fact
              label="Serverinstallation"
              value={
                inventory?.serverInstallationConfirmed
                  ? "Durch Inhaber bestätigt"
                  : vehicle
                    ? "Noch nicht geprüft"
                    : "Nicht nachgewiesen"
              }
            />
            <Fact
              label="Bestand"
              value={
                inventory
                  ? `${inventory.serverInstallationConfirmed && inventory.approved ? "Freigegeben" : "Nicht freigegeben"} · ${Math.max(0, inventory.availableUnits - inventory.reservedUnits)} verfügbar`
                  : isFirebaseReady()
                    ? "Bestand aktuell nicht erreichbar"
                    : "Firebase lokal nicht eingerichtet"
              }
            />
          </div>
          {vehicle && isAvailable && premium ? (
            <Link
              className="button-primary order-entry-link"
              href={`/bestellen/${vehicle.id}`}
            >
              Mit {formatDiamondPrice(premium.priceDiamonds)} 💎 bestellen
            </Link>
          ) : (
            <p className="notice notice-pending detail-unavailable">
              {vehicle?.orderEligible
                ? "Bestellungen sind erst nach tatsächlicher Serverprüfung und Inhaberfreigabe mit verfügbarem Bestand möglich."
                : vehicle
                  ? (vehicle.ineligibilityReason ??
                    "Für dieses Modell ist keine Survival-Bestellung bestätigt.")
                  : "Kandidaten und inkompatible Modelle können nicht bestellt werden."}
            </p>
          )}
          {vehicle && (!premium || !isAvailable) && (
            <VehicleInquiryForm
              vehicleId={vehicle.id}
              vehicleName={vehicle.name}
              signedIn={Boolean(account)}
            />
          )}
          <p className="detail-caption">
            Quelle:{" "}
            {item.sourceUrl ? (
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                Pack-Release öffnen
              </a>
            ) : (
              "Packzuordnung offen"
            )}{" "}
            · Lizenz/Verwendung von Bildern nicht freigegeben.
          </p>
        </div>
      </section>
      {vehicle && (
        <section
          className="page-container detail-feature-grid"
          aria-label="Fahrzeug-Extras"
        >
          <TestDriveRequestForm
            vehicleId={vehicle.id}
            vehicleName={vehicle.name}
            signedIn={Boolean(account)}
          />
          {waitlistOpen && vehicle && (
            <VehicleWaitlistForm
              vehicleId={vehicle.id}
              vehicleName={vehicle.name}
              signedIn={Boolean(account)}
            />
          )}
          <section
            className="account-card feature-request-card"
            aria-labelledby="reviews-heading"
          >
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Moderierte Stimmen
            </span>
            <h2 id="reviews-heading">Kundenbewertungen</h2>
            {reviews.length ? (
              <div className="approved-reviews">
                {reviews.map((review) => (
                  <article className="approved-review" key={review.id}>
                    <div>
                      <strong>{review.minecraftUsername}</strong>
                      <span>{review.rating}/5 Sterne</span>
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="local-feature-empty">
                Noch keine moderierten Bewertungen. Bewertet werden kann erst
                nach einer bestätigten Übergabe.
              </p>
            )}
          </section>
        </section>
      )}
      {relatedVehicles.length > 0 && (
        <section
          className="section related-section"
          aria-labelledby="related-heading"
        >
          <div className="page-container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> Aus demselben Pack
                </span>
                <h2 id="related-heading">Weitere Modelle entdecken</h2>
              </div>
              <Link className="text-link" href="/fahrzeuge">
                Zum Katalog
              </Link>
            </div>
            <div className="vehicle-grid related-grid">
              {relatedVehicles.map((related) => (
                <VehicleCard key={related.id} vehicle={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-fact">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
