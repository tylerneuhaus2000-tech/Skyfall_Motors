# SKYFALL MOTORS – Post-Audit-Bericht

Stand: 18.10.2026. `AUDIT_REPORT.md` blieb unverändert. Es gab weder Cloud-Deployments noch GitHub-Pushes oder Änderungen an echten Firebase-Daten. Die E2E-Daten und der temporäre Owner lagen ausschließlich im Firebase-Emulator-Projekt `demo-skyfall-motors`.

## Behobene Fehler

- 17 Gruppen mehrfach verwendeter Modellnamen sind im Katalog jetzt anhand ihrer belegten Asset-ID unterscheidbar. Ein Test deckt die eindeutigen sichtbaren Namen und Pack-/Asset-Schlüssel ab.
- Die allgemeine Fehlerseite behauptet nicht mehr fälschlich, ein Fahrzeug existiere nicht. Sie sagt neutral, dass die Seite nicht gefunden wurde, und bietet Links zum Katalog und Kundenbereich.
- Ergänzt wurden zwei passende Realfahrzeug-Referenzbilder: Bell 206 von Schlurcher unter [CC BY 4.0](https://commons.wikimedia.org/wiki/File:Bell_206_JetRanger.JPG) sowie Ford Mustang 1969 von IFCAR, als [Public Domain freigegeben](https://commons.wikimedia.org/wiki/File:1969-Ford-Mustang.jpg). Beide sind lokal optimiert, mit Urheber/Lizenz belegt und ausdrücklich keine Ingame-Bilder. Abdeckung: 7 von 229 Katalogeinträgen; übrige Einträge behalten ihren Platzhalter.
- Keine Mod-Aufnahmen ergänzt: Die offizielle [OCP-Projektseite](https://www.curseforge.com/minecraft/mc-mods/transport-simulator-official-vehicle-set) weist „All Rights Reserved“ aus. Andere Packbilder wurden nicht ohne Nutzungsfreigabe übernommen.

## E2E-Tests

**54 von 54 Emulatorprüfungen bestanden.** Darin: Registrierung, Passwortlogin, Custom-Token-Austausch, Session-Cookie, doppelte Namen/ungültiges Passwort, Kunden-/Owner-Trennung, gesperrte und ungültige Fahrzeuge, Nullbestand, serverseitige Preisberechnung (17 + 12 Lieferung + 8 Express trotz manipuliertem Clientpreis), idempotente Bestellung, Reservierung, Historie, manuelle Identitäts- und Zahlungsfreigabe, Statuswechsel, Übergabe, atomare Bestandsänderung, Belegzugriff, Admin-Dashboard mit 12 Modulen, Audit-Log, drei CSV-Exporte, Shop-Schließung, Bearbeitung bestehender Bestellungen und Logout.

Zusätzlich bestätigte ein echter lokaler Chrome-Lauf den Login über die Kundenoberfläche, ein `HttpOnly`-Session-Cookie und den authentifizierten Abruf von Kundenbestellungen. Der Emulator wurde mit der Projektdatei `firestore.rules` gestartet; **30 von 30** Firestore-Regeltests bestanden.

Qualitätsprüfungen: Lint bestanden (102 Dateien), Typecheck bestanden, Build bestanden, Unit-Tests: 84 bestanden, 30 Emulator-Tests übersprungen (separat ausgeführt: 30/30 bestanden). Kein Fehler in diesen Prüfungen.

Der temporäre Emulator-Owner war ein Test-Fixture: Er wurde ausschließlich in der isolierten Emulator-Datenbank auf Owner gesetzt; das testete die geschützten Owner-Routen, nicht den produktiven Bootstrap-Ablauf. `TylerF1`-Passwort und -Rolle wurden nicht geändert. Emulatoren und lokaler Testserver wurden beendet; die Testdaten wurden nicht in Firebase Cloud geschrieben.

## Fahrzeugdaten

- 229 Fahrzeuge aus 6 Pack-Zuordnungen; 229 eindeutige Pack-/Asset-Schlüssel und keine fehlenden Pflichtfelder (Asset-ID, Pack, Quelldatei, Quell-URL, Modellname, Klasse).
- Die 17 mehrfachen sichtbaren Namen sind jetzt disambiguiert. Doppelte Pack-/Asset-Schlüssel: 0.
- 55 Katalogeinträge beziehen einen expliziten Preis aus Master-/Historienlisten; bei 174 wird ein nachvollziehbarer Klassen-/Modellvorschlag verwendet. Diese Vorschläge sind keine bestätigten Marktpreise. Drei historische Schlüssel (`svmp:360spider`, `svmp:360stradale`, `svmp:elise`) gehören nicht zu den derzeitigen Packdaten und wirken auf keinen Eintrag.
- Packarchiv-Nachweise bestätigen nicht, dass ein Fahrzeug auf dem SKYFALL-Server installiert oder im Spiel geprüft wurde. Keine Fahrzeuge wurden automatisch freigegeben. Alle 229 Katalogmodelle sind weiterhin `not-open` und `not-checked`; damit ist derzeit kein Fahrzeug öffentlich bestellbar.

## Weiterhin nicht testbar / offen

- Login als echter Inhaber `TylerF1` mit dessen persönlichem Browserzugang und realem Cloud-Session-Cookie; dafür wurden keine Zugangsdaten verwendet.
- Das vollständige Command Center wurde mit allen 12 Modulbereichen gerendert. Eine vollständige CRUD-Browserprüfung jedes Moduls (insbesondere Marketing, Werkstatt, Rennen, Ankündigungen und Mitarbeiter) ist offen; die E2E-Abdeckung konzentrierte sich auf Bestand, Bestellungen, Kundenprüfung, Audit-Log, Shop-Einstellungen und Exporte.
- Die Bestellung wurde über echte lokale HTTP-Endpunkte mit Emulatordaten durchgespielt; eine vollständige Klick-für-Klick-Bestellung in der Browseroberfläche wurde nicht behauptet.
- Installation, Modloader, Abhängigkeiten, Fahrzeug-Spawn und Fahrverhalten auf dem tatsächlichen Minecraft-Server.
- Echtes Inventar, reale Diamantenzahlung, echte Kundendaten sowie Produktions-/Cloudlaufzeit. Es wurde keine Zahlung ausgelöst.
- Die übrigen 222 Fahrzeugbilder sind weiterhin Platzhalter. Die zusätzlichen Fotos zeigen reale Referenzfahrzeuge, nicht die Minecraft-Modelle.
- Die allgemeine Next.js-Not-found-Seite wird beim dynamischen Belegzugriff gestreamt; der beobachtete HTTP-Status war 200, obwohl der neutrale Not-found-Inhalt korrekt erschien. Fremde Bestellnummer und Kundendaten wurden dabei nicht ausgegeben. HTTP-404-Statusverhalten bleibt gesondert zu prüfen.

## Launch-Readiness

**40/100 – noch nicht launchbereit.** Authentifizierung, Bestell- und Adminabläufe sind lokal im Emulator belegt; für den realen Betrieb fehlen die tatsächliche Serverprüfung und manuelle Freigabe mindestens eines konkreten Modells samt echtem Bestand. Preise für 174 Einträge sind Vorschläge und müssen vor Veröffentlichung geprüft werden. Keine echte Kundenbestellung oder Zahlungsbestätigung wurde getestet.

## Was der Inhaber im Minecraft-Server tun muss

1. Als `TylerF1` anmelden und im Bereich **Admin → Fahrzeuge freigeben** ein Modell samt Pack, Asset-ID und Klasse auswählen.
2. Auf dem tatsächlichen Zielserver die passende Minecraft-/Loader- und Packversion sowie erforderliche Abhängigkeiten kontrollieren. Fahrzeug im Spiel spawnen und Modell/Variante mit dem Katalogeintrag vergleichen. Packdatei allein gilt nicht als Servernachweis.
3. Nur nach erfolgreichem Test **„Zielserver getestet“** aktivieren. Vorher Preise prüfen und den wirklich vorhandenen, noch nicht reservierten Fahrzeugbestand eintragen. Danach **„Freigeben“** aktivieren und speichern. Dies einzeln je bestätigtem Fahrzeug durchführen.
4. Nicht installierte, nicht spawnende oder nicht eindeutig zuordenbare Modelle gesperrt lassen. Vor echtem Shopbetrieb einen angekündigten Testkauf nur mit separater Testumgebung durchführen; keine echte Diamantenzahlung als simuliert markieren.

Es wurden keine Fahrzeuge freigegeben, keine Cloud-Konfigurationen deployed und keine Produktionsdaten verändert.
