import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { LapSubmissionForm } from "@/components/side-feature-forms";
import { getCurrentAccount } from "@/lib/account";
import { vehicles } from "@/lib/catalog";
import { getFirebaseServices } from "@/lib/firebase-admin";
import {
  listPublicLapEntries,
  type PublicLapEntryView,
} from "@/lib/side-feature-store";

export const metadata: Metadata = { title: "Race Center" };

export default function RaceCenterPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-container page-heading">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Race Center
          </span>
          <h1>Rennen. Zeiten. Ergebnisse.</h1>
          <p>
            Rundenzeiten werden manuell eingetragen und erst nach Adminprüfung
            veröffentlicht. Eine automatische Minecraft-Zeitmessung gibt es
            nicht.
          </p>
        </div>
      </section>
      <Suspense
        fallback={
          <section className="page-container page-content">
            <div className="account-card" role="status">
              Bestenliste und Anmeldeoption werden geladen …
            </div>
          </section>
        }
      >
        <RaceCenterContent />
      </Suspense>
    </main>
  );
}

async function RaceCenterContent() {
  await connection();
  const account = await getCurrentAccount();
  const services = getFirebaseServices();
  let entries: PublicLapEntryView[] = [];
  let loadError = false;
  if (services) {
    try {
      entries = await listPublicLapEntries(services.db);
    } catch {
      loadError = true;
    }
  }
  const groupedEntries = Array.from(
    entries.reduce((groups, entry) => {
      const group = groups.get(entry.trackName) ?? [];
      group.push(entry);
      groups.set(entry.trackName, group);
      return groups;
    }, new Map<string, PublicLapEntryView[]>()),
  );
  const vehicleOptions = vehicles.map((vehicle) => ({
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
  }));

  return (
    <section className="page-container page-content race-center-layout">
      <section className="account-card">
        <div className="account-card-heading">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Verifizierte Einträge
            </span>
            <h2>Rennstrecken-Bestenliste</h2>
          </div>
          <span className="admin-count">{entries.length} freigegeben</span>
        </div>
        {loadError ? (
          <p className="form-message form-message-error" role="alert">
            Die Bestenliste ist gerade nicht erreichbar. Es werden keine
            Beispieldaten angezeigt.
          </p>
        ) : groupedEntries.length ? (
          <div className="race-track-list">
            {groupedEntries.map(([track, trackEntries]) => (
              <section className="race-track-table" key={track}>
                <h3>{track}</h3>
                <div className="compare-table-wrap">
                  <table className="compare-table leaderboard-table">
                    <thead>
                      <tr>
                        <th scope="col">Platz</th>
                        <th scope="col">Fahrer</th>
                        <th scope="col">Fahrzeug</th>
                        <th scope="col">Zeit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trackEntries.map((entry, index) => (
                        <tr key={entry.id}>
                          <th scope="row">{index + 1}</th>
                          <td>
                            <Link
                              href={`/fahrer/${encodeURIComponent(entry.minecraftUsername)}`}
                              className="driver-profile-link"
                            >
                              {entry.minecraftUsername}
                            </Link>
                          </td>
                          <td>{entry.vehicleName}</td>
                          <td>{(entry.timeMs / 1000).toFixed(3)} s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="empty-state">Noch keine freigegebenen Rundenzeiten.</p>
        )}
      </section>
      <section className="account-card">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> Manuelle Einreichung
        </span>
        <h2>Deine Zeit eintragen</h2>
        <p className="admin-help">
          Trage eine selbst gemessene Zeit und den tatsächlichen Streckennamen
          ein. Veröffentlichung erst nach Prüfung.
        </p>
        <LapSubmissionForm
          vehicles={vehicleOptions}
          signedIn={Boolean(account)}
        />
      </section>
    </section>
  );
}
