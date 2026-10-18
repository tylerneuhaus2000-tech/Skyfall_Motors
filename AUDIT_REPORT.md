# SKYFALL MOTORS — vollständiger Website-Audit

Stand: 18.10.2026  
Umfang: vorhandene App, Quellcode, Firebase-Anbindung, Regeldatei, Tests und lokale Browser-Laufzeit. Keine Featureänderungen, keine produktiven Schreibvorgänge, kein Regel-Deployment, kein Push.

## A. Executive Summary

**Gesamtbewertung: 57/100. Launch-Readiness für echte Verkäufe: 18/100.** Die öffentliche Website ist visuell konsistent, responsiv und die wichtigsten Kataloginteraktionen funktionieren. Authentifizierung, serverseitige Geschäftsregeln und Firebase sind implementiert; die Test-Suite und die deny-all-Regeln bestehen. Das belegt jedoch keinen vollständigen Kunden- oder Inhaberablauf.

**Größte Risiken:** Der Bestellbarkeitsfilter liefert aktuell **0 Fahrzeuge**. Registrierung/Login und Bestellungen wurden nicht mit einem isolierten echten Testkonto ausgeführt. Das geschützte Command Center war nur als unauthentifizierte Zugriffssperre erreichbar. Tatsächliche Server-Moddateien und Bestand liegen nicht vor; Packnachweise sind kein Nachweis einer Installation auf dem SKYFALL-Server.

**Heute tatsächlich bestätigt:** 14 Seitenpfade bei Desktop, Tablet und Smartphone aufgerufen (42 Ansichten), keine horizontalen Überläufe, keine defekten Bilder und keine reproduzierbaren Browser-Konsolenfehler. Suche, repräsentative Filter, Sortierung, Pagination, Vergleich bis drei Fahrzeuge, Verlauf, Zufallsfahrzeug und mobile Navigation wurden interaktiv bedient. 82 Unit-Tests und 30 Emulator-Regeltests bestanden; Lint, Typecheck und Build bestanden.

**Einschränkung:** Ohne sicheres Testkonto und freigegebenen Testbestand sind Login, Session-Persistenz, Bestellung, Zahlung, Übergabe und positive Adminaktionen nicht testbar. Sie werden daher nicht als funktionierend bestätigt. `TylerF1` wurde nicht angemeldet oder verändert.

## B. Feature-Matrix

Status ist pro Tabellenzeile exklusiv. „Nicht testbar“ bedeutet, dass der positive Ablauf ohne sicheres Testkonto/Testdaten nicht ausgeführt wurde; Code- und Unit-Testnachweise sind in der Methode genannt. Priorität bezeichnet die Bedeutung für einen echten Shop, nicht automatisch einen Codefehler.

