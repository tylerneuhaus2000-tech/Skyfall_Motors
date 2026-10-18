"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDiamondPrice } from "@/lib/catalog";
import { calculateOrderTotal } from "@/lib/order-domain";
import type { OrderFees, ShopMode } from "@/lib/shop-settings-domain";

type OrderFormProps = {
  vehicle: {
    id: string;
    name: string;
    packName: string;
    priceDiamonds: number;
  };
  account: { minecraftUsername: string; minecraftVerified: boolean };
  idempotencyKey: string;
  fees: OrderFees;
  shopMode: ShopMode;
};

export function OrderForm({
  vehicle,
  account,
  idempotencyKey,
  fees,
  shopMode,
}: OrderFormProps) {
  const [handover, setHandover] = useState<"pickup" | "delivery">("pickup");
  const [express, setExpress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"terminal" | "handover">(
    "terminal",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);
  const total = calculateOrderTotal(
    vehicle.priceDiamonds,
    handover,
    express,
    fees,
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          idempotencyKey,
          handover,
          express,
          paymentMethod,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        orderNumber?: string;
        totalPrice?: number;
        message?: string;
      } | null;
      if (!response.ok || !payload?.orderNumber) {
        throw new Error(
          payload?.message ?? "Die Bestellung konnte nicht gespeichert werden.",
        );
      }
      if (
        typeof payload.totalPrice !== "number" ||
        !Number.isSafeInteger(payload.totalPrice) ||
        payload.totalPrice < 1
      ) {
        throw new Error(
          "Die Bestellung wurde verarbeitet, aber der gespeicherte Gesamtpreis konnte nicht geladen werden. Bitte prüfe deine Bestellhistorie.",
        );
      }
      setConfirmedTotal(payload.totalPrice);
      setOrderNumber(payload.orderNumber);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Die Bestellung konnte nicht gespeichert werden.",
      );
      setBusy(false);
    }
  }

  if (orderNumber) {
    return (
      <div className="order-success" role="status">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> Bestellung eingegangen
        </span>
        <h2>{orderNumber}</h2>
        <p>
          Deine Bestellung wurde mit{" "}
          {formatDiamondPrice(confirmedTotal ?? total)} Diamanten erfasst. Der
          Inhaber prüft sie und aktualisiert den Status.
        </p>
        <Link href="/kundenbereich#bestellungen" className="button-primary">
          Bestellstatus ansehen
        </Link>
      </div>
    );
  }

  return (
    <form className="checkout-card" onSubmit={submit}>
      <div className="checkout-vehicle">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Bestellübersicht
          </span>
          <h2>{vehicle.name}</h2>
          <p>
            {vehicle.packName} · für {account.minecraftUsername}
          </p>
        </div>
        <strong>{formatDiamondPrice(vehicle.priceDiamonds)} 💎</strong>
      </div>

      <fieldset className="option-group">
        <legend>Übergabe</legend>
        <label className="choice-row">
          <input
            type="radio"
            name="handover"
            value="pickup"
            checked={handover === "pickup"}
            onChange={() => setHandover("pickup")}
          />
          <span>
            <strong>Abholung</strong>
            <small>Kostenlos am vereinbarten Treffpunkt</small>
          </span>
          <b>0 💎</b>
        </label>
        <label className="choice-row">
          <input
            type="radio"
            name="handover"
            value="delivery"
            checked={handover === "delivery"}
            disabled={shopMode === "restricted"}
            onChange={() => setHandover("delivery")}
          />
          <span>
            <strong>Lieferung</strong>
            <small>Übergabe durch den Inhaber im Spiel</small>
          </span>
          <b>+{formatDiamondPrice(fees.deliveryFee)} 💎</b>
        </label>
      </fieldset>

      <label className="choice-row express-choice">
        <input
          type="checkbox"
          checked={express}
          disabled={shopMode === "restricted"}
          onChange={(event) => setExpress(event.target.checked)}
        />
        <span>
          <strong>Express-Fertigung</strong>
          <small>Bevorzugte Bearbeitung, kein garantierter Termin</small>
        </span>
        <b>+{formatDiamondPrice(fees.expressFee)} 💎</b>
      </label>

      <fieldset className="option-group">
        <legend>Zahlung in Diamanten</legend>
        <label className="choice-row">
          <input
            type="radio"
            name="payment"
            value="terminal"
            checked={paymentMethod === "terminal"}
            onChange={() => setPaymentMethod("terminal")}
          />
          <span>
            <strong>Vorauszahlung am Minecraft-Terminal</strong>
            <small>Der Inhaber bestätigt die Zahlung nach Sichtprüfung.</small>
          </span>
        </label>
        <label className="choice-row">
          <input
            type="radio"
            name="payment"
            value="handover"
            checked={paymentMethod === "handover"}
            onChange={() => setPaymentMethod("handover")}
          />
          <span>
            <strong>Zahlung bei Übergabe</strong>
            <small>Der Status bleibt bis zur Bestätigung offen.</small>
          </span>
        </label>
      </fieldset>

      <div className="checkout-price-breakdown" aria-live="polite">
        <div>
          <span>Fahrzeug</span>
          <span>{formatDiamondPrice(vehicle.priceDiamonds)} 💎</span>
        </div>
        <div>
          <span>Abholung / Lieferung</span>
          <span>
            {formatDiamondPrice(handover === "delivery" ? fees.deliveryFee : 0)}{" "}
            💎
          </span>
        </div>
        <div>
          <span>Express-Fertigung</span>
          <span>{formatDiamondPrice(express ? fees.expressFee : 0)} 💎</span>
        </div>
        <div className="checkout-total">
          <span>Live-Preisvorschau</span>
          <strong>
            {formatDiamondPrice(total)} <span>💎</span>
          </strong>
        </div>
      </div>
      {!account.minecraftVerified && (
        <p className="notice notice-pending">
          <strong>Identität noch nicht geprüft.</strong>
          <span>
            Du kannst die Bestellung erfassen; Fertigung und Übergabe starten
            erst nach der manuellen Prüfung durch den Inhaber.
          </span>
        </p>
      )}
      {shopMode === "restricted" && (
        <p className="notice notice-pending">
          Eingeschränkter Betrieb: nur verifizierte Konten, Abholung und keine
          Express-Fertigung.
        </p>
      )}
      {message && (
        <p className="form-message form-message-error" role="alert">
          {message}
        </p>
      )}
      <button
        className="button-primary form-submit"
        type="submit"
        disabled={busy}
      >
        {busy
          ? "Bestellung wird gesichert …"
          : "Verbindlich in Diamanten bestellen"}
      </button>
      <p className="auth-footnote">
        Diese Vorschau ist unverbindlich. Der Server berechnet Fahrzeugpreis,
        Gebühren und Express erneut aus den serverseitigen Shop-Einstellungen.
        Eine Reservierung entsteht erst nach erfolgreicher Speicherung.
      </p>
    </form>
  );
}
