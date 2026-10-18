"use client";

import Link from "next/link";
import { useState } from "react";

type ReviewOption = { vehicleId: string; vehicleName: string };
type LapVehicleOption = { vehicleId: string; vehicleName: string };
type WorkshopVehicleOption = { vehicleId: string; vehicleName: string };

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  if (!response.ok)
    throw new Error(result?.message ?? "Anfrage fehlgeschlagen.");
}

export function TestDriveRequestForm({
  vehicleId,
  vehicleName,
  signedIn,
}: {
  vehicleId: string;
  vehicleName: string;
  signedIn: boolean;
}) {
  const [preferredWindow, setPreferredWindow] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [messageIsError, setMessageIsError] = useState(false);

  if (!signedIn) {
    return (
      <section className="account-card feature-request-card">
        <h2>Testfahrt anfragen</h2>
        <p>
          Eine Anfrage wird erst nach manueller Prüfung durch das Team
          bestätigt.
        </p>
        <Link
          className="button-secondary"
          href={`/kundenbereich?next=/fahrzeuge/${vehicleId}`}
        >
          Anmelden
        </Link>
      </section>
    );
  }

  return (
    <section className="account-card feature-request-card">
      <span className="eyebrow">
        <span className="eyebrow-dot" /> Persönliche Anfrage
      </span>
      <h2>Testfahrt anfragen</h2>
      <p>
        Für {vehicleName}. Das ist eine Anfrage, noch keine bestätigte Buchung.
      </p>
      {submitted ? (
        <p className="form-message form-message-status" role="status">
          Anfrage eingegangen. Sie wird im Adminbereich manuell geprüft.
        </p>
      ) : (
        <form
          className="form-stack"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setMessage("");
            setMessageIsError(false);
            try {
              await postJson("/api/test-drive", { vehicleId, preferredWindow });
              setSubmitted(true);
            } catch (error) {
              setMessageIsError(true);
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Anfrage fehlgeschlagen.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="form-field">
            <span>Gewünschtes Zeitfenster (optional)</span>
            <input
              maxLength={120}
              value={preferredWindow}
              onChange={(event) => setPreferredWindow(event.target.value)}
              placeholder="Zum Beispiel: am Wochenende"
            />
          </label>
          {message && (
            <p
              className={
                messageIsError
                  ? "form-message form-message-error"
                  : "form-message form-message-status"
              }
              role={messageIsError ? "alert" : "status"}
            >
              {message}
            </p>
          )}
          <button className="button-secondary" type="submit" disabled={busy}>
            {busy ? "Wird gesendet …" : "Anfrage senden"}
          </button>
        </form>
      )}
    </section>
  );
}

export function VehicleWaitlistForm({
  vehicleId,
  vehicleName,
  signedIn,
}: {
  vehicleId: string;
  vehicleName: string;
  signedIn: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  if (!signedIn) {
    return (
      <section className="account-card feature-request-card">
        <h2>Warteliste</h2>
        <p>
          Lass dich vormerken, wenn {vehicleName} tatsächlich ausverkauft und
          für den Server freigegeben ist.
        </p>
        <Link
          className="button-secondary"
          href={`/kundenbereich?next=/fahrzeuge/${vehicleId}`}
        >
          Anmelden
        </Link>
      </section>
    );
  }

  return (
    <section className="account-card feature-request-card">
      <span className="eyebrow">
        <span className="eyebrow-dot" /> Kundenservice
      </span>
      <h2>Warteliste</h2>
      <p>
        Für {vehicleName}. Die Vormerkung ist nur bei bestätigtem, installierten
        und ausverkauftem Bestand möglich.
      </p>
      <button
        className="button-secondary"
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          setMessageIsError(false);
          try {
            await postJson("/api/waitlist", { action: "join", vehicleId });
            setMessage("Du stehst auf der Warteliste dieses Fahrzeugs.");
          } catch (error) {
            setMessageIsError(true);
            setMessage(
              error instanceof Error
                ? error.message
                : "Vormerkung konnte nicht gespeichert werden.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Wird vorgemerkt …" : "Auf die Warteliste setzen"}
      </button>
      {message && (
        <p
          className={
            messageIsError
              ? "form-message form-message-error"
              : "form-message form-message-status"
          }
          role={messageIsError ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </section>
  );
}

export function CustomerReviewForm({ vehicles }: { vehicles: ReviewOption[] }) {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.vehicleId ?? "");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const available = vehicles.filter(
    (vehicle) => !doneIds.includes(vehicle.vehicleId),
  );

  if (!available.length) {
    return doneIds.length ? (
      <p className="form-message form-message-status" role="status">
        Danke. Deine Bewertung wurde eingereicht und wartet auf Moderation.
      </p>
    ) : null;
  }
  const selectedVehicleId = available.some(
    (vehicle) => vehicle.vehicleId === vehicleId,
  )
    ? vehicleId
    : available[0].vehicleId;

  return (
    <form
      className="form-stack review-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        setMessageIsError(false);
        try {
          await postJson("/api/reviews", {
            vehicleId: selectedVehicleId,
            rating: Number(rating),
            comment,
          });
          setDoneIds((current) => [...current, selectedVehicleId]);
          setComment("");
          setMessage(
            "Bewertung eingereicht und bis zur Adminfreigabe nicht öffentlich.",
          );
        } catch (error) {
          setMessageIsError(true);
          setMessage(
            error instanceof Error
              ? error.message
              : "Bewertung konnte nicht gesendet werden.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="form-field">
        <span>Übergebenes Fahrzeug</span>
        <select
          value={selectedVehicleId}
          onChange={(event) => setVehicleId(event.target.value)}
        >
          {available.map((vehicle) => (
            <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
              {vehicle.vehicleName}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span>Bewertung</span>
        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
        >
          {[5, 4, 3, 2, 1].map((stars) => (
            <option key={stars} value={stars}>
              {stars} von 5 Sternen
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span>Dein Eindruck</span>
        <textarea
          minLength={10}
          maxLength={1000}
          required
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
        />
      </label>
      {message && (
        <p
          className={
            messageIsError
              ? "form-message form-message-error"
              : "form-message form-message-status"
          }
          role={messageIsError ? "alert" : "status"}
        >
          {message}
        </p>
      )}
      <button className="button-secondary" type="submit" disabled={busy}>
        {busy ? "Wird gesendet …" : "Zur Moderation einreichen"}
      </button>
    </form>
  );
}

export function WorkshopTicketForm({
  vehicles,
}: {
  vehicles: WorkshopVehicleOption[];
}) {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.vehicleId ?? "");
  const [requestType, setRequestType] = useState<"repair" | "tuning">("repair");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  if (vehicles.length === 0) {
    return (
      <p className="empty-state">
        Tickets sind nur für Fahrzeuge möglich, die deinem Konto als übergeben
        zugeordnet sind.
      </p>
    );
  }

  return (
    <form
      className="form-stack"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        setMessageIsError(false);
        try {
          await postJson("/api/workshop-tickets", {
            vehicleId,
            requestType,
            description,
          });
          setDescription("");
          setMessage("Anfrage eingegangen und zur Prüfung vorgemerkt.");
        } catch (error) {
          setMessageIsError(true);
          setMessage(
            error instanceof Error
              ? error.message
              : "Werkstattanfrage konnte nicht gesendet werden.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="form-field">
        <span>Übergebenes Fahrzeug</span>
        <select
          value={vehicleId}
          onChange={(event) => setVehicleId(event.target.value)}
          required
        >
          {vehicles.map((vehicle) => (
            <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
              {vehicle.vehicleName}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span>Art der Anfrage</span>
        <select
          value={requestType}
          onChange={(event) =>
            setRequestType(event.target.value as "repair" | "tuning")
          }
        >
          <option value="repair">Reparatur</option>
          <option value="tuning">Tuning</option>
        </select>
      </label>
      <label className="form-field">
        <span>Was soll gemacht werden?</span>
        <textarea
          minLength={8}
          maxLength={600}
          required
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      {message && (
        <p
          className={
            messageIsError
              ? "form-message form-message-error"
              : "form-message form-message-status"
          }
          role={messageIsError ? "alert" : "status"}
        >
          {message}
        </p>
      )}
      <button className="button-secondary" type="submit" disabled={busy}>
        {busy ? "Wird gesendet …" : "Werkstatt-Ticket eröffnen"}
      </button>
    </form>
  );
}

export function LapSubmissionForm({
  vehicles,
  signedIn,
}: {
  vehicles: LapVehicleOption[];
  signedIn: boolean;
}) {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.vehicleId ?? "");
  const [trackName, setTrackName] = useState("");
  const [seconds, setSeconds] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  if (!signedIn) {
    return (
      <p className="notice notice-pending">
        <strong>Anmeldung erforderlich</strong>
        <span>
          <Link href="/kundenbereich?next=/race-center">Melde dich an</Link>, um
          eine manuell gemessene Zeit einzureichen.
        </span>
      </p>
    );
  }

  return (
    <form
      className="form-stack lap-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const parsedSeconds = Number(seconds.replace(",", "."));
        if (!Number.isFinite(parsedSeconds) || parsedSeconds <= 0) {
          setMessage("Bitte eine gültige Rundenzeit in Sekunden eintragen.");
          setMessageIsError(true);
          return;
        }
        setBusy(true);
        setMessage("");
        setMessageIsError(false);
        try {
          await postJson("/api/leaderboard", {
            vehicleId,
            trackName,
            timeMs: Math.round(parsedSeconds * 1000),
          });
          setMessage(
            "Zeit eingereicht. Sie erscheint erst nach manueller Adminfreigabe.",
          );
          setTrackName("");
          setSeconds("");
        } catch (error) {
          setMessageIsError(true);
          setMessage(
            error instanceof Error
              ? error.message
              : "Rundenzeit konnte nicht gesendet werden.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="form-field">
        <span>Fahrzeug</span>
        <select
          value={vehicleId}
          onChange={(event) => setVehicleId(event.target.value)}
          required
        >
          {vehicles.map((vehicle) => (
            <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
              {vehicle.vehicleName}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span>Streckenname</span>
        <input
          minLength={2}
          maxLength={80}
          required
          value={trackName}
          onChange={(event) => setTrackName(event.target.value)}
        />
      </label>
      <label className="form-field">
        <span>Manuell gemessene Zeit in Sekunden</span>
        <input
          type="number"
          inputMode="decimal"
          min="0.1"
          max="3600"
          step="0.001"
          required
          value={seconds}
          onChange={(event) => setSeconds(event.target.value)}
          placeholder="z. B. 58.234"
        />
      </label>
      <p className="auth-footnote">
        Keine automatische Minecraft-Zeitmessung. Eintrag und Strecke werden vor
        Veröffentlichung geprüft.
      </p>
      {message && (
        <p
          className={
            messageIsError
              ? "form-message form-message-error"
              : "form-message form-message-status"
          }
          role={messageIsError ? "alert" : "status"}
        >
          {message}
        </p>
      )}
      <button
        className="button-secondary"
        type="submit"
        disabled={busy || vehicles.length === 0}
      >
        {busy ? "Wird gesendet …" : "Zeit zur Prüfung einreichen"}
      </button>
    </form>
  );
}
