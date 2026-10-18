# SKYFALL MOTORS — Morgenbericht

Stand: 18.10.2026

## Admin Finishing Features

- **Betriebsmodus:** Owner kann Geöffnet, Eingeschränkt, Geschlossen oder Wartung setzen. Neue Bestellungen werden serverseitig innerhalb der Reservierungstransaktion geprüft; bestehende Aufträge bleiben bearbeitbar. Nur Owner kann Gebühren ändern.
- **Audit und Aufgaben:** Live-Aktivitäten kommen per Firestore-Listener/SSE ohne Dauer-Polling. Kritische Änderungen protokollieren Akteur, Zeit und Aktion. Tagesaufgaben zählen reale offene Bestellungen, Zahlungen und Anfragen.
- **Exporte:** Geschützte CSV-Exporte für Bestellungen, bezahlte und tatsächlich übergebene Umsätze sowie Fahrzeugbestände; Tabellenformeln werden entschärft, nicht erfasste Lagerdaten als solche markiert.
- **Kundenservice und Inhalte:** Kunden können Anfragen samt Status und Teamantwort verfolgen; interne Notizen bleiben Admins vorbehalten. Owner kann öffentliche Startseiten-Ankündigungen anlegen, bearbeiten und veröffentlichen.
- **Kaufbelege:** Kunden erhalten Druck-/PDF-Belege nur für bezahlte Bestellungen mit bestätigter Übergabe. Sie sind ausdrücklich keine steuerlichen Rechnungen.
- **Prüfung:** `npm run lint`, `npm run typecheck`, `npm test` (82 bestanden; 30 Emulatorfälle übersprungen) und `npm run build` bestanden. Unauthentifizierte API-Proben für Anfragen, Audit, Exporte und Ankündigungen wurden mit HTTP 401 abgewiesen. Startseite, Kundenbereich und Admin-Zugriffssperre bei 1440/390 px ohne horizontalen Überlauf geprüft.
- **Offen:** Kein angemeldeter Owner-Browserlauf und keine authentifizierten Firebase-Schreibtests; dafür wurde keine Sitzung übernommen und es wurden keine Testdaten erstellt. Ankündigungen erscheinen erst, wenn der Owner echte Inhalte veröffentlicht. Keine Regeln geändert/deployed, keine Cloud-Daten geschrieben, kein Push.

## Admin Command Center

- Responsive Command Center, echte Bestell-KPIs und Owner-only Umsatzdiagramm/Bestverkauf/Auditübersicht.
- Auftragsaktionen und Bestandspflege nutzen die bestehenden serverseitigen Preis-, Zahlungs- und Reservierungsprüfungen; Fahrzeuge lassen sich durchsuchen und Bestellfreigaben für bis zu 50 Modelle pausieren.
- Kundenidentität, Bestellhistorie und tatsächlich übergebene Fahrzeuge sind einsehbar. Owner-only Rollenverwaltung für Salesperson, Mechanic und Race Director; alte Staff-Konten ohne gültige Rolle bleiben gesperrt.
- Owner kann ein freigegebenes Katalogmodell als Tageshighlight setzen. Bestehende Moderation für Werkstatt, Testfahrten, Rundenzeiten, Bewertungen und Wartelisten ist rollenbeschränkt.
- Offen: Fahrzeug-Neuanlage/Metadaten-/Bildverwaltung, Kontosperren und Adminnotizen, Rabatte/News/Car-Meets, vollständige Termin-/Angebotsverwaltung und Race-Eventverwaltung.
- Prüfung: Lint, Typecheck, Produktionsbuild und 74 Tests bestanden; 30 Emulatorfälle übersprungen. Vier unauthentifizierte Admin-POSTs gaben HTTP 401 zurück. Isolierte Browserprüfung bei 1440/390 px ohne Überlauf; authentifizierte Owner-Ansicht nicht visuell geprüft, da keine Sitzung verwendet wurde.
- Keine Firestore-Regeln oder -Dokumente geändert, kein Cloud-Deployment und kein Push.

