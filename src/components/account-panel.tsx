"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CustomerReviewForm,
  WorkshopTicketForm,
} from "@/components/side-feature-forms";
import {
  NotificationCenter,
  VehiclePassPlateEditor,
} from "@/components/side-feature-widgets";
import type { PublicAccount } from "@/lib/account";
import { formatDiamondPrice } from "@/lib/catalog";
import { exchangeCustomTokenForSession } from "@/lib/firebase-client";
import type { InquiryView } from "@/lib/inquiry-store";
import { orderStatusLabels } from "@/lib/order-domain";
import type { OrderView } from "@/lib/order-store";
import {
  deliveryStepIndex,
  deliverySteps,
  deriveCollectorBadges,
  isVehiclePassEligible,
} from "@/lib/side-feature-domain";
import type {
  CustomerNotificationView,
  TestDriveRequestView,
  VehicleWaitlistEntryView,
  WorkshopTicketView,
} from "@/lib/side-feature-store";

type AccountPanelProps = {
  firebaseReady: boolean;
  account: PublicAccount | null;
  orders: OrderView[];
  wishlistVehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    packName: string;
  }>;
  testDriveRequests: TestDriveRequestView[];
  waitlistEntries: VehicleWaitlistEntryView[];
  workshopTickets: WorkshopTicketView[];
  notifications: CustomerNotificationView[];
  inquiries: InquiryView[];
  inquiriesError?: string;
  ordersError?: string;
  returnTo: string;
};