| Bereich | Feature | Status | Testmethode / Ergebnis | Problem | Priorität |
|---|---|---|---|---|---|
| Startseite | Tagesfahrzeug und Startseiten-Highlight | Implementiert, aber nicht vollständig getestet | Homepage in Chrome; echtes Fahrzeug verlinkt. Tageswechsel/Admin-Änderung nur Quellcode/Unit-Tests. | Owner-Highlight nicht mit Owner-Session getestet. | P2 |
| Startseite | Zufallsauto | Implementiert & getestet | Klick führt zu einem echten Katalogmodell (`/fahrzeuge/craftspeed-focus`). | Keins festgestellt. | — |
| Navigation | Header, mobile Navigation, Footer-Links | Implementiert & getestet | Interne Links; Mobile-Menü geöffnet, Zielseite gewechselt und Menüschluss geprüft. 19 interne Ziele antworteten mit HTTP 200. | Keins festgestellt. | — |
| Seiten | Erreichbarkeit und Fehlerzustände | Implementiert & getestet | 14 Pfade direkt im Browser geprüft; u. a. Start, Katalog, Details, Checkout, Konto, Admin, Werkstatt, Race Center, Rennstrecke und Über uns. | Fahrerprofil/Kaufbeleg ohne echte Datensätze führen in den globalen 404-Text; siehe Bug SM-P3-01. | P3 |
| Fehlerzustand | 404-Texte für fehlendes Fahrerprofil/Kaufbeleg | Defekt | `/fahrer/TylerF1` und nicht vorhandener Beleg im Browser; Screenshot `audit-screenshots/driver-profile-not-found.png`. | Globaler 404-Text nennt ein Fahrzeug. | P3 |
| Responsive UI | Desktop 1440×1000, Tablet 768×1024, Smartphone 390×844 | Implementiert & getestet | 42 Browseransichten, kein horizontaler Überlauf. | Vollständige Tastatur-/Screenreader-Prüfung bleibt offen. | P2 |
| Katalog | Freitextsuche | Implementiert & getestet | `Merc`: 16 Treffer; Filterchip sichtbar. | Keins festgestellt. | — |
| Katalog | Herstellerfilter | Implementiert & getestet | BMW: 31 Treffer auf zwei Seiten. | Keins festgestellt. | — |
| Katalog | Content-Pack-Filter | Implementiert, aber nicht vollständig getestet | Auswahl und aktiver Filterchip reagierten. | Trefferzahl nach Packfilter nicht separat protokolliert. | P3 |
| Katalog | Fahrzeugklassenfilter | Implementiert & getestet | Luftfahrzeug: 10 Treffer, Bell 206 sichtbar. | Keins festgestellt. | — |
| Katalog | Verfügbarkeits-/Nachweisfilter | Implementiert & getestet | „Bestellbar“: 0 Treffer; „Packdatei belegt“ filterte den aktuellen Satz. | Aktuell kein Fahrzeug kaufbar; siehe SM-P1-01. | P1 |
| Katalog | Sortierung nach Preis, Pagination, Zurück | Implementiert & getestet | Preis aufsteigend/absteigend und „Weiter“ ändern das erste Modell/Seitennummer. | Keins festgestellt. | — |
| Katalog | Leerer Trefferzustand und Filter zurücksetzen | Implementiert & getestet | Leere Bestellbar-Liste zeigt Erklärung; Reset stellt 468 Einträge wieder her. | Keins festgestellt. | — |
| Katalog | Vergleich bis drei Fahrzeuge | Implementiert & getestet | Drei Fahrzeuge erscheinen im Vergleich; viertes wird mit klarer Meldung abgewiesen. | Lokaler Browserzustand, nicht synchronisiert. | — |
| Katalog | Zuletzt angesehene Fahrzeuge | Implementiert & getestet | Nach Öffnen von Merc erscheint es in „Zuletzt angesehen“. | Nur lokaler Browserzustand. | — |
| Katalog | Wunschliste | Nicht testbar | Abgemeldete Oberfläche leitet zum Konto; positive Anmeldung/Synchronisierung nicht ausgeführt. | Erfordert echtes Kunden-Testkonto. | P2 |
| Details | Fahrzeugdetailseiten, Preis-/Verfügbarkeitsstatus, Links | Implementiert & getestet | Merc und Bell 206 in drei Viewports; Detail- und Kataloglinks funktionieren. | Detailpreis ist teils Wunsch-/Masterlistenpreis, keine bestätigte Serververfügbarkeit. | P1 |
| Bilder | Fünf lokale Referenzfotos, Credits und Lizenzlinks | Implementiert & getestet | Alle fünf Dateien laden; Quelldateien vorhanden; Commons-Lizenzangaben gegen die Originalseiten abgeglichen. | Es sind Realfahrzeug-Referenzen, keine Ingame-/Mod-Bilder. | P2 |
| Konto-UI | Anmelden/Registrieren umschalten, Pflichtfelder, Passwort-Hinweis | Implementiert, aber nicht vollständig getestet | Browser: Registrierung ohne E-Mail, Minecraft-Name 3–16 Zeichen, Passwortfeld min. 12 Zeichen. Kein Formular abgesendet. | UI-Test belegt keine erfolgreiche Kontoanlage. | P1 |
| Authentifizierung | Registrierung, Passwortlogin, Logout, Custom-Token-Session | Nicht testbar | Ungültige leere Login-/Registrierungsanfragen wurden abgewiesen; Custom-Token-Signierung separat getestet. Kein gültiger Nutzerlogin. | Positive Anmeldung, Logout mit gültiger Session und Cookie-Persistenz offen. | P1 |
| Authentifizierung | Session-Ablauf, geschützte Kundenseiten | Nicht testbar | Fehlender/ungültiger Session-Token wird abgewiesen. Ablauf und Ablaufzeit nicht mit echter Session geprüft. | Kein sicheres Testkonto vorhanden. | P1 |
| Checkout | Preisaufschlüsselung, Abholung, Lieferung (+12), Express (+8) | Teilweise funktionsfähig | Gastansicht zeigt Preis und Gebühren; kein Absenden. | Keine freigegebene Verfügbarkeit, daher kein vollständiger Auftrag. | P1 |
| Bestellung | Serverseitige Preisberechnung, Statusübergänge, Reservierung/Idempotenz | Implementiert, aber nicht vollständig getestet | Domain-Tests decken Preis, Lagergrenzen, Status und Reservierung ab; keine aktuelle Firebase-Schreibtransaktion ausgeführt. | Laufzeit mit isoliertem Testbestand fehlt. | P1 |
| Kundenbereich | Profil, Bestellhistorie, Garage, Belege, Fahrzeugpass/Kennzeichen/Abzeichen | Nicht testbar | Seiten/Komponenten im Quellcode; keine bestätigte Übergabe als Testdatensatz verwendet. | Kein eigener Kunden- oder Übergabetestdatensatz. | P1 |
| Testfahrten | Kundenanfrage und manuelle Mitarbeiterfreigabe | Nicht testbar | API/Domain-Tests vorhanden; kein authentifizierter Positivpfad. | Kein freigegebenes Fahrzeug/Testkonto; Kalender fehlt (siehe unten). | P2 |
| Werkstatt | Ticketanlage und Statusverwaltung | Nicht testbar | API/Domain-Tests und Rollenprüfungen vorhanden; keine Garage/Übergabe für einen sicheren Ablauf. | Individuelle Angebote/Kundenfreigabe/Servicehistorie sind laut Projektstand offen. | P2 |
| Warteliste | Konto-gebundene Vormerkung und Admin-Kontakt | Nicht testbar | Domain-Tests vorhanden; keine reale ausverkaufte, freigegebene Inventory-Zeile. | Kein zulässiger Testbestand. | P2 |
| Bewertungen | Kundenbewertung und Moderation | Nicht testbar | Domain-Tests; öffentliche GET-Liste erlaubt, keine Testbewertung angelegt. | Authentifizierter Positivpfad fehlt. | P2 |
| Benachrichtigungen | Kunden-Benachrichtigungscenter | Nicht testbar | API/Domain-Code vorhanden; kein authentifiziertes Konto mit Ereignissen. | Angebote fehlen laut Projektstand; positive Anzeige offen. | P2 |
| Race Center | Öffentliche freigegebene Bestenliste/Leerzustand | Implementiert & getestet | Browser zeigt „0 freigegeben“ und keine Beispieldaten; öffentlicher GET erreichbar. | Aktuell keine freigegebenen Zeiten vorhanden. | — |
| Motorsport | Manuelle Rundenzeit-Einreichung und Adminfreigabe | Nicht testbar | Domain-Tests; keine eingeloggte Einreichung oder Moderation. | Keine echte Strecke und kein sicherer Testfahrer. | P2 |
| Fahrerprofile | Profil, Bestzeiten und Rennstatistik | Nicht testbar | TylerF1-Profil ohne freigegebene Daten führt zu 404. | Keine freigegebenen Zeiten; keine Rennen/Anmeldungen. | P2 |
| Gebrauchtwagen | Marktplatz/Ankauf | Nur UI ohne Backend | `/gebrauchtwagen` zeigt ausdrücklich „noch nicht geöffnet“/keine Inserate; kein Angebotsformular. | Feature nicht benutzbar. | P2 |
| Rennstrecke | Streckenplan, Mietfahrzeuge, Termine/Buchung | Nur UI ohne Backend | `/rennstrecke` zeigt „Strecke und Termine folgen“; keine Buchung. | Feature nicht benutzbar. | P2 |
| 3D-Showroom | Interaktive Fahrzeugmodelle | Nicht implementiert | Kein passendes 3D-Modell oder Viewer im Projekt gefunden. | Nicht vorhanden. | P3 |
| Reservierungen | Zeitbegrenzte Fahrzeugreservierung | Nicht implementiert | Kein entsprechender Ablauf/Backend gefunden. | Nicht vorhanden. | P2 |
| Inzahlungnahme | Gebrauchtwagenwert-Rechner | Nicht implementiert | Kein Rechner/Backend gefunden. | Nicht vorhanden. | P3 |
| Marketing | Admin-Angebote/Rabatte | Nicht implementiert | Kein Angebots-/Rabattmodul im Projektstand. | Nicht vorhanden. | P2 |
| Auktionen | Fahrzeugauktionen und Gebote | Nicht implementiert | Kein Auktionsmodul gefunden. | Nicht vorhanden. | P3 |
| Events | Rennveranstaltungen, Startlisten und Ergebnisse | Nicht implementiert | Öffentliche Bestenliste vorhanden; Eventverwaltung/-anmeldung nicht. | Nicht vorhanden. | P2 |
| Fahrerkarte | SKYFALL-Lizenz und Rennnummer | Nicht implementiert | Kein entsprechendes Profil-/Kartensystem gefunden. | Nicht vorhanden. | P3 |
| Konto | Passwort-Wiederherstellung ohne E-Mail | Nicht implementiert | Dokumentation nennt Recovery ausdrücklich offen; kein Endpunkt/Flow. | Nutzer braucht manuelle Inhaberprüfung. | P1 |
| Admin | Unauthentifizierter Zugriffsschutz auf `/admin` | Implementiert & getestet | Ohne Session wird „Bitte anmelden“ angezeigt; keine Admin-Daten sichtbar. | Inhaber-/Mitarbeiter-Dashboard dadurch nicht positiv geprüft. | — |
| Admin | Dashboard-KPIs, Umsatz, Aufgaben und Aktivitätsfeed | Nicht testbar | Implementierung und Aggregation aus gespeicherten Daten vorhanden; kein Owner-Login. | Echte Werte/Charts/Auditfeed nicht im Browser verifiziert. | P1 |
| Admin | Bestands-/Preis-/Freigabeaktionen | Nicht testbar | API-Guards und Geschäftsregeln vorhanden; keine Owner-Aktion ausgeführt. | Positiver Firestore-Schreibpfad offen. | P1 |
| Admin | Fahrzeuganlage sowie Modell-, Pack-, Klassen- und Bildbearbeitung | Nicht implementiert | Projektstand nennt Anlegen/Beschreibungs-/Bildverwaltung offen; keine funktionsfähige Bearbeitungsmaske gefunden. | Admin-Katalogpflege nicht vollständig. | P2 |
| Admin | Bestellungen, Zahlungen, Status, Storno und Übergabe | Nicht testbar | Serveraktionen/Domainregeln und Zahlungsgrenzen getestet; keine Admin-Session/Bestellung verwendet. | Kein vollständiger Owner-E2E-Test. | P1 |
| Admin | Kundenprüfung, Garage und Rollenzuweisung | Teilweise funktionsfähig | Backend/Permissions und Unit-Tests; Verifizierung/Rollen vorhanden, Kontosperre/Adminnotizen laut Projektstand offen. | Owner-Positivpfad nicht testbar. | P1 |
| Admin | Mitarbeiterrollen / Selbstbeförderungsschutz | Implementiert, aber nicht vollständig getestet | Rollen- und Berechtigungstests bestanden; kein Owner-Request gegen Firebase. | Laufzeit-Zuweisung nicht geprüft. | P1 |
| Admin | Werkstatt-, Testfahrt-, Zeiten-, Review- und Wartelistenmoderation | Implementiert, aber nicht vollständig getestet | Domain-/Rollen-Tests und unauthentifizierte Ablehnung; keine berechtigte Moderation. | Kein bestätigter Mitarbeiter-E2E-Test. | P2 |
| Admin | Audit-Log kritischer Aktionen | Nicht testbar | Store/API/Task-Tests vorhanden; kein Admin-Write erzeugt. | Akteur/Zeit/Eintrag nicht live nachgewiesen. | P1 |
| Admin | CSV-Exporte | Nicht testbar | Export-Route verlangt `orders`-Recht; ohne Session HTTP 401. | Inhalt/Datei nicht mit berechtigtem Konto geprüft. | P2 |
| Admin | Ankündigungen und Highlight-Verwaltung | Nicht testbar | Öffentliche Homepage enthält keine bestätigten Admin-Ankündigungen; Owner-Endpunkt geschützt. | Veröffentlichen/Bearbeiten nicht getestet. | P2 |
| Admin | Zentrale Gebühren und Shop-Modi | Nicht testbar | Shop-/Gebührenvalidierung und serverseitige Sperre mit Tests abgedeckt; keine Owner-Änderung. | Die Modi sind nicht per autorisiertem Lauf verifiziert. | P1 |
| Kundenservice | Kundenanfragen und interne Bearbeitung | Nicht testbar | API/Validierung vorhanden; ohne Kunde/Staff keine Anfrage erstellt oder beantwortet. | Positiver E2E-Pfad offen. | P2 |
| Sicherheit | Unauthentifizierte private API-Reads/Writes | Implementiert & getestet | 9 private GETs und 18 mutierende POSTs gaben HTTP 401 zurück; unvollständige Auth-Eingaben gaben 400/401. Öffentliche Bestenliste/Reviews antworteten 200. | Positive Rollenpfade bleiben offen. | — |
| Sicherheit | Firestore-Clientregeln | Implementiert & getestet | Exakt `firestore.rules`; Demo-Emulator: 30/30 Tests bestanden. `firebase.json` verweist auf diese Datei. | Keine. Es wurde nichts deployed. | — |
| Firebase | Admin Auth-/Firestore-Lesezugriff und Custom-Token-Signierung | Implementiert & getestet | Auth-Projektkonfiguration und Firestore-Collection-Metadaten lesend erreichbar; Token mit fiktiver UID signiert und verworfen, kein Nutzer erstellt. | Belegt keine Kunden-Session oder Datenänderung. | — |

