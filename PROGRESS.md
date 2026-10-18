# Fortschritt

Stand: 18.10.2026

## Status

**Aktuelle Phase:** Phase 2 abgeschlossen; Nebenfeatures sind schrittweise ergänzt. In diesem Arbeitsschritt wurden keine Firestore-Regeln deployt und keine Cloud-Dokumente geändert. Das Fahrzeuglager ist weiterhin nicht freigegeben.

## Kritische Funktionsprüfung — 18.10.2026

- **Produktionsbestand read-only geprüft:** Firebase-Projekt `skyfall-motors` hat 0 Inventardokumente und damit 0 serverbestätigte, freigegebene Fahrzeuge mit Bestand. Es wurden keine Produktionsdokumente geändert.
- **Browser-E2E im isolierten Auth-/Firestore-Emulator:** Kundenregistrierung ohne E-Mail, Login, HttpOnly-Session, Bestellung, Bestellhistorie, Übergabe in die Garage, sichtbarer Kaufbeleg-Link und Logout funktionierten. Ein synthetisches Owner-Testkonto konnte den Identitäts-Prüfablauf (nur simuliert), manuelle Zahlung, Fertigungsstatus und Übergabe im Admin-Command-Center ausführen. Normale Kunden erhalten dort „Kein Zugriff“.
- **Preis-/Doppelbestellschutz im Emulator:** Eine Bestellung mit manipuliertem zusätzlichen Clientfeld `totalPrice: 1` wurde mit dem serverseitigen Preis von 17 💎 gespeichert. Derselbe Idempotenzschlüssel lieferte dieselbe Bestellnummer zurück (`reused: true`), statt einen weiteren Auftrag anzulegen.
- Testbestand, Testkonten, Emulator und Browserprofile wurden nach dem Test entfernt. Es gab keine Cloud-Deployments, Regeländerungen oder Produktionsschreibvorgänge.
- **Weiterhin blockierend:** Kein tatsächlicher SKYFALL-Serverbestand ist eingetragen. Die Katalogdefinitionen belegen Packdateien, aber keine Installation oder Funktion auf dem Minecraft-Server. Die Adminoberfläche bearbeitet vorhandene Katalogmodelle; neue Katalogmodelle lassen sich dort nicht anlegen. Ein Passwort-Wiederherstellungsablauf fehlt.

## Admin Command Center — Stand 18.10.2026

- **Fertig:** Premium-Adminlayout mit dunkler Navigation, responsiver Bereichsnavigation und echten Firestore-Kennzahlen. Umsätze/Bestverkauf beruhen nur auf bezahlten, protokolliert übergebenen Aufträgen; Auditübersicht ist Owner-only.
- **Fertig:** Aufträge durchsuchen/filtern und vorhandene serverseitige Zahlungs-, Status- und Übergabeaktionen nutzen. Fahrzeuge suchen/filtern, bestehende Preis-/Bestands-/Installationsfreigabe bearbeiten und bis zu 50 ausgewählte Angebote atomar pausieren.
- **Fertig:** Kunden suchen, Minecraft-Identität manuell prüfen, Bestellhistorie und Garage aus bestätigten Übergaben ansehen. Owner kann Identitäts-bestätigten Kunden Rollen zuweisen oder entziehen; Selbständerung und Änderung bestehender Owner-Konten sind serverseitig gesperrt.
- **Fertig, begrenzt:** Owner kann ein echtes, bestellberechtigtes Katalogmodell als heutiges Startseiten-Highlight setzen oder zur Tagesrotation zurückkehren.
- **Fertig, begrenzt:** Bestehende Werkstatt-, Testfahrt-, Rundenzeit-, Bewertungs- und Wartelisten-Moderation wird nach Rolle angezeigt und serverseitig geprüft.
- Rollen: Owner, Salesperson, Mechanic und Race Director. Legacy-Mitarbeiterkonten ohne gültige Rolle erhalten keinen Adminzugriff. Der bestehende Owner `TylerF1` wurde in diesem Arbeitsschritt nicht geändert.
- **Offen:** Katalogmodelle anlegen und beschreibende Felder, Bildquellen/-bilder oder Pack/Klasse bearbeiten; Kundenkonten sperren/reaktivieren und Adminnotizen; Promotionen, Rabatte, News und Car-Meets; Termin-/Fahrzeug-/Kostenverwaltung für Testfahrten; Werkstattangebote und Kundenfreigabe; Rennveranstaltungen, Anmeldungen und Ergebnisverwaltung. Dafür wurden keine funktionslosen Buttons ergänzt.
- **Frühere Prüfung:** Lint, Typecheck, Produktionsbuild und 74 Tests bestanden; 30 Firestore-Emulatorfälle mangels Emulator übersprungen. Unauthentifizierte Admin-POSTs für Aufträge, Bestand, Team und Moderation lieferten HTTP 401. Isolierter Chrome bei 1440 px und 390 px: geschützte Admin-Anmeldeseite ohne horizontalen Überlauf. **Ergänzt 18.10.2026:** Die authentifizierte Owner-Oberfläche wurde jetzt im lokalen Emulator-Browser durchgespielt; mobile Owner-Aktionen bleiben ungeprüft.
- In diesem Arbeitsschritt keine produktiven Firestore-Daten geändert, keine Regeln deployt, kein Deployment und kein Push.

