# Entwicklungsplan

Stand: 18.10.2026

## Leitlinie

Funktionalität → Datenintegrität → Sicherheit → UX → Polish. Quellenprüfung, automatisierte Prüfungen, lokale Laufzeit und produktiver Betrieb werden getrennt dokumentiert. Externe Dienste bleiben geschlossen, solange Projekt, Zugang und echte Laufzeitprüfung fehlen.

## Phase 0 — Vorbereitung — abgeschlossen

- [x] Master-Spezifikation und leeren Projektordner geprüft.
- [x] Produktgrenzen, Sicherheitsanforderungen und Stack in `AGENTS.md` festgehalten.
- [x] Plan, Fortschritt, Arbeitslog und Frontend-Regeln angelegt.
- [x] Quellenprüfung für passende Immersive-Vehicles-Packs begonnen.

## Phase 1 — Fundament und öffentlicher Katalog — umgesetzt, visuelle QA geprüft

- [x] Next.js App Router, TypeScript strict, Tailwind CSS, Lint und Typecheck eingerichtet.
- [x] Modern-Minimal-Designsystem, responsive Navigation und öffentliche Seiten implementiert.
- [x] 229 Fahrzeugdefinitionen aus offiziellen 1.21.1/NeoForge-Archiven mit Quellen-, Datei-, Klassen-, Varianten- und Rezeptstatus erfasst.
- [x] 182 explizite Wunschlistenmodelle und 31 inkompatible R.A.G.E V2.3 Einträge getrennt geführt; alle Kandidaten nicht bestellbar.
- [x] Katalogsuche, Content-Pack-/Klassen-/Statusfilter, Preis-/Namenssortierung, Seitennavigation und Detailseiten implementiert.
- [x] Verfügbarkeit bleibt an Zielserver-Bestätigung, Mitarbeiterfreigabe und verfügbaren Bestand gekoppelt.
- [x] Keine Packbilder übernommen; Bildrechte und Quellenstatus in `docs/research/vehicle-images.md` dokumentiert.
- [x] Kritische Preis- und Provisionsregeln mit Vitest abgedeckt.
- [x] Desktop-/Mobilbrowser bei 1440 px und 390 px geprüft; Suche, Klassen-/Statusfilter und Seitennavigation reagieren, kein horizontaler Mobilüberlauf.
- [ ] Accessibility-Audit und vollständige manuelle Tastaturprüfung.
- [ ] Tatsächliche Server-Pack-Dateien, Rezepte und Bilder einzeln prüfen; erst danach Bestellungen öffnen.
- [x] Lokale Firebase-Admin-Konfiguration, private Zugangsdaten außerhalb des Repositories und deny-all-Regeln angebunden; Cloud-Regeln in dieser Katalogphase nicht verändert.

## Phase 2 — Verkauf und Kundenkonto — umgesetzt und lokal/gegen Firebase geprüft

- [x] Minecraft-Name/Passwort-Registrierung ohne E-Mail, serverseitiges scrypt-Hashing, Custom Token und HttpOnly-Session-Cookie.
- [x] Anmeldung, Abmeldung, Profil-/Bestellübersicht, manuelle Identitätsprüfung und einmalige Inhaberfreigabe.
- [x] Serverseitige Preisberechnung, Übergabeoptionen, Bestellnummer, Idempotenz, eindeutige offene Kunden-Fahrzeug-Reservierung und transaktionale Bestandsreservierung.
- [x] Geschützter Inhaberbereich für Bestellungen, Zahlungen, Status, Übergabe, Kund:innen, Preisänderungen und Fahrzeugfreigabe/Bestand.
- [x] Serverseitige Bestellpreise stammen aus freigegebenem Firestore-Inventar; Audit-Log hält Admin-Preisänderungen fest.
- [x] Firestore-Regeln deny-all für Browserzugriff; private Serverrouten prüfen Nutzer, Rolle, Eingaben und Statusübergänge.
- [x] Firebase-Auth/Firestore-Lesbarkeit, Custom-Token-Signierung und Auth-/Bestell-/Admin-Testabläufe wurden in vorherigen Phasen geprüft; Emulator-Regeln bestanden 30/30.
- [ ] Sicheren Recovery-Ablauf ohne E-Mail entwerfen und implementieren.

## Phase 3 — Kundenportal und Services — teilweise umgesetzt

- [x] Lieferstatus im Kundenkonto, digitaler Fahrzeugpass nur nach bestätigter Übergabe und Sammler-Abzeichen aus echten Bestelldaten.
- [x] Persönliche serverseitige Wunschliste für angemeldete Kunden.
- [x] Kundenbewertungen nur für übergebene Fahrzeuge; Veröffentlichung nach Adminmoderation.
- [x] Testfahrt-Anfragen mit manueller Adminfreigabe; keine automatische Terminbuchung.
- [ ] Vollständige Garage und Werkstattabläufe.
- [ ] Gebrauchtwagen-Ankauf/Marktplatz mit serverseitig aufgerundeter 10-%-Provision.
- [ ] Mietwagen mit Doppelbuchungsschutz.

## Phase 4 — Motorsport und Mitarbeiterbereich — teilweise umgesetzt

- [x] Manuelle Rundenzeiteingabe mit Adminfreigabe und öffentlicher Rangliste nur für freigegebene Zeiten.
- [x] Moderationsaktionen verwenden den bestehenden serverseitig geschützten Mitarbeiterbereich und Audit-Log.
- [ ] Verifizierte Streckeninformationen, Veranstaltungen und Anmeldungen.
- [ ] Fein abgestufte Mitarbeiterrollen für Verkäufer, Mechaniker und Rennleiter.
- [x] Fahrzeug-/Bestell-Adminbereich samt Moderationsabschnitten.

## Phase 5 — Qualität und Vorbereitung — teilweise abgeschlossen

- [x] Tests für Geschäftsregeln, Quellenumfang, Kandidatenstatus und Preisvalidierung.
- [x] Tests für Bestellpreise, Bestandsregeln, Übergänge, Eingaben und Passwort-Hashing.
- [x] Domänen- und Schema-Tests für Vergleichslimit, Verlauf, Liefertracker, Übergabepässe, Abzeichen, Testfahrtstatus, manuelle Rundenzeiten, Wunschliste und Bewertungen.
- [x] Lint, Typecheck, Dependency-Audit und Production Build.
- [x] Firebase-Emulator-Regeln und Kauf-/Rollen-E2E in vorherigen Phasen geprüft; aktueller Testsuite-Lauf besteht mit 63 Tests, 30 Emulatorfälle werden ohne laufenden Emulator übersprungen.
- [ ] Accessibility-Audit und vollständige manuelle Tastaturprüfung.
- [ ] Deployment-Vorbereitung; produktives Deployment nur mit Freigabe.

## Externe Voraussetzungen

- Firebase-Projekt, Zugriff und bestätigte Kosten-/Nutzungsentscheidung.
- Verifizierter Minecraft-Identitätsweg, optional Minecraft-Server-Plugin und Zahlungs-/Timing-Adapter.
- Tatsächliche Server-Modpack-Version, exakte Fahrzeugdateien, Rezepte, Bestand und Freigabe der Verkaufspreise.
- Nutzungsrechte für echte Ingame-Bilder.
- Für einen späteren GitHub-Push muss die aktive GitHub-Identität nachweislich `tylerneuhaus2000tech` sein.