### Statussummen

Die Feature-Matrix umfasst 58 Zeilen. Die unten angegebenen Kategorien sind die exakten, gegenseitig ausschließenden Statuswerte der Matrix; siehe Abschlussübersicht nach Abschnitt I.

## C. Bugliste

### SM-P1-01 — Kein aktuell bestellbares Fahrzeug

- **Schweregrad:** P1, betrieblicher Launch-Blocker (kein Codefehler nachgewiesen)
- **Seite:** `/fahrzeuge`, `/bestellen/[vehicleId]`
- **Reproduktion:** `/fahrzeuge` öffnen und den Status „Bestellbar“ wählen.
- **Erwartet:** Vor Verkaufsstart mindestens ein wirklich installiertes, freigegebenes Fahrzeug mit nicht vollständig reserviertem Bestand.
- **Tatsächlich:** 0 Treffer; sichtbare Einträge melden „Serverfreigabe offen“. Ein Gast-Checkout zeigt eine Vorschau, kann aber keine Bestellung erstellen.
- **Ursache:** Kein Datensatz erfüllt die öffentlich geprüfte Bedingung `serverInstallationConfirmed && approved && availableUnits > reservedUnits`. Ob passende Dokumente fehlen oder nicht freigegeben sind, lässt sich aus der öffentlichen Ansicht nicht unterscheiden.
- **Empfehlung:** Zielserver-Modpack und realen Bestand prüfen und erst danach gezielt freigeben; anschließend Bestellablauf mit isoliertem Testkonto nachweisen.