Das Verzeichnis war anfangs leer und weder Git-Repository noch mit Remote verbunden. Eine lokal startbare Next.js-App enthält die öffentliche Website, einen quellengestützten Fahrzeugkatalog und die Auth-/Bestellabläufe. Firebase ist lokal konfiguriert; private Admin-Zugangsdaten liegen außerhalb des Repositories.

## Erledigt

- `AGENTS.md`, `PLAN.md`, dieses Dokument, `NIGHTLY_LOG.md`, `MORNING_REPORT.md`, Architektur- und Frontend-Dokumentation.
- Next.js App Router, TypeScript strict, Tailwind CSS, Biome, Vitest und Produktionsbuild.
- Responsive Website und öffentliche Seiten; der Fahrzeugkatalog bietet Suche, Pack-/Klassen-/Statusfilter, Preis-/Namenssortierung, Detailseiten und Seitennavigation.
- 229 eindeutige Fahrzeugdefinitionen aus offiziellen 1.21.1/NeoForge-Packarchiven mit Datei-, Modell-, Klassen- und Rezeptstatus erfasst. Das ist kein Nachweis der Installation auf dem SKYFALL-Server.
- 182 ausdrückliche Wunschlistenmodelle bleiben separat als nicht bestellbare Kandidaten erhalten; 31 Modelle aus R.A.G.E V2.3 sind wegen 1.20.1/Forge ausdrücklich inkompatibel gekennzeichnet.
- Überprüfbare Kandidaten und Packdateieinträge haben Statusseiten. GT CRAFT bleibt wegen Creative-only-Ausweisung, SVMP bis zu einer Autor-Erlaubnis gesperrt.
- Bestehende Fahrzeug-IDs und Wunschpreise bewahrt; andere Preise sind als Klassenvorschlag markiert und im geschützten Adminbereich änderbar.
- Bestellungen erfordern nun zusätzlich die Adminbestätigung, dass genau das Modell auf dem Zielserver installiert/getestet wurde; Preise werden aus dem Firestore-Lager serverseitig übernommen und im Auftrag festgehalten.
- Fünf frei lizenzierte Realfahrzeug-Referenzfotos sind lokal eingebunden und als Referenzen, nicht als Ingame-Bilder, markiert; Urheber- und Lizenzlinks stehen auf den Seiten und im [Rechteprotokoll](docs/research/vehicle-images.md). Mod-/Ingame-Bilder bleiben offen.
- Lokale Chrome-Prüfung bei 1440 px und 390 px: Katalogsuche (Scout), Klassenfilter, 31 inkompatible Einträge und Seitenwechsel reagieren; kein horizontaler Mobilüberlauf, Kandidatendetail ohne Bestelllink.
- Zustände verhindern, dass ein Katalogeintrag ungeprüft bestellbar erscheint.
- Mietpreis- und Marktplatzprovisionsregeln samt Tests.
- Abhängigkeits-Audit ohne gemeldete Schwachstellen.
- Registrierung/Login ohne E-Mail: serverseitiger scrypt-Hash, Firebase Custom Token, HttpOnly-Session-Cookie, Same-Origin-Prüfung und Firestore-Rate-Limits. Testregistrierung, Passwortlogin, Session-Erstellung und Logout wurden lokal gegen Firebase geprüft.
- Kundenprofil mit Identitätsstatus und Bestellhistorie; keine Passwörter im Browserprofil.
- Bestellübersicht mit serverseitig kalkulierten +12 💎 Lieferung / +8 💎 Express und manueller Zahlungsart.
- Bestelltransaktion mit eindeutiger Bestellnummer, Idempotenz, Kunden-Fahrzeug-Sperre und atomarer Bestandsreservierung.
- Inhaberbereich mit manuellem Minecraft-Identitätscheck, Fahrzeugfreigabe/Bestand, Zahlungsbestätigung, Fertigungsstatus, Übergabe und begrenztem Stornoablauf.
- Firestore-Regeln blockieren Browser-Reads/Writes; die exakt eingebundene Datei `firestore.rules` bestand 30/30 Emulator-Regeltests und wurde ausschließlich als Firestore-Regelwerk für `skyfall-motors` veröffentlicht. `FIRESTORE_RULES_CONFIRMED=true` ist lokal gesetzt.
- Inhaberaccount über den geschützten einmaligen Bootstrap eingerichtet; Minecraft-Identität manuell bestätigt und Audit-Eintrag geprüft. `OWNER_BOOTSTRAP_USERNAME` danach wieder geleert.
- API-E2E mit markiertem Testkunden und temporärem Bestand: Profil, Bestellhistorie, serverseitiger Preis (8 + 12 + 8 = 28 💎), Kunden-/Inhaberberechtigungen, Identitäts- und Zahlungsbestätigung sowie Fertigung bis Übergabe geprüft. Testdaten kontrolliert entfernt; keine Diamanten übertragen.
- E2E fand Firestore-ID/UUID-Validierungsfehler bei Admin-Bestellaktionen; Validierung angepasst und Regressionstest ergänzt.
- Nach Katalogausbau: `npm run lint`, `npm run typecheck`, `npm test` (55 bestanden; 30 Emulatorfälle übersprungen) und `npm run build` bestanden. Die zuvor separat ausgeführten Firestore-Regeltests bestanden 30/30.
- Einmaliger Bootstrap ohne Default-Admin-Login dokumentiert und als lokal auszuführendes Skript bereitgestellt; Node-26-Importkompatibilität geprüft.
- Abschlussprüfung nach Phase 2: 36/36 Tests, Lint, Typecheck, Produktionsbuild und `npm audit` ohne gemeldete Schwachstellen bestanden.

