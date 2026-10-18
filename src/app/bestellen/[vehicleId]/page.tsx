import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { OrderForm } from "@/components/order-form";
import { getCurrentAccount } from "@/lib/account";
import { findVehicle, formatDiamondPrice } from "@/lib/catalog";
import { getFirebaseServices, isFirebaseReady } from "@/lib/firebase-admin";
import {
  getInventoryView,
  getShopSettings,
  type InventoryView,
  type ShopSettingsView,
} from "@/lib/order-store";
import { getPremiumVehicle } from "@/lib/premium-catalog";
import {
  defaultShopSettings,
  shopModeLabels,
} from "@/lib/shop-settings-domain";

type OrderPageProps = PageProps<"/bestellen/[vehicleId]">;

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { vehicleId } = await params;
  const vehicle = findVehicle(vehicleId);
  return {
    title: vehicle ? `Bestellung · ${vehicle.name}` : "Fahrzeug nicht gefunden",
  };
}

export default function VehicleOrderPage(props: OrderPageProps) {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-container page-heading">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> SKYFALL MOTORS · Fahrzeugbestellung
          </span>
          <h1>Bestellung prüfen.</h1>
          <p>
            Preise und Lagerfreigabe werden beim Absenden noch einmal sicher auf
            dem Server geprüft.
          </p>
        </div>
      </section>
      <div className="page-container page-content checkout-layout">
        <Suspense
          fallback={
            <section className="account-card">
              <p>Verfügbarkeit wird geprüft …</p>
            </section>
          }
        >
          <OrderContent params={props.params} />
        </Suspense>
      </div>
    </main>
  );
}

async function OrderContent({ params }: Pick<OrderPageProps, "params">) {
  await connection();
  const { vehicleId } = await params;
  const vehicle = findVehicle(vehicleId);
  if (!vehicle || !getPremiumVehicle(vehicleId)) notFound();

  const firebaseReady = isFirebaseReady();
  const account = await getCurrentAccount();
  const services = getFirebaseServices();
  let inventory: InventoryView | null = null;
  let inventoryError = false;
  let shopSettings: ShopSettingsView = defaultShopSettings;
  let settingsError = false;
  if (firebaseReady && services) {
    try {
      shopSettings = await getShopSettings(services.db);
    } catch {
      settingsError = true;
    }
    if (account && !settingsError) {
      try {
        inventory = await getInventoryView(services.db, vehicle.id);
      } catch {
        inventoryError = true;
      }
    }
  }

  return (
    <>
      <aside className="checkout-aside">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> Dein Wunschfahrzeug
        </span>
        <h2>{vehicle.name}</h2>
        <p>
          {vehicle.packName} {vehicle.packVersion}
        </p>
        <strong className="checkout-aside-price">
          {formatDiamondPrice(
            inventory?.priceDiamonds ?? vehicle.priceDiamonds,
          )}{" "}
          💎
        </strong>
        <div className="detail-facts">
          <div className="detail-fact">
            <span>Abholung</span>
            <span>Kostenlos</span>
          </div>
          <div className="detail-fact">
            <span>Lieferung</span>
            <span>+{shopSettings.deliveryFee} 💎</span>
          </div>
          <div className="detail-fact">
            <span>Express</span>
            <span>+{shopSettings.expressFee} 💎</span>
          </div>
        </div>
        <p className="admin-help">
          Shop-Betrieb: {shopModeLabels[shopSettings.mode]}
        </p>
        <Link className="text-link" href={`/fahrzeuge/${vehicle.id}`}>
          Zurück zu den Fahrzeugdetails
        </Link>
      </aside>

      {!firebaseReady ? (
        <section className="account-card setup-card" role="status">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Noch nicht verfügbar
          </span>
          <h2>Bestellungen sind noch geschlossen.</h2>
          <p>
            Firebase wurde nicht vollständig eingerichtet. Es wurde keine
            Bestellung angenommen und kein Lagerplatz reserviert.
          </p>
        </section>
      ) : settingsError ? (
        <section className="account-card setup-card" role="alert">
          <h2>Shop-Einstellungen nicht verfügbar.</h2>
          <p>Die Bestellannahme bleibt vorsichtshalber gesperrt.</p>
        </section>
      ) : shopSettings.mode === "closed" ? (
        <section className="account-card setup-card" role="status">
          <h2>Der Shop ist geschlossen.</h2>
          <p>Neue Bestellungen sind vorübergehend deaktiviert.</p>
        </section>
      ) : shopSettings.mode === "maintenance" ? (
        <section className="account-card setup-card" role="status">
          <h2>Der Shop wird gewartet.</h2>
          <p>Neue Bestellungen sind während der Wartung deaktiviert.</p>
        </section>
      ) : !account ? (
        <section className="account-card setup-card">
          <h2>Melde dich für die Bestellung an.</h2>
          <p>
            Dein Minecraft-Name wird zunächst unverifiziert geführt. Der Inhaber
            prüft ihn vor der Fertigung persönlich im Spiel.
          </p>
          <Link
            className="button-primary"
            href={`/kundenbereich?next=/bestellen/${vehicle.id}`}
          >
            Zum Kundenkonto
          </Link>
        </section>
      ) : inventoryError ? (
        <section className="account-card setup-card" role="alert">
          <h2>Verfügbarkeit gerade nicht prüfbar.</h2>
          <p>
            Es wurde keine Bestellung angelegt. Bitte lade die Seite erneut.
          </p>
        </section>
      ) : shopSettings.mode === "restricted" && !account.minecraftVerified ? (
        <section className="account-card setup-card" role="status">
          <h2>Im eingeschränkten Betrieb nur für verifizierte Konten.</h2>
          <p>Der Inhaber muss deinen Minecraft-Namen zuerst im Spiel prüfen.</p>
        </section>
      ) : !inventory?.canOrder ? (
        <section className="account-card setup-card" role="status">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Nicht freigegeben
          </span>
          <h2>Dieses Fahrzeug ist derzeit nicht bestellbar.</h2>
          <p>
            Der Inhaber muss die konkrete Server-Version und Variante prüfen,
            das Fahrzeug freigeben und verfügbaren Bestand eintragen.
          </p>
        </section>
      ) : (
        <OrderForm
          vehicle={{
            id: vehicle.id,
            name: vehicle.name,
            packName: vehicle.packName,
            priceDiamonds: inventory.priceDiamonds,
          }}
          fees={{
            deliveryFee: shopSettings.deliveryFee,
            expressFee: shopSettings.expressFee,
          }}
          shopMode={shopSettings.mode}
          account={{
            minecraftUsername: account.minecraftUsername,
            minecraftVerified: account.minecraftVerified,
          }}
          idempotencyKey={randomUUID()}
        />
      )}
    </>
  );
}
