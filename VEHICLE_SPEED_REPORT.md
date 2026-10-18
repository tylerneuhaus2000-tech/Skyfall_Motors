# SKYFALL MOTORS – Immersive Vehicles Geschwindigkeitsbericht

**Stand:** 18.10.2026  
**Ergebnis:** Keine Geschwindigkeit konnte für ein Fahrzeug aus einem lokalen Content-Pack-JAR berechnet oder im Spiel gemessen werden.

## Prüfung der Projektdateien

Im Projektverzeichnis wurden keine `.jar`, `.zip` oder `.mrpack`-Archive gefunden. `src/lib/pack-vehicle-data.json` ist ein Katalogindex mit Pack-/Asset-IDs und Anzeigenamen, enthält aber keine Fahrzeug-, Motor-, Getriebe- oder Rad-JSONs. Er reicht nicht für eine belastbare Geschwindigkeitsberechnung.

Der Index führt die folgenden angefragten Modelle. Das bestätigt lediglich den Katalogeintrag, nicht den Inhalt eines hier vorhandenen Archivs:

| Fahrzeugmodell | Content-Pack laut Index | Motor und Getriebe | Rechnerische Höchstgeschwindigkeit | Blöcke/s | Abhängigkeiten | Vertrauenswürdigkeit |
|---|---|---|---:|---:|---|---|
| BMW M3 GTR ALMS (E46) (`m3gtr`) | Craftspeed 1.7.5 | Unbekannt – Definitionen fehlen | Unbekannt | Unbekannt | Motor-, Gang-, Achsübersetzungs- und Radwahl nicht auswertbar | Keine Berechnung möglich |
| Lamborghini Huracan Evo (`huracanevo`) | Craftspeed 1.7.5 | Unbekannt – Definitionen fehlen | Unbekannt | Unbekannt | Motor-, Gang-, Achsübersetzungs- und Radwahl nicht auswertbar | Keine Berechnung möglich |
| Aston Martin Valkyrie (`valkyrie`) | Sphase Vehicle Mashup Pack 3.7.3 | Unbekannt – Definitionen fehlen | Unbekannt | Unbekannt | Motor-, Gang-, Achsübersetzungs- und Radwahl nicht auswertbar | Keine Berechnung möglich |
| Koenigsegg Jesko Attack (`koenigsegg_jesko`) | GT CRAFT 2.1.2 | Unbekannt – Definitionen fehlen | Unbekannt | Unbekannt | Motor-, Gang-, Achsübersetzungs- und Radwahl nicht auswertbar | Keine Berechnung möglich |

Die Fahrzeuge sind nach Blöcken/s nicht sortierbar, weil kein Zahlenwert belegt ist. Es wurden keine realen oder theoretischen Geschwindigkeiten eingesetzt.

## Physik und Berechnungsmethode

Der Immersive-Vehicles-Code koppelt bei angetriebenen Rädern die Engine-RPM an die Rad-Winkelgeschwindigkeit. Im Quellcode wird dabei unter anderem durch Gangübersetzung, Achsübersetzung und den Faktor `1200` (Ticks pro Minute bei 20 Ticks/s) geteilt. Die Fahrzeuggeschwindigkeit ergibt sich anschließend aus der Bewegung des Fahrzeugs; Radschlupf und Fahrwiderstände beeinflussen das Ergebnis.

Für eine **ideale kinematische Obergrenze ohne Schlupf** wäre eine Berechnung aus maximaler Motordrehzahl, höchstem Vorwärtsgang, Achsübersetzung und effektivem Raddurchmesser nötig. Diese wäre kein gemessener Ingame-Spitzenwert. Der tatsächlich erreichbare Wert hängt zusätzlich von Motorkraft, Masse, Traktion, Luft-/Fahrwiderständen, Untergrund, Schaden, Tuning und Spielkonfiguration ab. Die Pack-Making-Dokumentation bestätigt insbesondere die gemeinsame Bedeutung von Motorleistung und Übersetzung.

Verwendete Primärquellen zur Methode:

- [Immersive Vehicles – PartEngine.java](https://github.com/DonBruce64/MinecraftTransportSimulator/blob/master/mccore/src/main/java/minecrafttransportsimulator/entities/instances/PartEngine.java) – RPM-/Gang-/Achsübersetzungs-Kopplung und Radkräfte.
- [Immersive Vehicles – PartGroundDevice.java](https://github.com/DonBruce64/MinecraftTransportSimulator/blob/master/mccore/src/main/java/minecrafttransportsimulator/entities/instances/PartGroundDevice.java) – effektive Radgröße, Winkelgeschwindigkeit und Bodenbewegung.
- [Immersive Vehicles – EntityVehicleF_Physics.java](https://github.com/DonBruce64/MinecraftTransportSimulator/blob/master/mccore/src/main/java/minecrafttransportsimulator/entities/instances/EntityVehicleF_Physics.java) – Fahrzeuggeschwindigkeit und Kräfte/Widerstände.
- [Pack Making JSON Parts – offizielle IV-Wiki](https://github.com/DonBruce64/MinecraftTransportSimulator/wiki/Pack-Making-JSON-Parts) – Motorparameter und Getriebeübersetzungen; die Dokumentation weist darauf hin, dass Motorleistung und passende Übersetzung gemeinsam das Verhalten bestimmen.

Die herangezogenen Quellcode-Links beschreiben den Upstream-Quellstand. Da im Projekt weder ein Mod-JAR noch ein Content-Pack-JAR vorhanden ist, konnte nicht festgestellt werden, welche konkrete IV-Version auf dem Server läuft. Der Quellstand ist daher eine Referenz für die Methode, kein Nachweis der serverseitig installierten Version.

## Theorie vs. Messung

- **Theoretisch berechnet:** Für keines der Fahrzeuge möglich, da die notwendigen JSON-Werte fehlen.
- **Im Spiel gemessen:** Für keines der Fahrzeuge; es wurde keine Minecraft-Instanz mit den Fahrzeugen gefahren.
- **Katalogdaten:** Die Namen und Pack-Versionen stammen aus dem lokalen Projektindex und sind kein Ersatz für Archivdefinitionen.

## Benötigte Dateien für eine belastbare Fortsetzung

Bitte die tatsächlich auf dem Server verwendeten IV-Mod- und Content-Pack-JARs in einen lokalen Analyseordner im Projekt legen oder deren lokalen Pfad bereitstellen. Für einen gemessenen Ingame-Wert wird zusätzlich eine Testfahrt mit dokumentiertem Fahrzeug-Setup, Motor/Tuning, Gang, Strecke und Messmethode benötigt. Mit den Pack-Archiven lässt sich zunächst eine theoretische Gang-/Rad-Obergrenze berechnen; der reale Höchstwert bleibt separat als Messwert zu kennzeichnen.