### SM-P2-01 — Mehrere Packeinträge haben identische sichtbare Modellnamen

- **Schweregrad:** P2, Datenklarheit
- **Seite:** `/fahrzeuge`
- **Reproduktion:** Nach `BMW M3 (E30)` oder `Opel Campo` suchen.
- **Erwartet:** Unterschiedliche Pack-Assets/Varianten für Kund:innen sichtbar unterscheidbar.
- **Tatsächlich:** 17 Namensgruppen enthalten 35 Zeilen (18 zusätzliche Einträge); z. B. existieren zwei Craftspeed-Assets für „BMW M3 (E30)“ mit verschiedenen Asset-IDs, aber gleichem Namen.
- **Ursache:** Quellen-Assets sind IDs-seitig eindeutig, der angezeigte Name enthält die Variante nicht. Der exakte Datensatzschlüssel `packId:assetId` ist in den 229 Packzeilen eindeutig; es handelt sich daher nicht um doppelte Schlüssel.
- **Empfehlung:** Varianten aus der Quelldatei kennzeichnen oder bis zur eindeutigen Identifikation zusammenfassen. Vorher nicht als inhaltlich identisch löschen.

### SM-P3-01 — Globaler 404-Text passt nicht zu Fahrerprofilen und Kaufbelegen