## Nebenfeatures — implementiert, lokale Prüfung bestanden

- Fahrzeugvergleich mit höchstens drei Modellen und Zuletzt-angesehen-Verlauf über lokale Browserdaten; keine Profil- oder Cloud-Synchronisierung.
- Persönliche Wunschliste liegt serverseitig pro Kundenkonto. Zugriff und Änderungen laufen über Session-geprüfte Admin-SDK-Routen; Browserzugriff auf Firestore bleibt gesperrt.
- Liefertracker zeigt ausschließlich den gespeicherten Auftragsstatus. Fahrzeugpässe, Sammler-Abzeichen und Bewertungsberechtigung werden nur aus bestätigten Übergaben abgeleitet.
- Testfahrt-Anfragen bleiben offen, bis Mitarbeitende sie manuell freigeben; es wird kein Termin automatisch gebucht.
- Kunden tragen Rundenzeiten und Streckennamen manuell ein. Nur von Mitarbeiter:innen freigegebene Zeiten erscheinen öffentlich; es gibt kein Minecraft-Tracking.
- Kundenbewertungen sind auf tatsächlich übergebene Fahrzeuge beschränkt und werden erst nach Adminfreigabe öffentlich angezeigt.
- Checkout zeigt eine live aktualisierte, unverbindliche Diamantenvorschau. Der gespeicherte Bestellpreis wird weiterhin serverseitig neu berechnet und zurückgegeben.
- Neue Admin-SDK-Zugriffe sind serverseitig an Kundenkonto bzw. Mitarbeiterrolle gebunden, validiert und für Änderungen auditiert. Firestore-Regeln blieben unangetastet.
- Neue Domänen-/Validierungstests ergänzen die Suite. `npm run lint`, `npm run typecheck`, `npm test` (63 bestanden; 30 Emulatorfälle übersprungen), `npm run build` und lokale HTTP-/Berechtigungsprüfungen bestanden.
- Lokale Requests auf Kunden-Schreib- und Admin-Moderationsrouten ohne Session wurden mit HTTP 401 abgewiesen. Keine Testbestellungen, Besitzdaten, Zeiten oder Bewertungen in Firebase angelegt.
- Chrome-Ansichten von Startseite, Katalog, Fahrzeugdetail, Kundenbereich und Race Center bei 1440 px und 390 px visuell geprüft; kein horizontaler Überlauf. Screenshots liegen lokal unter `/tmp/skyfall-*-{desktop,mobile}-verified.png`.