## Ergebnis

Die vorhandene Firebase-/Auth-, Bestell- und Admin-Architektur wurde um die zehn angefragten Nebenfeatures ergänzt. Firestore-Regeln blieben unverändert; in diesem Lauf wurden keine Cloud-Dokumente angelegt oder geändert.

## Umgesetzt

- Fahrzeugvergleich bis drei Modelle, Wunschliste pro Kundenkonto und zuletzt angesehene Modelle.
- Liefertracker aus echten Bestellstatus, digitale Fahrzeugpässe nur nach bestätigter Übergabe und Sammler-Abzeichen aus tatsächlichen Übergaben.
- Testfahrt-Anfragen mit manueller Mitarbeiterfreigabe.
- Manuelle Rundenzeiteinreichung mit Adminmoderation; keine automatische Minecraft-Zeitmessung.
- Kundenbewertungen nur nach bestätigter Übergabe und erst nach Moderation öffentlich.
- Live-Diamantenvorschau mit Preisaufschlüsselung; der Server berechnet und bestätigt weiter den verbindlichen Bestellpreis.
- Adminbereich um geschützte Moderation für Testfahrten, Zeiten und Bewertungen ergänzt.
- Fünf frei lizenzierte Realfahrzeug-Referenzfotos sind mit Credits eingebunden; sie werden nicht als Ingame-Bilder ausgegeben. Details: [Bildquellen und Rechteprüfung](./docs/research/vehicle-images.md).

## Prüfung

- `npm run lint`, `npm run typecheck`, `npm test` (63 bestanden; 30 Emulatorfälle übersprungen) und `npm run build` bestanden.
- Lokaler HTTP-Smoke-Test der Startseite, des Katalogs, einer Fahrzeugdetailseite, des Kundenbereichs, Race Center, Adminbereichs und Bestellseite: alle antworteten mit HTTP 200.
- Nicht angemeldete Schreib-/Moderationsaufrufe wurden mit HTTP 401 abgewiesen. Die Anzeige öffentlicher Daten blieb auf freigegebene Einträge begrenzt.
- Startseite, Katalog, Fahrzeugdetail, Kundenbereich und Race Center in Chrome bei 1440 px und 390 px geprüft; alle zehn Ansichten ohne horizontalen Überlauf. Screenshots: `/tmp/skyfall-*-{desktop,mobile}-verified.png`.
- Keine Testbestellungen, Fahrzeugbesitze, Rundenzeiten oder Bewertungen in Firebase erzeugt. Kein Deployment, keine Regeländerung und kein GitHub-Push.

## Offen

- Authentifizierte Firebase-E2E-Tests der neuen Schreib- und Moderationsabläufe.
- Reale Streckeninformationen und manuelles Prüfverfahren für eingereichte Zeiten.
- Fahrzeuge bleiben bis zur bestätigten Zielserverinstallation, Preisfreigabe und Bestandseintragung nicht bestellbar.
- Ingame-Fahrzeugbilder mit geklärten Rechten, Accessibility-Audit, Werkstatt- und Mietwagenabläufe.

## Premium-Sortiment / Shop-Überarbeitung (18.10.2026)

16 offizielle Fahrzeugpreise sind jetzt serverseitig fest und öffentlich korrekt dargestellt. Andere Fahrzeuge zeigen nur „Preis auf Anfrage“; Anfragen gehen durch die bestehende geschützte Inbox, Angebote können Kunden ausdrücklich annehmen/ablehnen und werden bei Annahme zusammen mit der normalen Bestandsreservierung atomar geprüft. 16 lokale lizenzierte WebP-Referenzbilder inklusive Credits dokumentiert. 35 Firestore-Emulatorfälle testen Preisgrenzen, Angebotserstellung/-berechtigung, Bestand und fremde Angebote; keine Live-Daten oder Firebase-Regeln geändert. Echte Auth-Browser-E2E und tatsächliche Serverbestätigung bleiben offen; solange keine reale Freigabe/Bestand existiert, bleiben Käufe geschlossen.