- **Schweregrad:** P3, irreführender Fehlertext
- **Seiten:** `/fahrer/TylerF1`, `/kundenbereich/belege/audit-nonexistent`
- **Reproduktion:** Diese Pfade ohne entsprechende Daten öffnen.
- **Erwartet:** Kontextneutral „Eintrag nicht gefunden“ oder ein Seitentyp-spezifischer Hinweis.
- **Tatsächlich:** „Dieses Fahrzeug gibt es hier nicht.“
- **Ursache:** `src/app/not-found.tsx:10–12` verwendet global fest codierten Fahrzeugtext.
- **Empfehlung:** 404-Text neutralisieren oder Seiten jeweils eigene nicht gefundene Zustände rendern lassen.

Keine P0-Sicherheitslücke und keine weitere reproduzierbare Code-Fehlfunktion bestätigt. Nicht implementierte Funktionen stehen in der Matrix und werden nicht als Bugs mit vorgetäuschter Reproduktion ausgegeben.

## D. Sicherheitsbericht

- `firebase-admin` liegt in einem `server-only`-Modul; Browsercode verwendet Firebase Auth für den Custom-Token-Austausch, aber kein direktes Firestore-SDK. Admin-SDK-Zugriffe müssen serverseitig durch Account-/Permission-Prüfungen laufen.
- `firestore.rules` verweigert Browser-Reads und -Writes vollständig. Die Emulatorprüfung prüfte `get`, `list`, `create`, `update` und `delete` für nicht authentifizierte, Kunden- und Mitarbeiter-Kontexte über die exakt von `firebase.json` referenzierte Datei.
- API-Mutationsprüfungen verwenden Same-Origin-Schutz, Eingabevalidierung und Account-/Owner-/Rollenprüfungen. In diesem Lauf wurden 18 private POST-Routen mit leerem JSON ohne Cookie abgewiesen; Auth-POSTs mit leerer Eingabe haben keine Konten angelegt.
- Unit-Tests decken Passwort-Hashing, serverseitige Preise, Statusübergänge, Reservierung, Rollen, Export-Formeln und kritische Eingaben ab. Ein echter Login, Fremdbestellungszugriff mit zwei Nutzerkonten und autorisierte Mutation wurden nicht durchgeführt.
- Lokale Dateiprüfung: `.env.local` und Service-Account-Datei Modus `0600`; Service-Account liegt außerhalb des Projekts und Projekt-ID stimmt. `FIREBASE_USE_ADC=true`, `FIRESTORE_RULES_CONFIRMED=true`. `.gitignore` ignoriert `.env*` sowie Service-Account-Dateimuster.
- In den vorhandenen `.next/static`-Client-Bundles wurden keine privaten Schlüsselmarker, `FIREBASE_SERVICE_ACCOUNT_JSON`, `GOOGLE_APPLICATION_CREDENTIALS` oder `process.env.APP_SECRET` gefunden. Der Firebase-Web-API-Key ist öffentliche Client-Konfiguration und kein privater Admin-Schlüssel.
- Das Arbeitsverzeichnis ist **kein Git-Repository**. Deshalb sind weder Git-Index noch Commit-Historie überprüfbar; der aktuelle Ignore-Schutz ist vorhanden, eine Aussage über frühere Commits wäre nicht belegbar.
- Keine Firebase-Regeln deployed, keine Cloud-Daten geschrieben, keine Kunden/Owner geändert und kein GitHub-Push.