## Zusätzliche Features — teilweise umgesetzt

- **Fertig:** tägliches Fahrzeug-Highlight aus dem echten Katalog; Zufallsauto führt zu einem echten Katalogmodell.
- **Fertig:** lokaler SKYFALL-Kennzeicheneditor auf Fahrzeugpässen bestätigter Übergaben. Kennzeichen werden nur im Browser des Kunden gespeichert.
- **Fertig:** Fahrerprofile leiten Statistiken und Bestzeiten ausschließlich aus manuell erfassten, administrativ freigegebenen Rundenzeiten ab.
- **Fertig:** Warteliste ist nur für serverseitig bestätigte, freigegebene und tatsächlich ausverkaufte Fahrzeuge verfügbar. Beitritt und Austritt sind konto-gebunden; die Adminansicht kann den manuellen Kontakt protokollieren.
- **Fertig:** Werkstatt-Tickets können nur für Fahrzeuge mit bestätigter Übergabe angelegt werden. Mitarbeitende bearbeiten Status serverseitig über erlaubte Übergänge; Aktionen werden auditiert.
- **Teilweise:** Benachrichtigungen zeigen Bestell-/Zahlungsstatus, Testfahrt-Entscheidungen und Wartelistenkontakt. Angebotsbenachrichtigungen fehlen, da es noch kein freigegebenes Aktionssystem gibt.
- **Offen:** 3D-Showroom (keine passenden 3D-Modelle im Projekt vorhanden); zeitbegrenzte Reservierungen; Inzahlungnahme-Bewertungsregeln; adminverwaltete Angebote; Auktionen; Rennveranstaltungen samt Anmeldungen/Startlisten/Ergebnissen; SKYFALL-Fahrerkarte und Rennnummer; echter Probefahrt-Kalender mit belegten freien Terminen.
- **Prüfung dieses Arbeitsschritts:** 69 Tests bestanden; 30 Firestore-Emulatorfälle ohne laufenden Emulator übersprungen. Lint, Typecheck und Produktionsbuild bestanden. Mobile Kundenansicht (390 px) und Desktop-Startseite (1440 px) geprüft; kein horizontaler Überlauf. Unauthentifizierte Lese-/Adminaktionen an neuen Routen wurden mit HTTP 401 abgewiesen. Keine Test- oder Produktionsdaten geschrieben.

## Offen

- Echtes Fahrzeuglager ist noch nicht eingetragen/freigegeben; Bestellungen bleiben geschlossen, bis der Inhaber ein tatsächlich verfügbares Modell und den realen Bestand bestätigt.
- Authentifizierte Firebase-E2E-Prüfung der neuen Wunschlisten-, Testfahrt-, Bewertungs- und Moderationsabläufe ist offen; dafür wurden in diesem Lauf bewusst keine Testdaten in der echten Datenbank angelegt.
- Sicherer Passwort-Recovery-Ablauf ohne E-Mail; derzeit ist keine Selbstbedienungs-Wiederherstellung implementiert.
- Tatsächliche Serverinstallation, Modellvarianten und verfügbare Stückzahlen müssen vom Inhaber pro Modell im Adminbereich geprüft werden.
- SVMP braucht vor öffentlicher Servernutzung eine dokumentierte Erlaubnis des Autors; GT CRAFT ist nicht Survival-bestellbar.
- Passende Ingame-Bilder mit geklärten Rechten fehlen weiterhin; die vorhandenen Fotos sind Realfahrzeug-Referenzen.
- Tatsächliche Streckennamen und das manuelle Verfahren zur Zeitprüfung muss das Team festlegen. Es gibt keine automatische Zeitmessung.
- Werkstattaufträge, Mietwagenabläufe und ein vollständiger Motorsport-/Eventkalender bleiben offen.
- Accessibility-Audit und manuelle Tastaturprüfung.
- Deployment und GitHub-Remote.

