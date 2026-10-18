import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Vehicle } from "@/lib/catalog";
import { getPremiumVehicle } from "@/lib/premium-catalog";
import type { VehicleCandidate } from "@/lib/vehicle-candidates";
import { getVehicleReferencePhoto } from "@/lib/vehicle-images";

export type CatalogCardItem = Vehicle | VehicleCandidate;

export function VehicleCard({
  vehicle,
  available = false,
  extraAction,
}: {
  vehicle: CatalogCardItem;
  available?: boolean;
  extraAction?: ReactNode;
}) {
  const verified = "verificationStatus" in vehicle;
  const premium = getPremiumVehicle(vehicle.id);
  const photo = getVehicleReferencePhoto(vehicle.id);
  const orderable = Boolean(
    premium && verified && vehicle.orderEligible && available,
  );
  const status = !verified
    ? vehicle.status === "incompatible"
      ? "Nicht kompatibel"
      : "Kandidat · ungeprüft"
    : orderable
      ? "Bestellbar"
      : vehicle.orderEligible
        ? "Packdatei belegt · Serverfreigabe offen"
        : "Packdatei belegt · nicht bestellbar";
  return (
    <article className="vehicle-card">
      <Link
        href={`/fahrzeuge/${vehicle.id}`}
        className={`vehicle-media${photo ? " vehicle-media-with-photo" : ""}`}
        aria-label={`${vehicle.name} ansehen`}
      >
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 620px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="vehicle-photo"
          />
        ) : (
          <PlaceholderIcon />
        )}
        <span className="image-status">
          {photo
            ? "Referenzfoto · Ingame-Bild folgt"
            : "Bild folgt · Rechte offen"}
        </span>
      </Link>
      {photo && (
        <div className="vehicle-photo-credit">
          <a
            href={photo.sourceUrl}
            target="_blank"
            rel="noreferrer"
            title={photo.modificationNote}
          >
            Foto: {photo.author} · bearbeitet
          </a>
          <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
            {photo.license}
          </a>
        </div>
      )}
      <div className="vehicle-card-content">
        {vehicle.manufacturer && (
          <div className="vehicle-manufacturer">{vehicle.manufacturer}</div>
        )}
        <div className="vehicle-pack">{vehicle.packName}</div>
        <span
          className={`catalog-status${orderable ? " catalog-status-open" : ""}`}
        >
          {status}
        </span>
        <h3 className="vehicle-name">
          <Link href={`/fahrzeuge/${vehicle.id}`}>{vehicle.name}</Link>
        </h3>
        <div className="vehicle-card-meta">
          <div>
            <span className="vehicle-price-label">
              {premium ? "SKYFALL-PREIS" : "Konditionen"}
            </span>
            <span className="vehicle-price">
              {premium ? (
                <>
                  {premium.priceDiamonds} <span className="diamond">💎</span>
                </>
              ) : (
                "Preis auf Anfrage"
              )}
            </span>
          </div>
          <Link className="card-link" href={`/fahrzeuge/${vehicle.id}`}>
            {orderable
              ? "Bestellen"
              : premium
                ? "Verfügbarkeit prüfen"
                : "Fahrzeug anfragen"}{" "}
            <ArrowIcon />
          </Link>
        </div>
        {extraAction}
      </div>
    </article>
  );
}

export function PlaceholderIcon() {
  return (
    <span className="placeholder-icon" aria-hidden="true">
      <svg viewBox="0 0 36 24" fill="none" aria-hidden="true">
        <path
          d="M4 15.5h2.4l2.2-5.3a2 2 0 0 1 1.8-1.2h14.8a2 2 0 0 1 1.7.9l3.4 5.6H32v4H4v-4Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="m10 9 1.5 5h15.4l-3-5H10Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle
          cx="10"
          cy="19.5"
          r="2.2"
          fill="#edf1f4"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle
          cx="27"
          cy="19.5"
          r="2.2"
          fill="#edf1f4"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    </span>
  );
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