## E. UI/UX-Bewertung

Heuristische Bewertung aus den Screenshots und der Bedienung bei den drei Viewports; kein Nutzertest und kein vollständiger WCAG-/Screenreader-Test. Reihenfolge: **Visuell / Lesbarkeit / Navigation / Mobil / Konsistenz / Zustände / Bedienbarkeit / Premium-Eindruck**.

| Seite | Werte (0–10) | Befund |
|---|---|---|
| `/` | 8 / 8 / 8 / 8 / 8 / 8 / 8 / 8 | Starke Typohierarchie, warme Fläche, passende Referenzaufnahme, klarer Katalog-CTA. |
| `/fahrzeuge` | 7 / 7 / 7 / 8 / 8 / 7 / 8 / 7 | Filter, Trefferzahl und Karten funktionieren; 468 Einträge machen den Katalog umfangreich, viele Karten haben Platzhalter. |
| `/fahrzeuge/[id]` | 8 / 8 / 7 / 7 / 8 / 7 / 7 / 8 | Hochwertiges Bildformat; mobile Bildcredits/Status liegen dicht über dem Bild. |
| `/bestellen/[vehicleId]` | 7 / 8 / 7 / 8 / 8 / 7 / 7 / 7 | Gebühren und Shopmodus sichtbar; ohne Konto/Bestand nur Vorschau. |
| `/kundenbereich` | 7 / 8 / 8 / 8 / 8 / 7 / 8 / 7 | Klare Login-/Registrierungstrennung und Feldlabels; positives Konto-Rendering nicht getestet. |
| `/admin` | 7 / 8 / 7 / 8 / 7 / 8 / 8 / 6 | Bewertet ist nur die Zugriffssperre. Das eigentliche Dashboard ist ohne Owner-/Staff-Session nicht bewertbar. |
| `/race-center` | 7 / 8 / 7 / 8 / 7 / 7 / 7 / 6 | Leerer Zustand ist ehrlich, sagt klar, dass Zeiten manuell und moderiert sind. |
| `/werkstatt` | 7 / 8 / 7 / 8 / 7 / 8 / 6 / 6 | Verständlicher Vorbereitungszustand; kein öffentlicher Arbeitsablauf in der Ansicht. |
| `/gebrauchtwagen` | 6 / 8 / 7 / 8 / 7 / 8 / 5 / 5 | Platzhalter weist ehrlich darauf hin, dass keine Inserate angenommen werden. |
| `/rennstrecke` | 6 / 8 / 7 / 8 / 7 / 8 / 5 / 5 | Streckenplan/Termine fehlen ausdrücklich. |
| `/ueber-uns` | 7 / 8 / 8 / 8 / 8 / 8 / 7 / 6 | Gute Produkterklärung, inhaltlich noch eher Projekt- als Händlerprofil. |
| Fehlende Fahrer-/Belegseite | 4 / 6 / 6 / 7 / 6 / 4 / 5 / 3 | Globaler 404-Text nennt fälschlich ein Fahrzeug (SM-P3-01). |

Grundlegender DOM-Accessibility-Smoke-Test auf sechs Hauptseiten: 0 unbenannte Buttons/Links, 0 Bilder ohne `alt`, 0 nicht beschriftete Eingaben. Vollständige Tastatur-, Kontrast- und Screenreader-Prüfung bleibt offen.

## F. Fahrzeugdatenqualität