## GitHub und Commits

GitHub-Remote und lokales Git-Repository sind nicht vorhanden; daher wurde nichts gepusht. Vor jedem späteren Push muss die aktive Identität als `tylerneuhaus2000tech` überprüft werden. Die globale Git-Autor-Konfiguration nennt derzeit eine andere Person, daher wurde auch kein Commit mit möglicherweise falscher Urheberschaft erstellt.

## Architekturentscheidungen

- Öffentliche Katalogdaten sind typisiert und mit Quellen, Packversion sowie Prüfstatus geführt.
- Kandidatenliste, Produktstatus, Preisfreigabe, Bildfreigabe und Bestellbarkeit bleiben getrennt.
- Nicht konfigurierte externe Dienste werden nicht als live vorgetäuscht.
- Mod-/Ingame-Bilder ohne geklärte Quelle zeigen einen neutralen Platzhalter; lizenzierte Realfahrzeug-Referenzen sind getrennt markiert und belegt.
- Minecraft-Passwörter werden mit scrypt (N=32768, r=8, p=1), individuellem 16-Byte-Salt und 64-Byte-Derivat gespeichert.
- Rollen, Preise, Zahlungsstatus und Bestand werden nur über serverseitige Firebase-Admin-Routen geändert.
- Kunden können einen Auftrag erfassen, wenn Packnachweis, Zielserverinstallation, Mitarbeiterfreigabe und freier Bestand gleichzeitig bestätigt sind; der Preis wird serverseitig aus Firestore gelesen. Fertigung, Zahlungsbestätigung und Übergabe erfordern außerdem die manuell bestätigte Minecraft-Identität.
- Preisfreigabe und Lagerstatus werden im Adminbereich kontrolliert; vorhandene Auth-, Rollen-, Zahlungs- und Bestellprüfungen bleiben serverseitig.

## Premium-Sortiment und Angebotsablauf — 18.10.2026

- Serverseitige Preisliste mit exakt 16 Modellen in vorgegebener Reihenfolge eingeführt. Öffentliche Katalogdaten enthalten keine alten Preisvorschläge für Anfragefahrzeuge; Bestellungen ohne Premiumpreis oder angenommenes Angebot werden abgewiesen. Premiumpreise lassen sich auch über die Admin-Inventarroute nicht überschreiben.
- Angebotsanfragen nutzen die vorhandenen geschützten Kundenanfragen. Mitarbeiter mit Anfrageberechtigung können ein Diamantenangebot setzen; Kunden können es explizit annehmen oder ablehnen. Annahme erzeugt nur innerhalb derselben Firestore-Transaktion eine normale Bestellung und Reservierung, sofern Identität, technische Freigabe und Bestand gültig sind.
- Alle 16 Premium-Modelle besitzen lokale WebP-Referenzbilder samt Credits/Lizenzangaben; die sechs neuen Quellen und Bearbeitungen stehen in `docs/research/vehicle-images.md`. Das RX-7-Bild ist als VeilSide-Ausführung markiert. Referenzfotos sind keine Server- oder Ingame-Nachweise.
- Startseite/Katalog priorisieren die Premiumauswahl und verwenden das M3-GTR-Bild als Hero. Desktop- und Smartphone-Aufnahmen lokal geprüft; auf Mobilgeräten wurde das Menü und Katalog-Heading angepasst.
- **Verifiziert:** 86 Unit-Tests, 35 Firestore-Emulatorfälle (inklusive Angebotserstellung/-berechtigung, manipulierter Premiumpreise, Ablehnung nicht-publiker Direktbestellung, angenommener Angebotsreservierung und Schutz vor Annahme fremder Angebote), Typecheck und Build bestanden. Geänderte Quell-Dateien bestehen Biome; vollständiges Repository-Lint meldet zusätzlich bereits vorhandene Formatprobleme in fremden Dateien.
- **Noch offen:** Authentifizierter kompletter Browserablauf und Minecraft-Serverbestätigung. Das echte Lager ist weiterhin leer/nicht freigegeben; kein Fahrzeug wird dadurch als sofort lieferbar ausgewiesen. Keine Produktionsdaten, Regeln oder Cloud-Einstellungen verändert.
