"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  addRecentlyViewedVehicle,
  toggleComparedVehicle,
} from "@/lib/side-feature-domain";

const compareStorageKey = "skyfall.compare.v1";
const recentStorageKey = "skyfall.recent.v1";
const compareEventName = "skyfall-compare-updated";
const recentEventName = "skyfall-recent-updated";
const compareLimit = 3;

export type LocalVehicleSummary = {
  id: string;
  name: string;
  manufacturer?: string;
  packName: string;
  vehicleClass: string;
  gameVersion: string;
  modloader: string;
  priceDiamonds?: number;
  availability: string;
  orderEligible: boolean;
};

function readIds(key: string, limit: number) {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(key) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed
          .filter((value): value is string => typeof value === "string")
          .slice(0, limit)
      : [];
  } catch {
    return [];
  }
}

function updateIds(key: string, eventName: string, ids: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // The current tab can still use the event state when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(eventName, { detail: ids }));
}

export function CompareButton({ vehicleId }: { vehicleId: string }) {
  const [selected, setSelected] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = (event?: Event) => {
      const detail = (event as CustomEvent<string[]> | undefined)?.detail;
      const ids = Array.isArray(detail)
        ? detail
        : readIds(compareStorageKey, compareLimit);
      setSelected(ids.includes(vehicleId));
    };
    sync();
    window.addEventListener(compareEventName, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(compareEventName, sync);
      window.removeEventListener("storage", sync);
    };
  }, [vehicleId]);

  function toggle() {
    const current = readIds(compareStorageKey, compareLimit);
    const result = toggleComparedVehicle(current, vehicleId);
    if (!result.error)
      updateIds(compareStorageKey, compareEventName, result.ids);
    setMessage(result.error ?? "");
  }

  return (
    <span className="local-tool-control">
      <button
        type="button"
        className="card-tool-button"
        aria-pressed={selected}
        onClick={toggle}
      >
        {selected ? "Im Vergleich · entfernen" : "Vergleichen"}
      </button>
      {selected && (
        <Link
          className="local-tool-message"
          href="/fahrzeuge#fahrzeugvergleich"
        >
          Vergleich öffnen
        </Link>
      )}
      {message && (
        <span className="local-tool-message" role="status">
          {message}
        </span>
      )}
    </span>
  );
}

export function WishlistButton({
  vehicleId,
  signedIn,
  initialSaved = false,
}: {
  vehicleId: string;
  signedIn: boolean;
  initialSaved?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (!signedIn) {
    return (
      <Link className="card-tool-button" href="/kundenbereich">
        Anmelden zum Merken
      </Link>
    );
  }

  async function toggle() {
    setBusy(true);
    setMessage("");
    try {
      const nextAction = saved ? "remove" : "add";
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextAction, vehicleId }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok)
        throw new Error(
          result?.message ?? "Wunschliste konnte nicht aktualisiert werden.",
        );
      setSaved(nextAction === "add");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Wunschliste konnte nicht aktualisiert werden.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="local-tool-control">
      <button
        type="button"
        className="card-tool-button"
        aria-pressed={saved}
        disabled={busy}
        onClick={toggle}
      >
        {busy
          ? "Speichere …"
          : saved
            ? "Auf Wunschliste · entfernen"
            : "Auf die Wunschliste"}
      </button>
      {message && (
        <span className="local-tool-message" role="alert">
          {message}
        </span>
      )}
    </span>
  );
}

