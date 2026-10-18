import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CatalogBrowser } from "@/components/catalog-browser";
import { getCurrentAccount } from "@/lib/account";
import { vehicles } from "@/lib/catalog";
import { getFirebaseServices, isFirebaseReady } from "@/lib/firebase-admin";
import { listPublicCatalogInventory } from "@/lib/order-store";
import { getPremiumVehicle } from "@/lib/premium-catalog";
import { listWishlist } from "@/lib/side-feature-store";
import { vehicleCandidates } from "@/lib/vehicle-candidates";

export const metadata: Metadata = { title: "Fahrzeugkatalog" };

type VehiclesPageProps = PageProps<"/fahrzeuge">;

export default function VehiclesPage(props: VehiclesPageProps) {
  return (
    <main id="main-content">
      <section className="page-hero catalog-page-hero">
        <div className="page-container page-heading">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Fahrzeugkatalog
          </span>
          <h1>Die Premium-Kollektion.</h1>
          <p>
            16 Modelle mit festen Diamantenpreisen. Alle weiteren Fahrzeuge sind
            auf Anfrage erhältlich.
          </p>
        </div>
      </section>
      <section className="page-container page-content">
        <div className="status-banner catalog-alert">
          <span className="status-banner-icon">
            <InfoIcon />
          </span>
          <div>
            <strong>Premiumpreis heißt nicht automatisch verfügbar.</strong>
            <p>
              Pack-Nachweis, tatsächliche Serverinstallation und Bestand bleiben
              getrennte Angaben. Eine Bestellung wird erst nach Serverfreigabe
              und Bestandsprüfung ermöglicht.
            </p>
          </div>
        </div>
        <Suspense
          fallback={
            <section className="account-card" role="status">
              <p>Freigaben und Lagerbestand werden geladen …</p>
            </section>
          }
        >
          <CatalogResults searchParams={props.searchParams} />
        </Suspense>
      </section>
    </main>
  );
}

async function CatalogResults({
  searchParams,
}: Pick<VehiclesPageProps, "searchParams">) {
  await connection();
  const params = await searchParams;
  let inventory: Awaited<ReturnType<typeof listPublicCatalogInventory>> = {};
  const services = isFirebaseReady() ? getFirebaseServices() : null;
  const account = await getCurrentAccount();
  let wishlistVehicleIds: string[] = [];
  if (services) {
    try {
      inventory = await listPublicCatalogInventory(services.db);
      if (account)
        wishlistVehicleIds = await listWishlist(services.db, account.id);
    } catch {
      inventory = {};
    }
  }
  return (
    <CatalogBrowser
      catalogItems={[...vehicles, ...vehicleCandidates].map((vehicle) => ({
        ...vehicle,
        priceDiamonds: getPremiumVehicle(vehicle.id)?.priceDiamonds ?? 0,
      }))}
      inventory={inventory}
      signedIn={Boolean(account)}
      wishlistVehicleIds={wishlistVehicleIds}
      initialVehicleClass={
        Array.isArray(params.klasse)
          ? (params.klasse[0] ?? "all")
          : (params.klasse ?? "all")
      }
    />
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 11v5m0-8h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