- **468 Katalogeinträge** werden in der Oberfläche gezählt. Darunter liegen **229 Zeilen** aus sechs 1.21.1/NeoForge-Packarchiven, **182 rohe Wunschlisten-Zeilen**, **31 alte R.A.G.E.-Einträge** und weitere normalisierte historische Kandidaten. Diese Quellgruppen überlappen/werden dedupliziert; daher sind die Quelldateizahlen nicht additiv zum UI-Gesamtwert.
- Die 229 Packzeilen enthalten 229 eindeutige `packId:assetId`-Schlüssel. **111** haben das Datenfeld `orderEligible=true`; trotzdem stehen alle Katalog-Fahrzeuge im Quellmodell auf `orderStatus=not-open` und `serverInstallationStatus=not-checked`. Das Flag ist kein Nachweis für tatsächlichen Serverbestand.
- 17 sichtbare Namensgruppen wiederholen sich; 18 zusätzliche Zeilen haben abweichende Asset-IDs. Varianten sind nicht immer im Anzeigenamen erkennbar. Die exakten Pack-/Asset-Schlüssel selbst sind eindeutig.
- Fünf von 468 Einträgen haben lokale Fotos; 463 zeigen Platzhalter. Alle fünf Dateien existieren, laden in Chrome und besitzen sichtbare Urheber-/Lizenz-/Quelllinks. Es handelt sich um Referenzfotos echter Fahrzeuge, nicht um Aufnahmen der Minecraft-Modelle.
- Die offiziellen Commons-Seiten stimmen mit den lokalen Lizenzangaben überein: [Mercedes W123 (CC BY 2.0)](https://commons.wikimedia.org/wiki/File:1976_Mercedes-Benz_230_(W123)_(52102422537).jpg), [International Scout (CC BY 2.0)](https://commons.wikimedia.org/wiki/File:1964_International_Harvester_Scout_80_utility_(25780691342).jpg), [GMC Brigadier (CC BY-SA 3.0)](https://commons.wikimedia.org/wiki/File:1986_GMC_Brigadier_8000-series_4x2_Class_7_dump_truck.jpg), [Quad-Eisrennen (CC BY-SA 3.0)](https://commons.wikimedia.org/wiki/File:Quad_Ice_Racing_Tilleda_Thunder.jpg) und [Corvette C1 (CC BY 2.0)](https://commons.wikimedia.org/wiki/File:1957_Chevrolet_Corvette_C1_(24776392743).jpg). Die Bildquellen und Änderungen sind im Projekt separat dokumentiert.
- Hersteller sind nicht als eigenes Feld in den Pack-JSON-Zeilen belegt; die Oberfläche leitet sie bei vielen Modellen anhand Namenspräfixen ab. Darum ist eine vollständig quellengestützte Hersteller-Richtigkeitsquote nicht belegt.
- Ohne die tatsächlichen Server-Moddateien, Modloader-Konfiguration und Rezepte lässt sich die Installation/Survival-Kompatibilität auf dem Minecraft-Zielserver nicht vollständig behaupten. GT CRAFT/R.A.G.E.-Kandidaten bleiben getrennt bzw. gesperrt.
- Es wurden keine negativen Preise oder doppelten stabilen Asset-Schlüssel gefunden. Preisvorschläge und Masterlistenpreise sind im UI unterscheidbar; ein administrativ bestätigter Verkaufspreis/Bestand existiert nicht für ein öffentlich bestellbares Fahrzeug.

## G. Testergebnisse

| Prüfung | Ergebnis |
|---|---|
| `npm run lint` | Bestanden; Biome prüfte 102 Dateien, keine Änderungen. Kein ESLint-Script/ESLint-Paket konfiguriert. |
| `npm run typecheck` | Bestanden (`tsc --noEmit`). |
| `npm test` | 9 Testdateien bestanden, 1 Emulator-Testdatei ohne Emulator übersprungen; 82 bestanden, 30 übersprungen. |
| `npm run test:firestore-rules` | Bestanden mit lokalem Java 21 und Demo-Projekt `demo-skyfall-motors`: 30/30 Tests; Emulator danach beendet. |
| `npm run build` | Produktionsbuild erfolgreich; isoliertes `.next-audit-build`, Testkonfiguration danach bytegleich wiederhergestellt/entfernt. |
| Browser | Chrome Headless via DevTools Protocol, Playwright nicht installiert. 14 Pfade × 3 Viewports = 42 Ansichten, 0 horizontale Überläufe, 0 kaputte Bilder, 0 reproduzierbare Konsolen-/HTTP-Fehler. Ein einzelner Request-Abbruch während einer schnellen Navigationsserie trat im isolierten Wiederholungslauf nicht auf. |
| Browserinteraktionen | Suche, Hersteller-/Klassen-/Statusfilter, Reset, Preis-Sortierung, Pagination, Vergleichslimit, Verlauf, Zufallsauto, mobile Navigation und Konto-Tabwechsel. Keine Formulare mit produktiven Kontodaten abgesendet. |
| API-Sicherheitsproben | 9 private GET-Routen + 18 private POST-Mutationsrouten ohne Session: HTTP 401. Öffentliche Bestenliste und Reviews: HTTP 200. Leere Auth-Eingaben: HTTP 400/401; Logout ohne Cookie idempotent HTTP 200. Keine Daten erstellt. |
| Firebase | Auth-Projektkonfiguration und Firestore-Metadaten lesend erreichbar; Custom Token für fiktive UID signiert und verworfen. Keine Nutzeranlage und keine Firestore-Schreiboperation außerhalb des isolierten Emulators. |
| Performance (lokaler Dev-Server) | Auf repräsentativen Seiten: First Contentful Paint ca. 60–776 ms, Load-Event ca. 109–875 ms; Startseite 20 Ressourcen/~869 kB Transfer, Katalog 23/~134 kB. Headless-Entwicklungswerte ohne Drosselung und nicht als Produktionsbenchmark geeignet. |

## H. Screenshots und Belege

Die fünf Hauptzustände wurden bei Desktop, Tablet und Smartphone gespeichert. Das Adminbild zeigt ausdrücklich nur die unangemeldete Sperre, nicht das Inhaber-Dashboard. Das kleine „N“ links unten ist der Next.js-Entwicklungsindikator.

| Seite | Desktop | Tablet | Smartphone |
|---|---|---|---|
| Startseite | [PNG](audit-screenshots/home-desktop.png) | [PNG](audit-screenshots/home-tablet.png) | [PNG](audit-screenshots/home-mobile.png) |
| Fahrzeugkatalog | [PNG](audit-screenshots/catalog-desktop.png) | [PNG](audit-screenshots/catalog-tablet.png) | [PNG](audit-screenshots/catalog-mobile.png) |
| Merc-Detailseite | [PNG](audit-screenshots/vehicle-detail-desktop.png) | [PNG](audit-screenshots/vehicle-detail-tablet.png) | [PNG](audit-screenshots/vehicle-detail-mobile.png) |
| Kundenbereich (Login) | [PNG](audit-screenshots/customer-area-desktop.png) | [PNG](audit-screenshots/customer-area-tablet.png) | [PNG](audit-screenshots/customer-area-mobile.png) |
| Admin, unangemeldet | [PNG](audit-screenshots/admin-unauthenticated-desktop.png) | [PNG](audit-screenshots/admin-unauthenticated-tablet.png) | [PNG](audit-screenshots/admin-unauthenticated-mobile.png) |

Weitere Belege: `AGENTS.md`, `PLAN.md`, `PROGRESS.md`, `NIGHTLY_LOG.md`, `MORNING_REPORT.md`, `package.json`, `firebase.json`, `firestore.rules`, `tests/`, `src/lib/catalog.ts`, `src/lib/order-store.ts`, `src/lib/api-auth.ts`, `src/lib/admin-permissions.ts`, `src/app/not-found.tsx` und `docs/research/vehicle-images.md`.

Zusätzliche Problembelege: [Doppelte Anzeigenamen bei BMW M3 (E30)](audit-screenshots/catalog-duplicate-names.png) und [404 im Fahrerprofil](audit-screenshots/driver-profile-not-found.png).

## I. Empfohlene Reihenfolge der Reparaturen

1. Tatsächliche Server-Modpack-Version/Installation und verfügbaren Diamantenbestand prüfen; ein Modell erst nach Inhaberfreigabe kaufbar setzen.
2. Ein isoliertes Kunden-Testkonto und einen eindeutig markierten Testbestand einrichten; danach Registrierung, Login/Logout, Session, Preise, Lieferung/Express, Idempotenz, Bestellhistorie, Adminzahlung, Status, Übergabe und Kundenrechte vollständig Ende zu Ende prüfen.
3. Mit einem sicheren Owner-Testzugang Dashboard, Bestandsänderung, Rollen, Audit, Exporte, Gebühren/Shopmodus und Moderation verifizieren. Kein TylerF1-Passwort für Tests verwenden.
4. Doppelte Anzeigenamen/Varianten gegen die Quell-Assetdateien auflösen; fehlende Variantenkennzeichnung ergänzen, bevor Einträge zusammengelegt werden.
5. Globalen 404-Text für Fahrerprofile und Kaufbelege neutralisieren.
6. Erst danach offene Zusatzmodule, echte Ingame-Fotos und vollständiges Accessibility-Audit priorisieren.

**Im Audit nicht getan:** keine Reparatur, kein Deployment, kein Commit/Push, keine produktive Datenänderung. Die einzigen Projektergebnisse dieses Audits sind dieser Bericht und die aufgeführten Screenshots.

### Zählübersicht der Feature-Matrix

| Status | Anzahl |
|---|---:|
| Implementiert & erfolgreich getestet | 19 |
| Implementiert, aber nicht vollständig getestet | 6 |
| Teilweise funktionsfähig | 2 |
| Defekt | 1 |
| Nur UI ohne Backend | 2 |
| Nicht implementiert | 9 |
| Nicht testbar | 19 |
| **Summe** | **58** |