export function ComparePanel({
  vehicles,
}: {
  vehicles: LocalVehicleSummary[];
}) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = (event?: Event) => {
      const detail = (event as CustomEvent<string[]> | undefined)?.detail;
      setIds(
        Array.isArray(detail)
          ? detail.slice(0, compareLimit)
          : readIds(compareStorageKey, compareLimit),
      );
    };
    sync();
    window.addEventListener(compareEventName, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(compareEventName, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const selected = ids.flatMap((id) => {
    const vehicle = vehicles.find((entry) => entry.id === id);
    return vehicle ? [vehicle] : [];
  });

  return (
    <section
      id="fahrzeugvergleich"
      className="local-feature-panel compare-panel"
      aria-labelledby="compare-heading"
    >
      <div className="local-feature-heading">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Lokal gespeichert
          </span>
          <h2 id="compare-heading">Fahrzeuge vergleichen</h2>
        </div>
        <span className="admin-count">
          {selected.length}/{compareLimit}
        </span>
      </div>
      {selected.length ? (
        <>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">Merkmal</th>
                  {selected.map((vehicle) => (
                    <th scope="col" key={vehicle.id}>
                      <Link href={`/fahrzeuge/${vehicle.id}`}>
                        {vehicle.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="Hersteller"
                  values={selected.map((item) => ({
                    id: item.id,
                    value: item.manufacturer || "Nicht angegeben",
                  }))}
                />
                <CompareRow
                  label="Content-Pack"
                  values={selected.map((item) => ({
                    id: item.id,
                    value: item.packName,
                  }))}
                />
                <CompareRow
                  label="Klasse"
                  values={selected.map((item) => ({
                    id: item.id,
                    value: item.vehicleClass,
                  }))}
                />
                <CompareRow
                  label="Minecraft / Loader"
                  values={selected.map((item) => ({
                    id: item.id,
                    value: `${item.gameVersion} · ${item.modloader}`,
                  }))}
                />
                <CompareRow
                  label="Angezeigter Preis (Vorschau)"
                  values={selected.map((item) => ({
                    id: item.id,
                    value: `${item.priceDiamonds === undefined ? "Preis auf Anfrage" : `${item.priceDiamonds} 💎`} · ${item.availability}`,
                  }))}
                />
                <CompareRow
                  label="Bestellstatus"
                  values={selected.map((item) => ({
                    id: item.id,
                    value: item.orderEligible
                      ? "Serverfreigabe erforderlich"
                      : "Nicht bestellbar",
                  }))}
                />
              </tbody>
            </table>
          </div>
          <button
            className="filter-clear-link"
            type="button"
            onClick={() => updateIds(compareStorageKey, compareEventName, [])}
          >
            Vergleich leeren
          </button>
          <p className="auth-footnote">
            Verbindliche Preise und Verfügbarkeit werden beim Bestellen
            serverseitig aus dem freigegebenen Bestand geladen.
          </p>
        </>
      ) : (
        <p className="local-feature-empty">
          Wähle bis zu drei Modelle direkt in den Fahrzeugkarten.
        </p>
      )}
    </section>
  );
}

function CompareRow({
  label,
  values,
}: {
  label: string;
  values: Array<{ id: string; value: string }>;
}) {
  return (
    <tr>
      <th scope="row">{label}</th>
      {values.map((entry) => (
        <td key={`${label}-${entry.id}`}>{entry.value}</td>
      ))}
    </tr>
  );
}

export function RecentlyViewedTracker({ vehicleId }: { vehicleId: string }) {
  useEffect(() => {
    const current = readIds(recentStorageKey, 6);
    updateIds(
      recentStorageKey,
      recentEventName,
      addRecentlyViewedVehicle(current, vehicleId),
    );
  }, [vehicleId]);
  return null;
}

export function RecentlyViewedList({
  vehicles,
}: {
  vehicles: LocalVehicleSummary[];
}) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = (event?: Event) => {
      const detail = (event as CustomEvent<string[]> | undefined)?.detail;
      setIds(
        Array.isArray(detail)
          ? detail.slice(0, 6)
          : readIds(recentStorageKey, 6),
      );
    };
    sync();
    window.addEventListener(recentEventName, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(recentEventName, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const recent = ids.flatMap((id) => {
    const vehicle = vehicles.find((entry) => entry.id === id);
    return vehicle ? [vehicle] : [];
  });
  if (!recent.length) return null;

  return (
    <section
      className="local-feature-panel recently-viewed"
      aria-labelledby="recent-heading"
    >
      <div className="local-feature-heading">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Nur auf diesem Gerät
          </span>
          <h2 id="recent-heading">Zuletzt angesehen</h2>
        </div>
      </div>
      <ul className="recent-vehicle-list">
        {recent.map((vehicle) => (
          <li key={vehicle.id}>
            <Link href={`/fahrzeuge/${vehicle.id}`}>
              <strong>{vehicle.name}</strong>
              <span>
                {vehicle.manufacturer || vehicle.packName} ·{" "}
                {vehicle.vehicleClass}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
