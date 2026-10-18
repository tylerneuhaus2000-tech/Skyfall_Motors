# Frontend-Design — SKYFALL MOTORS

## Projekt in einem Satz

Ein digitales Premium-Autohaus, in dem Minecraft-Survival-Spieler Fahrzeuge und Motorsportangebote finden und später sicher verwalten können.

## Nutzer und Kernobjekte

- **Kunden:** suchen echte Pack-Fahrzeuge, prüfen Preis und Verfügbarkeit und möchten später bestellen oder Services buchen.
- **Mitarbeiter:** prüfen Fahrzeuge und pflegen Bestand, Bestellungen, Werkstatt und Rennen.
- **Fahrzeug:** Modell innerhalb eines bestimmten Content-Packs mit Version, Variante, Preis, Bildrechten und Freigabestatus.
- **Bestellung, Garage, Werkstattauftrag, Buchung, Rennen:** getrennte Vorgänge mit eigenem Status und nachvollziehbarer Änderungshistorie.

## Kernreisen

| Reise | Einstieg | Erste Entscheidung | Erfolg | Wiederherstellung |
|---|---|---|---|---|
| Fahrzeug finden | Startseite oder Katalog | Pack/Modell/Preis filtern | Verifizierte Fahrzeugdetails öffnen | Filter zurücksetzen, wenn keine Treffer |
| Bestellen (später) | Verifizierte Detailseite | Konfiguration und Übergabe prüfen | Serverseitiger Auftrag mit Status | Reservierungsfehler klar erklären, erneut versuchen |
| Service/Rennen (später) | Service- oder Race-Center-Seite | Angebot/Termin/Veranstaltung wählen | Bestätigter Auftrag oder Anmeldung | Konflikt und nächste verfügbare Aktion anzeigen |

## Produktstimmung und visuelle Richtung

- Commerce Trust und hochwertiges öffentliches Marketing.
- Premium Modern Minimal: warmes Off-White `#F5F3EE`, Anthrazit `#1B2025`, Sekundärtext `#687077`, warme Trennlinien `#E2DFD8` und zurückhaltendes Navy `#233D57`.
- Großzügig, redaktionell und fahrzeugorientiert; Mobilnavigation bleibt kompakt und vollständig.
- Klare, serifenlose Typografie, sachliche Fahrzeugdaten und rechteckige Bedienelemente statt dekorativer Dashboard-Kacheln.
- Keine Neon-Gaming-Optik, keine Pixel-Optik, keine generischen Dashboard-Kachelwände.
- Frei lizenzierte Realfahrzeug-Fotos dürfen als Referenzen dienen; sie müssen sichtbar von Ingame-Aufnahmen getrennt und mit Bildnachweis sowie Lizenz verlinkt sein. Keine KI-Bilder, die als Mod-Screenshots missverstanden werden können.

## UI-Grundlage

| Bereich | Entscheidung |
|---|---|
| Routing | Next.js App Router |
| Typen | TypeScript strict |
| Styling | Tailwind CSS plus semantische Projekttokens |
| Komponenten | Kleine projektspezifische Komponenten, native semantische Elemente zuerst |
| Tabellen/Formulare | Erst mit operativen Mitarbeiteroberflächen einführen |
| Produktsprache | Deutsch |
| Visuelle Prüfung | Desktop und Mobilgerät, Zustände für Laden/Leer/Fehler |

## UX-Grundsätze

- Primärhandlung und Verfügbarkeit stehen vor technischen Packdetails.
- `Bild folgt` und `In Prüfung` sind klare Zustände, keine dekorativen Badges.
- Nicht verifizierte Fahrzeuge sind nicht bestellbar.
- Preise erscheinen als SKYFALL-Verkaufspreise in Diamanten, nicht als Craftingkosten.
- Mobilansichten priorisieren Suche, Filter, Preis und nächsten möglichen Schritt.
- Interne IDs, Versionen und Quellen bleiben auf Details sekundär.

## Geprüftes Frontend-Handwerk

- Konsistenter Abstandsrhythmus, Typohierarchie und Aktionspriorität.
- Sichtbare Tastaturfokusse, beschriftete Controls und ausreichender Kontrast.
- Katalogzustände für Treffer, keine Treffer, ungeprüfte Kandidaten und fehlende Bilder.
- Keine Bestellbuttons auf inaktiven/ungeprüften Produktkarten.

## Änderungsverlauf

| Datum | Änderung | Grund |
|---|---|---|
| 18.10.2026 | Erstfassung Modern Minimal und Katalogregeln | Verbindliche Produktspezifikation |
| 18.10.2026 | Warme Premium-Palette, redaktionelle Startseite, responsiver Filter und Detailansicht | Einheitliche Markenführung über öffentliche, Kunden- und Mitarbeiterseiten |
| 18.10.2026 | Lizenzierte Realfahrzeug-Referenzen mit Bildnachweisen | Fahrzeugseiten visuell ergänzen, ohne sie als Mod-Aufnahmen auszugeben |
