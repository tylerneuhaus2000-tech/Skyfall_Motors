# Frontend-Vertrag — SKYFALL MOTORS

## Feste Regeln

- Keine Secrets, Zugangsdaten oder privaten URLs im Client.
- Jede asynchrone Kernansicht hat Lade-, Leer- und Fehlerzustände.
- Geschäftsstatus werden für Spieler in verständliche deutsche Sprache übersetzt.
- Ungeprüfte Fahrzeuge lassen sich nicht bestellen.
- Keine erfundenen Screenshots, Fahrzeugfunktionen, Liefertermine oder Zahlungsergebnisse.
- Risikoaktionen brauchen Bestätigung und eine nachvollziehbare Rückmeldung.
- Lange Modellnamen, Varianten und Packnamen dürfen das Layout nicht brechen.
- Mobile Ansichten müssen Suche und wichtigste nächste Handlung erhalten.

## Flächen und Aufgaben

| Oberfläche | Muster | Grenze |
|---|---|---|
| Startseite | Editorialer Einstieg → verfügbare Inhalte → nächster Schritt | Keine Fake-Bestände oder Zahlen |
| Fahrzeugkatalog | Suche/Filter → scanbare Fahrzeugkarten → Details | Entwürfe klar markieren, nicht kaufbar |
| Fahrzeugdetails | Variante/Pack/Version → Preis/Verfügbarkeit → nächste Aktion | Quellen und Bildstatus nachvollziehbar |
| Mitarbeiterbereich | Status und Aufgaben → gefilterte Liste → Detailaktion | Rollen serverseitig prüfen; keine reine UI-Sperre |

## Kopie und Zustand

- Erst verständliche Aussage, dann technischer Detailtext.
- Kein Treffer: Filter anpassen oder zurücksetzen.
- Dienst nicht eingerichtet: klar sagen, welcher Ablauf noch nicht verfügbar ist.
- Fehlgeschlagene kritische Aktion: Ergebnisstatus benennen und sichere Wiederholung ermöglichen.
- `Draft`, `Unavailable`, `Pending` erscheinen im Produkt als „Entwurf“, „Nicht verfügbar“, „In Prüfung“.

## Prüfgates für Kernseiten

- [ ] Desktop-Hierarchie und Abstände stimmen.
- [ ] Mobile Aufgabe ist ohne horizontales Scrollen möglich.
- [ ] Lade-, Leer- und Fehlerzustände sind lesbar.
- [ ] Tastaturbedienung und Fokus sind sichtbar.
- [ ] Keine nicht belegten Produktbehauptungen.
- [ ] Technische Kennungen sind sekundär.
