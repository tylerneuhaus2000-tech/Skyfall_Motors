import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getFirebaseServices, isFirebaseReady } from "@/lib/firebase-admin";
import { deriveDriverProfileStats } from "@/lib/side-feature-domain";
import {
  listPublicLapEntries,
  type PublicLapEntryView,
} from "@/lib/side-feature-store";
import { minecraftUsernameSchema } from "@/lib/validation";

type DriverPageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({
  params,
}: DriverPageProps): Promise<Metadata> {
  const { username } = await params;
  const result = minecraftUsernameSchema.safeParse(username);
  return {
    title: result.success ? `Fahrerprofil ${result.data}` : "Fahrerprofil",
  };
}

export default function DriverProfilePage({ params }: DriverPageProps) {
  return (
    <main id="main-content">
      <Suspense
        fallback={
          <section className="page-container page-content">
            <div className="account-card" role="status">
              Fahrerprofil wird geladen …
            </div>
          </section>
        }
      >
        <DriverProfileContent params={params} />
      </Suspense>
    </main>
  );
}

async function DriverProfileContent({ params }: DriverPageProps) {
  await connection();
  const { username } = await params;
  const parsedUsername = minecraftUsernameSchema.safeParse(username);
  if (!parsedUsername.success) notFound();

  const services = isFirebaseReady() ? getFirebaseServices() : null;
  if (!services) {
    return (
      <section className="page-container page-content">
        <div className="account-card" role="status">
          Fahrerprofile sind derzeit nicht erreichbar.
        </div>
      </section>
    );
  }

  let entries: PublicLapEntryView[];
  try {
    entries = (await listPublicLapEntries(services.db)).filter(
      (entry) =>
        entry.minecraftUsername.toLocaleLowerCase("en") ===
        parsedUsername.data.toLocaleLowerCase("en"),
    );
  } catch {
    return (
      <section className="page-container page-content">
        <div className="account-card" role="alert">
          Das Fahrerprofil konnte nicht geladen werden. Bitte versuche es später
          erneut.
        </div>
      </section>
    );
  }
  if (entries.length === 0) notFound();

  const stats = deriveDriverProfileStats(
    entries.map((entry) => ({
      trackName: entry.trackName,
      vehicleName: entry.vehicleName,
      timeMs: entry.timeMs,
    })),
  );

  return (
    <>
      <section className="page-hero">
        <div className="page-container page-heading">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Fahrerprofil
          </span>
          <h1>{parsedUsername.data}</h1>
          <p>
            Statistiken aus manuell eingereichten und administrativ
            freigegebenen Rundenzeiten. Es gibt keine automatische
            Minecraft-Zeitmessung.
          </p>
        </div>
      </section>
      <section className="page-container page-content driver-profile-content">
        <dl className="driver-profile-stats">
          <div>
            <dt>Freigegebene Zeiten</dt>
            <dd>{stats.approvedLapCount}</dd>
          </div>
          <div>
            <dt>Strecken</dt>
            <dd>{stats.trackCount}</dd>
          </div>
          <div>
            <dt>Fahrzeuge</dt>
            <dd>{stats.vehicleCount}</dd>
          </div>
        </dl>
        <section className="account-card">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Persönliche Bestzeiten
              </span>
              <h2>Bestzeit je Strecke</h2>
            </div>
          </div>
          <div className="driver-best-times">
            {stats.personalBests.map((entry) => (
              <article key={entry.trackName}>
                <div>
                  <h3>{entry.trackName}</h3>
                  <p>{entry.vehicleName}</p>
                </div>
                <strong>{(entry.timeMs / 1000).toFixed(3)} s</strong>
              </article>
            ))}
          </div>
          <p className="admin-help">
            Grundlage sind die aktuell öffentlich geladenen
            Bestenlisten-Einträge; Rennanmeldungen und vollständige
            Eventhistorien werden noch nicht erfasst.
          </p>
          <Link className="text-link" href="/race-center">
            Zur Bestenliste
          </Link>
        </section>
      </section>
    </>
  );
}