export function AccountPanel({
  firebaseReady,
  account,
  orders,
  wishlistVehicles,
  testDriveRequests,
  waitlistEntries,
  workshopTickets,
  notifications,
  inquiries,
  inquiriesError,
  ordersError,
  returnTo,
}: AccountPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minecraftUsername, password }),
      });
      const payload = (await response.json().catch(() => null)) as {
        customToken?: string;
        message?: string;
      } | null;
      if (!response.ok || !payload?.customToken) {
        throw new Error(
          payload?.message ?? "Die Anmeldung ist fehlgeschlagen.",
        );
      }
      await exchangeCustomTokenForSession(payload.customToken);
      window.location.assign(returnTo);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Die Anmeldung ist fehlgeschlagen.",
      );
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok)
        throw new Error("Abmeldung fehlgeschlagen. Bitte erneut versuchen.");
      window.location.assign("/kundenbereich");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Abmeldung fehlgeschlagen.",
      );
      setBusy(false);
    }
  }

  const handedOverOrders = getHandedOverOrders(orders);
  const collectorBadges = deriveCollectorBadges(
    handedOverOrders.map((order) => ({
      status: order.status,
      vehicleId: order.vehicleId,
      packName: order.packName,
      handedOverAt: order.handedOverAt,
    })),
  );
  const reviewableVehicles = Array.from(
    new Map(
      handedOverOrders.map((order) => [
        order.vehicleId,
        { vehicleId: order.vehicleId, vehicleName: order.vehicleName },
      ]),
    ).values(),
  );

  if (!firebaseReady) {
    return (
      <section className="account-card setup-card" aria-live="polite">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> Sicherer Zugang
        </span>
        <h2>Konten sind noch nicht freigeschaltet.</h2>
        <p>
          Firebase ist noch nicht vollständig eingerichtet. Es werden hier keine
          Passwörter entgegengenommen.
        </p>
      </section>
    );
  }

  if (account) {
    return (
      <div className="account-stack">
        <section className="account-card">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Kundenkonto
              </span>
              <h2>{account.minecraftUsername}</h2>
            </div>
            <button
              className="button-secondary"
              type="button"
              disabled={busy}
              onClick={logout}
            >
              {busy ? "Einen Moment …" : "Abmelden"}
            </button>
          </div>
          <div
            className={
              account.minecraftVerified
                ? "notice notice-success"
                : "notice notice-pending"
            }
          >
            <strong>
              {account.minecraftVerified
                ? "Minecraft-Name bestätigt"
                : "Minecraft-Name noch nicht bestätigt"}
            </strong>
            <span>
              {account.minecraftVerified
                ? "Der Inhaber hat deine Identität manuell geprüft."
                : "Der Inhaber muss deinen Namen im Spiel prüfen, bevor eine Bestellung in Fertigung geht."}
            </span>
          </div>
          {(account.role === "owner" || account.role === "staff") && (
            <Link className="button-primary" href="/admin">
              Zum Adminbereich
            </Link>
          )}
        </section>

        <section className="account-card">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Service
              </span>
              <h2>Werkstatt-Tickets</h2>
            </div>
          </div>
          {workshopTickets.length ? (
            <div className="admin-order-list">
              {workshopTickets.map((ticket) => (
                <article className="admin-order-card" key={ticket.id}>
                  <div className="admin-order-heading">
                    <div>
                      <h3>
                        {ticket.requestType === "repair"
                          ? "Reparatur"
                          : "Tuning"}{" "}
                        · {ticket.vehicleName}
                      </h3>
                      <p>{ticket.description}</p>
                    </div>
                    <span className="status-pill">
                      {workshopTicketLabels[ticket.status]}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">Noch keine Werkstatt-Tickets.</p>
          )}
          <p className="admin-help">
            Anfragen sind keine Kosten- oder Terminbestätigung. Das Team meldet
            sich mit den nächsten Schritten.
          </p>
          <WorkshopTicketForm vehicles={reviewableVehicles} />
        </section>

        <NotificationCenter initialNotifications={notifications} />

        <CustomerInquiryPanel
          initialInquiries={inquiries}
          loadError={inquiriesError}
        />

        <section className="account-card" id="bestellungen">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Auftragsübersicht
              </span>
              <h2>Deine Bestellungen</h2>
            </div>
            <Link className="text-link" href="/fahrzeuge">
              Fahrzeuge ansehen
            </Link>
          </div>
          {ordersError ? (
            <p className="form-message form-message-error" role="alert">
              {ordersError}
            </p>
          ) : orders.length ? (
            <div className="order-list">
              {orders.map((order) => (
                <OrderSummary key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <p className="empty-state">
              Hier erscheinen deine Bestellungen, sobald du ein freigegebenes
              Fahrzeug bestellt hast.
            </p>
          )}
        </section>

        <section className="account-card">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Kundenservice
              </span>
              <h2>Fahrzeug-Warteliste</h2>
            </div>
          </div>
          {waitlistEntries.length ? (
            <ul className="feature-link-list">
              {waitlistEntries.map((entry) => (
                <li key={entry.id}>
                  <Link href={`/fahrzeuge/${entry.vehicleId}`}>
                    <strong>{entry.vehicleName}</strong>
                    <span>
                      {entry.status === "contacted"
                        ? "Vom Team kontaktiert"
                        : "Vorgemerkt · wartet auf Rückmeldung"}
                    </span>
                  </Link>
                  <WaitlistRemoveButton vehicleId={entry.vehicleId} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">
              Noch keine Fahrzeuge vorgemerkt. Die Warteliste öffnet nur bei
              bestätigt ausverkauftem Bestand.
            </p>
          )}
        </section>

        <section className="account-card">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Deine Garage
              </span>
              <h2>Digitale Fahrzeugpässe</h2>
            </div>
            <span className="admin-count">
              {handedOverOrders.length} übergeben
            </span>
          </div>
          <p className="admin-help">
            Ein Pass wird nur aus einer administrativ bestätigten
            Fahrzeugübergabe erzeugt. Eine Minecraft-UUID oder automatische
            Serverprüfung liegt nicht vor.
          </p>
          {handedOverOrders.length ? (
            <div className="vehicle-pass-list">
              {handedOverOrders.map((order) => (
                <article className="vehicle-pass" key={order.id}>
                  <span className="eyebrow">
                    <span className="eyebrow-dot" /> Übergabe bestätigt
                  </span>
                  <h3>{order.vehicleName}</h3>
                  <p>
                    {order.packName} · Bestellnummer {order.orderNumber}
                  </p>
                  <span>
                    Übergeben am{" "}
                    {new Date(
                      order.handedOverAt ?? order.createdAt,
                    ).toLocaleDateString("de-DE")}
                  </span>
                  <VehiclePassPlateEditor orderNumber={order.orderNumber} />
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              Noch kein Fahrzeug wurde als übergeben bestätigt.
            </p>
          )}
        </section>

        <section className="account-card">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Sammlung
              </span>
              <h2>Sammler-Abzeichen</h2>
            </div>
          </div>
          {collectorBadges.length ? (
            <div className="collector-badges">
              {collectorBadges.map((badge) => (
                <article className="collector-badge" key={badge.id}>
                  <strong>{badge.title}</strong>
                  <span>{badge.description}</span>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              Abzeichen werden ausschließlich aus bestätigten Fahrzeugübergaben
              berechnet.
            </p>
          )}
        </section>

        <section className="account-card">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Gespeicherte Modelle
              </span>
              <h2>Wunschliste</h2>
            </div>
            <Link className="text-link" href="/fahrzeuge">
              Zum Katalog
            </Link>
          </div>
          {wishlistVehicles.length ? (
            <ul className="feature-link-list">
              {wishlistVehicles.map((vehicle) => (
                <li key={vehicle.vehicleId}>
                  <Link href={`/fahrzeuge/${vehicle.vehicleId}`}>
                    <strong>{vehicle.vehicleName}</strong>
                    <span>{vehicle.packName}</span>
                  </Link>
                  <WishlistRemoveButton vehicleId={vehicle.vehicleId} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">
              Noch keine Fahrzeuge gespeichert. Merke Modelle direkt im Katalog
              vor.
            </p>
          )}
        </section>

        <section className="account-card">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Kundenservice
              </span>
              <h2>Testfahrt-Anfragen</h2>
            </div>
          </div>
          {testDriveRequests.length ? (
            <div className="feature-link-list">
              {testDriveRequests.map((request) => (
                <div key={request.id}>
                  <Link href={`/fahrzeuge/${request.vehicleId}`}>
                    <strong>{request.vehicleName}</strong>
                    <span>
                      {request.preferredWindow || "Kein Zeitfenster angegeben"}
                    </span>
                  </Link>
                  <span className="status-pill">
                    {testDriveLabels[request.status]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Noch keine Testfahrt-Anfragen.</p>
          )}
        </section>

        {reviewableVehicles.length > 0 && (
          <section className="account-card">
            <div className="account-card-heading">
              <div>
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> Nur nach Übergabe
                </span>
                <h2>Fahrzeug bewerten</h2>
              </div>
            </div>
            <p className="admin-help">
              Bewertungen werden erst nach manueller Moderation veröffentlicht.
            </p>
            <CustomerReviewForm vehicles={reviewableVehicles} />
          </section>
        )}
        {message && (
          <p className="form-message form-message-error" role="alert">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="account-card auth-card">
      <span className="eyebrow">
        <span className="eyebrow-dot" /> Sicherer Zugang
      </span>
      <h2>{mode === "login" ? "Willkommen zurück." : "Konto erstellen."}</h2>
      <p className="auth-explainer">
        Melde dich mit deinem Minecraft-Namen an. Eine E-Mail-Adresse ist nicht
        erforderlich. Der Name bleibt zunächst unverifiziert.
      </p>
      <div className="auth-tabs" role="tablist" aria-label="Anmeldung wählen">
        <button
          className={mode === "login" ? "auth-tab is-active" : "auth-tab"}
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          onClick={() => {
            setMode("login");
            setMessage("");
          }}
        >
          Anmelden
        </button>
        <button
          className={mode === "register" ? "auth-tab is-active" : "auth-tab"}
          type="button"
          role="tab"
          aria-selected={mode === "register"}
          onClick={() => {
            setMode("register");
            setMessage("");
          }}
        >
          Registrieren
        </button>
      </div>
      <form className="form-stack" onSubmit={submit}>
        <label className="form-field">
          <span>Minecraft-Name</span>
          <input
            autoComplete="username"
            minLength={3}
            maxLength={16}
            pattern="[A-Za-z0-9_]+"
            required
            value={minecraftUsername}
            onChange={(event) => setMinecraftUsername(event.target.value)}
          />
          <small>3–16 Zeichen: Buchstaben, Zahlen oder Unterstrich.</small>
        </label>
        <label className="form-field">
          <span>Passwort</span>
          <input
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            type="password"
            minLength={mode === "register" ? 12 : 1}
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {mode === "register" && (
            <small>
              Mindestens 12 Zeichen. Das Passwort wird nur serverseitig gehasht
              gespeichert.
            </small>
          )}
        </label>
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
            ? "Einen Moment …"
            : mode === "login"
              ? "Sicher anmelden"
              : "Konto erstellen"}
        </button>
      </form>
      <p className="auth-footnote">
        Die Minecraft-Identität wird nicht automatisch geprüft. Eine
        Wiederherstellung ohne E-Mail kann später nur nach manueller Prüfung
        durch den Inhaber erfolgen.
      </p>
    </section>
  );
}

const testDriveLabels: Record<TestDriveRequestView["status"], string> = {
  pending: "Wartet auf Prüfung",
  approved: "Manuell freigegeben",
  declined: "Abgelehnt",
  completed: "Durchgeführt",
};

const workshopTicketLabels: Record<WorkshopTicketView["status"], string> = {
  requested: "Eingegangen",
  in_review: "Wird geprüft",
  waiting_for_parts: "Wartet auf Teile",
  ready: "Arbeit abgeschlossen",
  completed: "Abgeschlossen",
  declined: "Abgelehnt",
};

const inquiryStatusLabels: Record<InquiryView["status"], string> = {
  open: "Eingegangen",
  in_progress: "Wird bearbeitet",
  answered: "Beantwortet",
  closed: "Abgeschlossen",
};

function CustomerInquiryPanel({
  initialInquiries,
  loadError,
}: {
  initialInquiries: InquiryView[];
  loadError?: string;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [offerBusy, setOfferBusy] = useState("");
  const [offerFeedback, setOfferFeedback] = useState<Record<string, string>>(
    {},
  );

  async function respondToOffer(
    inquiry: InquiryView,
    action: "accept" | "decline",
  ) {
    setOfferBusy(inquiry.id);
    setOfferFeedback((current) => ({ ...current, [inquiry.id]: "" }));
    try {
      const response = await fetch("/api/inquiries/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          inquiryId: inquiry.id,
          ...(action === "accept"
            ? { idempotencyKey: crypto.randomUUID() }
            : {}),
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
        orderNumber?: string;
      } | null;
      if (!response.ok)
        throw new Error(
          result?.message ?? "Angebot konnte nicht verarbeitet werden.",
        );
      setOfferFeedback((current) => ({
        ...current,
        [inquiry.id]:
          action === "accept"
            ? `Angebot angenommen. Bestellung ${result?.orderNumber ?? ""} wurde erstellt.`
            : "Angebot abgelehnt.",
      }));
      router.refresh();
    } catch (error) {
      setOfferFeedback((current) => ({
        ...current,
        [inquiry.id]:
          error instanceof Error
            ? error.message
            : "Angebot konnte nicht verarbeitet werden.",
      }));
    } finally {
      setOfferBusy("");
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok)
        throw new Error(
          result?.message ?? "Anfrage konnte nicht gesendet werden.",
        );
      setSubject("");
      setMessage("");
      setFeedback("Deine Anfrage wurde an den Kundenservice gesendet.");
      router.refresh();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Anfrage konnte nicht gesendet werden.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="account-card">
      <div className="account-card-heading">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Kundenservice
          </span>
          <h2>Deine Anfragen</h2>
        </div>
      </div>
      {loadError ? (
        <p className="form-message form-message-error" role="alert">
          {loadError}
        </p>
      ) : initialInquiries.length ? (
        <div className="inquiry-list">
          {initialInquiries.map((inquiry) => (
            <article className="inquiry-card" key={inquiry.id}>
              <div className="inquiry-heading">
                <strong>{inquiry.subject}</strong>
                <span className="status-pill">
                  {inquiryStatusLabels[inquiry.status]}
                </span>
              </div>
              <p>{inquiry.message}</p>
              <small>
                Eingegangen am{" "}
                {new Date(inquiry.createdAt).toLocaleDateString("de-DE")}
              </small>
              {inquiry.staffReply && (
                <div className="inquiry-reply">
                  <strong>Antwort vom SKYFALL-Team</strong>
                  <p>{inquiry.staffReply}</p>
                </div>
              )}
              {inquiry.offerStatus === "offered" &&
                inquiry.offerPriceDiamonds != null && (
                  <div className="inquiry-reply">
                    <strong>
                      Dein Angebot: {inquiry.offerPriceDiamonds} 💎
                    </strong>
                    <p>
                      Bei Annahme wird eine reguläre Abholbestellung mit Zahlung
                      am Minecraft-Terminal angelegt. Serverfreigabe und Bestand
                      werden dabei erneut geprüft.
                    </p>
                    <div className="hero-actions">
                      <button
                        className="button-primary"
                        type="button"
                        disabled={offerBusy === inquiry.id}
                        onClick={() => void respondToOffer(inquiry, "accept")}
                      >
                        {offerBusy === inquiry.id
                          ? "Wird verarbeitet …"
                          : "Angebot annehmen"}
                      </button>
                      <button
                        className="button-secondary"
                        type="button"
                        disabled={offerBusy === inquiry.id}
                        onClick={() => void respondToOffer(inquiry, "decline")}
                      >
                        Ablehnen
                      </button>
                    </div>
                  </div>
                )}
              {inquiry.offerStatus &&
                inquiry.offerStatus !== "none" &&
                inquiry.offerStatus !== "offered" && (
                  <small>
                    Angebot{" "}
                    {inquiry.offerStatus === "accepted"
                      ? "angenommen"
                      : "abgelehnt"}
                  </small>
                )}
              {offerFeedback[inquiry.id] && (
                <p className="form-message form-message-status" role="status">
                  {offerFeedback[inquiry.id]}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">Du hast noch keine Anfrage gesendet.</p>
      )}
      <form className="form-stack inquiry-form" onSubmit={submit}>
        <label className="form-field">
          <span>Betreff</span>
          <input
            required
            minLength={3}
            maxLength={100}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>Nachricht</span>
          <textarea
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>
        {feedback && (
          <p className="form-message form-message-status" role="status">
            {feedback}
          </p>
        )}
        <button className="button-secondary" type="submit" disabled={busy}>
          {busy ? "Wird gesendet …" : "Anfrage senden"}
        </button>
      </form>
    </section>
  );
}

function OrderSummary({ order }: { order: OrderView }) {
  const currentStep = deliveryStepIndex(order.status);
  return (
    <article className="order-summary">
      <div className="order-summary-main">
        <div>
          <span className="order-number">{order.orderNumber}</span>
          <h3>{order.vehicleName}</h3>
          <p>
            {order.packName} ·{" "}
            {new Date(order.createdAt).toLocaleDateString("de-DE")}
          </p>
        </div>
        <strong className="order-total">
          {formatDiamondPrice(order.totalPrice)} 💎
        </strong>
      </div>
      <div className="order-summary-meta">
        <span className="status-pill">{orderStatusLabels[order.status]}</span>
        <span
          className={
            order.paymentStatus === "paid"
              ? "status-pill status-paid"
              : "status-pill status-unpaid"
          }
        >
          {order.paymentStatus === "paid"
            ? "Zahlung bestätigt"
            : "Zahlung offen"}
        </span>
        <span>Fahrzeug {formatDiamondPrice(order.unitPrice)} 💎</span>
        <span>
          {order.handover === "pickup"
            ? "Abholung kostenlos"
            : `Lieferung +${formatDiamondPrice(order.deliveryPrice)} 💎`}
        </span>
        {order.express && (
          <span>Express +{formatDiamondPrice(order.expressPrice)} 💎</span>
        )}
      </div>
      {order.status === "delivered" &&
        order.paymentStatus === "paid" &&
        order.handedOverAt && (
          <Link
            className="text-link order-receipt-link"
            href={`/kundenbereich/belege/${order.id}`}
          >
            Digitalen Kaufbeleg öffnen
          </Link>
        )}
      {order.status === "cancelled" ? (
        <p className="tracker-cancelled">Dieser Auftrag wurde storniert.</p>
      ) : (
        <ol
          className="delivery-tracker"
          aria-label={`Lieferstatus: ${orderStatusLabels[order.status]}`}
        >
          {deliverySteps.map((step, index) => (
            <li
              className={
                index < currentStep
                  ? "is-complete"
                  : index === currentStep
                    ? "is-current"
                    : ""
              }
              key={step.status}
            >
              <span aria-hidden="true" />
              {step.label}
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

function getHandedOverOrders(orders: OrderView[]) {
  return orders.filter(isVehiclePassEligible);
}

function WishlistRemoveButton({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function remove() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", vehicleId }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok)
        throw new Error(
          result?.message ?? "Fahrzeug konnte nicht entfernt werden.",
        );
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Fahrzeug konnte nicht entfernt werden.",
      );
      setBusy(false);
    }
  }

  return (
    <span className="local-tool-control">
      <button
        className="filter-clear-link"
        type="button"
        disabled={busy}
        onClick={remove}
      >
        {busy ? "Entferne …" : "Entfernen"}
      </button>
      {message && (
        <span className="local-tool-message" role="alert">
          {message}
        </span>
      )}
    </span>
  );
}

function WaitlistRemoveButton({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function remove() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave", vehicleId }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok)
        throw new Error(
          result?.message ?? "Vormerkung konnte nicht entfernt werden.",
        );
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Vormerkung konnte nicht entfernt werden.",
      );
      setBusy(false);
    }
  }

  return (
    <span className="local-tool-control">
      <button
        className="filter-clear-link"
        type="button"
        disabled={busy}
        onClick={remove}
      >
        {busy ? "Entferne …" : "Vormerkung löschen"}
      </button>
      {message && (
        <span className="local-tool-message" role="alert">
          {message}
        </span>
      )}
    </span>
  );
}
