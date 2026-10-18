"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import {
  generatePlateSuffix,
  sanitizePlateSuffix,
} from "@/lib/side-feature-domain";
import type { CustomerNotificationView } from "@/lib/side-feature-store";

export function RandomVehicleButton({
  vehicleIds,
  children = "Zufallsauto entdecken",
}: {
  vehicleIds: string[];
  children?: string;
}) {
  const router = useRouter();

  function discover() {
    if (vehicleIds.length === 0) return;
    const index = Math.floor(Math.random() * vehicleIds.length);
    const vehicleId = vehicleIds[index];
    if (vehicleId) router.push(`/fahrzeuge/${vehicleId}`);
  }

  return (
    <button
      className="button-secondary"
      type="button"
      disabled={vehicleIds.length === 0}
      onClick={discover}
    >
      {children}
    </button>
  );
}

export function VehiclePassPlateEditor({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const inputId = useId();
  const storageKey = `skyfall.pass-plate.v1:${orderNumber}`;
  const [suffix, setSuffix] = useState("");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      setSuffix(sanitizePlateSuffix(localStorage.getItem(storageKey) ?? ""));
    } catch {
      setMessage("Lokaler Speicher ist nicht verfügbar.");
    }
  }, [storageKey]);

  function generate() {
    setMessage("");
    try {
      const randomBytes = window.crypto.getRandomValues(new Uint8Array(6));
      setSuffix(generatePlateSuffix(randomBytes));
      setSaved(false);
    } catch {
      setMessage("Kennzeichen konnten nicht erzeugt werden.");
    }
  }

  function save() {
    const cleanSuffix = sanitizePlateSuffix(suffix);
    if (cleanSuffix.length < 2) {
      setMessage("Gib mindestens zwei Buchstaben oder Zahlen ein.");
      return;
    }
    try {
      localStorage.setItem(storageKey, cleanSuffix);
      setSuffix(cleanSuffix);
      setSaved(true);
      setMessage("Kennzeichen auf diesem Gerät gespeichert.");
    } catch {
      setMessage("Kennzeichen konnten nicht gespeichert werden.");
    }
  }

  return (
    <div className="pass-plate-editor">
      <div
        className="skyfall-license-plate"
        role="img"
        aria-label={`SKYFALL ${suffix || "ohne Kennzeichen"}`}
      >
        <strong>SKYFALL</strong>
        <span>{suffix || "DEIN CODE"}</span>
      </div>
      <label htmlFor={inputId}>Eigenes Kennzeichen</label>
      <input
        id={inputId}
        value={suffix}
        maxLength={6}
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => {
          setSuffix(sanitizePlateSuffix(event.target.value));
          setSaved(false);
          setMessage("");
        }}
      />
      <div className="pass-plate-actions">
        <button className="button-secondary" type="button" onClick={generate}>
          Zufällig erzeugen
        </button>
        <button
          className="button-primary"
          type="button"
          disabled={suffix.length < 2 || saved}
          onClick={save}
        >
          {saved ? "Gespeichert" : "Kennzeichen speichern"}
        </button>
      </div>
      <p className="pass-plate-note">
        Wird nur lokal diesem bestätigten Fahrzeugpass zugeordnet.
      </p>
      {message && (
        <p className="form-message form-message-status" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

export function NotificationCenter({
  initialNotifications,
}: {
  initialNotifications: CustomerNotificationView[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  async function markRead(notificationId: string) {
    setBusyId(notificationId);
    setMessage("");
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok) {
        throw new Error(
          result?.message ?? "Meldung konnte nicht aktualisiert werden.",
        );
      }
      setNotifications((current) =>
        current.map((entry) =>
          entry.id === notificationId ? { ...entry, read: true } : entry,
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Meldung konnte nicht aktualisiert werden.",
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="account-card">
      <div className="account-card-heading">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Konto
          </span>
          <h2>Benachrichtigungen</h2>
        </div>
        <span className="admin-count">
          {notifications.filter((entry) => !entry.read).length} ungelesen
        </span>
      </div>
      {message && (
        <p className="form-message form-message-error" role="alert">
          {message}
        </p>
      )}
      {notifications.length ? (
        <ul className="feature-link-list">
          {notifications.map((entry) => (
            <li key={entry.id}>
              <Link href={entry.href}>
                <strong>{entry.title}</strong>
                <span>{entry.message}</span>
              </Link>
              {!entry.read && (
                <button
                  className="filter-clear-link"
                  type="button"
                  disabled={busyId === entry.id}
                  onClick={() => markRead(entry.id)}
                >
                  {busyId === entry.id ? "Speichert …" : "Gelesen"}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">Du hast keine neuen Meldungen.</p>
      )}
    </section>
  );
}
