import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PrintReceiptButton } from "@/components/print-receipt-button";
import { getCurrentAccount } from "@/lib/account";
import { formatDiamondPrice } from "@/lib/catalog";
import { getFirebaseServices } from "@/lib/firebase-admin";
import { isPurchaseReceiptEligible } from "@/lib/order-domain";
import { getCustomerOrderById } from "@/lib/order-store";

export const metadata: Metadata = { title: "Digitaler Kaufbeleg" };

export default async function PurchaseReceiptPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await connection();
  const [{ orderId }, account] = await Promise.all([
    params,
    getCurrentAccount(),
  ]);
  const services = getFirebaseServices();
  if (!account || !services) notFound();
  const order = await getCustomerOrderById(services.db, account.id, orderId);
  if (!order || !isPurchaseReceiptEligible(order)) {
    notFound();
  }

  const rows = [
    { label: order.vehicleName, price: order.unitPrice },
    ...(order.deliveryPrice > 0
      ? [{ label: "Lieferung", price: order.deliveryPrice }]
      : []),
    ...(order.express ? [{ label: "Express", price: order.expressPrice }] : []),
  ];

  return (
    <main id="main-content" className="receipt-page">
      <div className="page-container page-content receipt-wrap">
        <article className="account-card purchase-receipt">
          <div className="receipt-brand">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> SKYFALL MOTORS
            </span>
            <span className="status-pill status-paid">Bezahlt · übergeben</span>
          </div>
          <h1>Digitaler Kaufbeleg</h1>
          <p className="receipt-note">
            Dieser Beleg dokumentiert die im Shop erfasste manuelle Zahlung und
            Fahrzeugübergabe. Er ist kein steuerlicher Rechnungsbeleg.
          </p>
          <dl className="receipt-meta">
            <div>
              <dt>Bestellnummer</dt>
              <dd>{order.orderNumber}</dd>
            </div>
            <div>
              <dt>Kunde</dt>
              <dd>{account.minecraftUsername}</dd>
            </div>
            <div>
              <dt>Content-Pack</dt>
              <dd>{order.packName}</dd>
            </div>
            <div>
              <dt>Übergabe</dt>
              <dd>{new Date(order.handedOverAt).toLocaleString("de-DE")}</dd>
            </div>
            <div>
              <dt>Zahlung bestätigt</dt>
              <dd>
                {order.paidAt
                  ? new Date(order.paidAt).toLocaleString("de-DE")
                  : "Manuell bestätigt"}
              </dd>
            </div>
            <div>
              <dt>Zahlungsart</dt>
              <dd>
                {order.paymentMethod === "terminal"
                  ? "Minecraft-Terminal"
                  : "Bei Übergabe"}
              </dd>
            </div>
          </dl>
          <div className="receipt-lines">
            {rows.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                <strong>{formatDiamondPrice(row.price)} 💎</strong>
              </div>
            ))}
            <div className="receipt-total">
              <span>Gesamt</span>
              <strong>{formatDiamondPrice(order.totalPrice)} 💎</strong>
            </div>
          </div>
          <div className="receipt-actions">
            <Link
              className="text-link receipt-back-link"
              href="/kundenbereich#bestellungen"
            >
              Zur Garage und Bestellungen
            </Link>
            <PrintReceiptButton />
          </div>
        </article>
      </div>
    </main>
  );
}
