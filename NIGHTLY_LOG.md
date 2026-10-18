# Entwicklungslog

## 18.10.2026

- Projektordner und Git-Status geprüft: leer, kein Repository, kein Remote.
- Angefügte Master-Spezifikation gelesen.
- UI/UX-Projekterfassung und Frontend-Governance angewandt.
- Offizielle Next.js-/Firebase-Dokumentation zu App Router, benutzerdefinierten Tokens, Session-Cookies und Firestore-Regeln konsultiert.
- GitHub-Identität bleibt eine Push-Schranke: nur `tylerneuhaus2000tech`; es wurde kein Push ausgeführt.
- App-Grundgerüst wird initialisiert. Erster CLI-Versuch lehnte den Ordnernamen mit Großbuchstaben ab; gültiger Projektname wird im Unterordner erzeugt und anschließend an die Repo-Wurzel verschoben.
- Öffentliches Frontend mit responsiver Navigation, Katalogsuche/-filterung und Fahrzeugdetailseiten erstellt; ungeprüfte Kandidaten bleiben nicht bestellbar.
- Offizielle Mod-Pack-Dateien und Beschreibungen für IV/OCP/OAmP sowie ausgewählte weitere Kandidaten dokumentiert. Die tatsächliche Serverinstallation und Nutzungsrechte an Bildern bleiben ungeprüft.
- ESLint-Abhängigkeitskette meldete fünf High-Schwachstellen; auf Biome als Linter/Formatter gewechselt und `npm audit` danach mit null Schwachstellen abgeschlossen.
- Geschäftsregeln und Katalogstruktur: `npm test` bestanden, 12/12 Tests.
- `npm run lint`, `npm run typecheck` und `npm run build` bestanden; Produktionsbuild erzeugte statische/partiell-prerenderte Routen.
- Produktionsserver auf Port 3100 gestartet: Startseite, alle implementierten öffentlichen Routen und Fahrzeugdetailseite mit HTTP 200; unbekannter Pfad mit 404.
- Projektdokumentation und Morgenbericht aktualisiert. Keine Git-Commits oder Pushes: kein Repository/Remote vorhanden und globale Git-Autor-Konfiguration stimmt nicht mit dem gewünschten Kontonamen überein.

## Phase 2 — 18.10.2026

- Auth-/Bestell-/Admin-Struktur gemäß Projektregeln ergänzt. Firebase-Konfiguration bleibt leer; keine echte Anmeldung oder Cloud-Bestellung vorgetäuscht.
- Custom-Auth mit Minecraft-Namen, scrypt-Hash/Salt, Custom Token, kurzlebigem HttpOnly-Session-Cookie, Same-Origin-Schutz und serverseitigen Firestore-Rate-Limits vorbereitet.
- Bestellablauf mit Liefer-/Expresspreisen, Zahlungsart, eindeutiger Bestellnummer, Idempotenz und atomarer Lagerreservierung ergänzt.
- Adminaktionen für manuelle Identitätsprüfung, Freigabe/Bestand, Zahlungsbestätigung, Status, Übergabe und zulässige Stornierung implementiert.
- Default-Admin ausgeschlossen; sichere einmalige Erstfreigabe mit manueller Identitätsprüfung als lokales Skript dokumentiert.
- Firestore Browserzugriff mit deny-all-Regeln geschlossen; Firebase-Setup und Kosten-/Credential-Voraussetzungen dokumentiert.
- Relevante Tests für Preis, Bestand, Eingaben, Status, Passwort-Hashing und Rücksprungpfade ergänzt.
- Abschluss nach Phase 2: `npm test` bestanden (36/36 in 5 Dateien), `npm run lint`, `npm run typecheck` und `npm run build` bestanden; `npm audit` meldet null Schwachstellen.
- Firebase-Auth, Firestore, lokale Custom-Token-Signierung und Auth-/Bestell-/Admin-E2E wurden später erfolgreich geprüft; Firestore-Regeln bestanden 30/30 Emulatorfälle und wurden für `skyfall-motors` veröffentlicht. Kein Git-Repository/Remote; kein Commit und kein Push.

## Katalogausbau — 18.10.2026

- Offizielle Archive für 1.21.1/NeoForge read-only ausgewertet: 229 Fahrzeugdefinitionen aus sechs Fahrzeugpacks; Basis-IV ohne Fahrzeugdatensätze.
- 182 Wunschlisten-Modelle und 31 alte R.A.G.E V2.3 Modelle getrennt geführt; letztere ausdrücklich 1.20.1/Forge-inkompatibel.
- Kandidaten, Creative-only-Inhalte, fehlende Rezeptnachweise, SVMP-Servererlaubnis, Preisvorschläge und Bildrechte bleiben sichtbar gesperrt.
- Katalog mit Pack-/Klassen-/Statusfiltern, Seitennavigation und Belegstatus ausgebaut. Admin-Preisänderung serverseitig validiert/auditiert und von Bestellpreisberechnung übernommen.
- Bestellfreigabe benötigt Zielserver-Installationstest, Adminfreigabe und Bestand; keine Cloud-Daten oder Firestore-Regeln geändert.
- Keine Bilder importiert; Bildrechtsprüfung in `docs/research/vehicle-images.md` dokumentiert.
- `npm run lint`, `npm run typecheck`, `npm test` (55 passed/30 skipped) und `npm run build` bestanden. Chrome-Prüfung bei Desktop-/Mobilbreite: Filter und Pagination bedienbar, kein horizontaler Mobilüberlauf.

## Nebenfeatures — 18.10.2026

- Vergleich bis drei Modelle, persönliche Wunschliste, zuletzt angesehen, Bestellstatus-Tracker, Übergabepässe, Sammler-Abzeichen und Live-Preisaufschlüsselung ergänzt.
- Testfahrt-Anfragen, manuelle Rundenzeiteneinreichung und echte Fahrzeugbewertungen mit serverseitigen Mitarbeiterfreigaben ergänzt.
- Bestehende Auth- und Admin-SDK-Berechtigungen genutzt; öffentliche Listen filtern auf freigegebene Datensätze. Keine Firestore-Regeln verändert oder deployt.
- Keine echten Bestellungen, Besitznachweise, Rundenzeiten oder Bewertungen erzeugt. Schreib-/Moderations-APIs ohne Session wiesen Änderungen mit HTTP 401 ab.
- `npm run lint`, `npm run typecheck`, `npm test` (63 bestanden/30 Emulatorfälle übersprungen) und `npm run build` bestanden. Lokaler HTTP-Smoke-Test für Kernseiten bestanden.
- Visuelle Chrome-Prüfung von Startseite, Katalog, Fahrzeugdetail, Kundenbereich und Race Center bei 1440 px und 390 px bestanden; alle Ansichten ohne horizontalen Überlauf. Authentifizierte Firebase-E2E-Prüfung bleibt offen.
