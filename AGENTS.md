# SKYFALL MOTORS — Arbeitsregeln

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Ziel und Produktgrenzen

SKYFALL MOTORS ist ein digitales Autohaus für einen Minecraft-Survival-Multiplayer-Server (Java 1.21.1, NeoForge). Die Plattform soll Fahrzeugkatalog, Bestellungen, Diamantenzahlungen, Kundenkonten, Garage, Werkstatt, Gebrauchtwagen und Motorsport schrittweise unterstützen.

- Liefere zuerst sichere, nachvollziehbare Kernabläufe.
- Erhalte vorhandene Arbeit und prüfe vor Änderungen den Arbeitsbaum.
- Erfinde keine Fahrzeuge, Pack-Inhalte, Mod-Funktionen, Bilder, Preise, Bewertungen oder Ergebnisse.
- Fahrzeugpreise aus der Produktspezifikation sind editierbare SKYFALL-Verkaufspreise, keine Craftingkosten.
- Ungeprüfte Fahrzeuge bleiben als Entwurf gekennzeichnet und können nicht bestellt werden.
- Nutze keine echten Mod-Screenshots ohne geklärte Quelle und Nutzungsrechte. Fehlt ein Ingame-Bild, zeige „Bild folgt“.
- Keine kostenpflichtigen Dienste, produktiven Deployments oder destruktiven Git-Aktionen ohne Freigabe.

## Architektur

- Next.js App Router, TypeScript im Strict-Modus, Tailwind CSS.
- Firebase Authentication/Firestore/Storage sind die Zielplattform. Serverzugriffe laufen über vertrauenswürdige Servermodule; privilegierte Admin-Zugangsdaten gehören nie in den Browser.
- Minecraft-Name/Passwort benötigt eine eigene serverseitige Authentifizierung. Keine Pseudo-E-Mail-Adressen. Bis sichere Infrastruktur konfiguriert und verifiziert ist, muss Authentifizierung geschlossen fehlschlagen.
- Datenzugriff, Preisberechnung, Bestand, Rollen und Zahlungsstatus werden serverseitig autorisiert und validiert.
- Schnittstellen für manuelle Identitätsverifizierung, Diamantenzahlung und Rennzeitmessung bleiben von späteren Minecraft-Server-Adaptern getrennt.
- Fehlen externe Zugangsdaten, dokumentiere den Blocker und bearbeite unabhängige Aufgaben; keine Fake-Daten als Live-Ergebnisse ausgeben.

## Sicherheit und Datenintegrität

- Preise, Rollen, Eigentum, Bestand, Reservierungen und Zahlungsstatus niemals clientseitig autorisieren.
- Kritische Änderungen müssen transaktional, idempotent und auditierbar sein.
- Jede Rolle wird serverseitig geprüft; ein versteckter Button ist keine Zugriffskontrolle.
- Eingaben an Servergrenzen mit Zod oder gleichwertiger Schema-Validierung prüfen.
- Sichere Sessions, CSRF-Schutz, Rate-Limits, Upload-Prüfungen und Least Privilege vor Aktivierung echter Geschäftsabläufe umsetzen.
- Firestore Admin SDK umgeht Firestore Security Rules; daher müssen Serveraktionen selbst jede Berechtigung durchsetzen.
- Keine Secrets in Quellcode, Logs, Beispieldateien oder Client-Bundles.

## Frontend

Vor größeren UI-Änderungen lesen:

- `docs/frontend/DESIGN.md`
- `docs/frontend/FRONTEND_CONTRACT.md`

Die Produktsprache der Website ist Deutsch. Öffentliches Design: Modern Minimal, hell, hochwertig und mobil bedienbar. Nutzertexte zeigen klare Zustände, nächste Schritte und Wiederherstellungsmöglichkeiten; technische Details bleiben sekundär.

## Daten- und Dokumentationskonventionen

- IDs sind stabil und enthalten bei Fahrzeugen mindestens Pack, Modell und Variante.
- Fahrzeugstatus, Verfügbarkeit, Preisfreigabe und Bildfreigabe sind getrennte Felder.
- Kandidaten aus einer Wunschliste sind keine bestätigten Pack-Inhalte.
- Quellen, Versionen, Loader, Abhängigkeiten, Survival-Herstellbarkeit und Prüftag an Fahrzeug-/Pack-Fakten dokumentieren.
- Entwicklungsplan und aktueller Stand stehen in `PLAN.md`, `PROGRESS.md`, `NIGHTLY_LOG.md` und `MORNING_REPORT.md`.

## Befehle und Git

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run bootstrap:owner -- --confirm-offline-identity` (nur nach manuellem Identitätscheck und in geschützter Umgebung)
- `git diff --check`

Vor einem Commit: Änderungen und Testausgaben prüfen. Keine fremden Änderungen übernehmen oder committen. Keine History umschreiben.

Ein GitHub-Push ist optional und nur zulässig, wenn vorher die angemeldete GitHub-Identität nachweislich `tylerneuhaus2000tech` ist. Bei abweichender/fehlender Identität nicht pushen. Keine Credentials anlegen oder wechseln.

## Definition of Done

Eine Phase gilt erst als abgeschlossen, wenn ihre Akzeptanzkriterien erfüllt, relevante Fehler behoben, Ergebnisse tatsächlich geprüft und Dokumentation aktualisiert wurden. Quelle, automatischer Test, lokale Laufzeit und produktiver Betrieb sind getrennte Nachweise. Ungeprüfte oder blockierte Punkte klar benennen.
