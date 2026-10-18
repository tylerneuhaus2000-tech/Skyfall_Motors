# SKYFALL MOTORS – Vehicle Image Recovery

Aktueller Folgebericht: [Bildrecherche für packbelegte Fahrzeuge, Phase 2](VEHICLE_IMAGE_RECOVERY_PHASE2_REPORT.md). Die Zahlen unten sind der historische Stand vor dieser Etappe.

Stand: 18.10.2026

## Ergebnis

| Kennzahl | Stand |
|---|---:|
| Katalogeinträge | 473 |
| Konservativ gruppierte Modellnamen/Generationen | 445 |
| Einträge mit Bild | 43 (vorher 25) |
| Platzhalter | 430 (vorher 448) |
| Packdatei-belegte Einträge mit Bild | 32 von 229 |
| Unterschiedliche verwendete Bilddateien | 23 |

Die 445 Gruppen entstehen, indem wiederholte Pack-Asset-Suffixe entfernt und identische Modellnamen zusammengeführt werden. Das ist eine konservative Zählung benannter Gruppen; Aliase oder mehrdeutige Namen wurden ohne eindeutigen Nachweis nicht zusätzlich zusammengelegt.

## Neue Bildquellen

In dieser Runde kamen acht lokal zugeschnittene und komprimierte Bilder hinzu. Sie decken teils mehrere nachweislich gleiche Packeinträge ab.

| Modellgruppe | Quelle / Urheber | Lizenzangabe | Lokale Datei |
|---|---|---|---|
| BMW M4 F82 | [Pexels – Shane West](https://www.pexels.com/photo/compact-executive-car-bmw-m4-f82-18726778/) | [Pexels-Lizenz](https://www.pexels.com/license/) | `public/images/vehicles/bmw-m4-f82-pexels.webp` |
| Datsun/Nissan 240Z | [Pexels – WAVYVISUALS](https://www.pexels.com/photo/a-datsun-240z-on-the-driveway-on-the-background-of-autumnal-trees-18818897/) | [Pexels-Lizenz](https://www.pexels.com/license/) | `public/images/vehicles/datsun-240z-pexels.webp` |
| Mitsubishi Lancer Evolution IX | [Pexels – Erik Mclean](https://www.pexels.com/photo/2006-mitsubishi-lancer-evolution-ix-9846172/) | [Pexels-Lizenz](https://www.pexels.com/license/) | `public/images/vehicles/mitsubishi-evolution-ix-pexels.webp` |
| Mazda RX-7 FD3S VeilSide Fortune | [Unsplash – Loris Boulinguez](https://unsplash.com/photos/an-orange-sports-car-parked-on-a-sunny-street-bJwEWrRLyhY) | [Unsplash-Lizenz](https://unsplash.com/license) | `public/images/vehicles/mazda-rx7-veilside-unsplash.webp` |
| Nissan Silvia S13 | [Pexels – Jacob Moore](https://www.pexels.com/photo/a-nissan-silvia-drifting-on-a-track-14411422/) | [Pexels-Lizenz](https://www.pexels.com/license/) | `public/images/vehicles/nissan-silvia-s13-pexels.webp` |
| Honda NSX erste Generation / E-NA1 | [Unsplash – Shoham Avisrur](https://unsplash.com/photos/silver-honda-nsx-sports-car-parked-outdoors-uk2XCmleXzM) | [Unsplash-Lizenz](https://unsplash.com/license) | `public/images/vehicles/honda-nsx-na1-unsplash.webp` |
| Nissan 180SX RPS13 | [Pexels – Erik Mclean](https://www.pexels.com/photo/nissan-180sx-on-an-underground-car-park-9661387/) | [Pexels-Lizenz](https://www.pexels.com/license/) | `public/images/vehicles/nissan-180sx-pexels.webp` |
| Nissan Skyline GT-R R32 / BNR32 | [Unsplash – JOHN BEARBY IMAGES](https://unsplash.com/photos/a-purple-race-car-on-a-road-hZ7jfy5oPME) | [Unsplash-Lizenz](https://unsplash.com/license) | `public/images/vehicles/nissan-skyline-r32-unsplash.webp` |

Die Fotos sind auf 1400 × 1050 px gebracht und als WebP gespeichert. Varianten wie die modifizierte R32-Track-Karosserie oder das Mazda-VeilSide-Kit sind in Bildunterschrift und Alternativtext kenntlich gemacht. Credits, Lizenzlinks und Dateipfade stehen außerdem zeilenweise in [`docs/research/vehicle-image-audit.csv`](docs/research/vehicle-image-audit.csv).

Der Nutzer hat die Verwendung für eine lokale Vorschau mit drei Personen freigegeben. Die Lizenzinformationen bleiben dokumentiert; eine öffentliche Veröffentlichung oder Weiterverteilung ist nicht Teil dieses Ergebnisses.

## Katalogdifferenz 468 → 473

Die aktuelle CSV enthält 229 Packdatei-belegte Fahrzeuge und 244 Kandidaten. Ältere Auditunterlagen nennen 468 Einträge. Bei unveränderter Packzahl entspräche das damals 239 Kandidaten, also fünf weniger. Im Projekt existiert weder ein Git-Repository noch ein archivierter 468-Zeilen-Katalogsnapshot. Daher sind die konkreten fünf IDs, ihre Quelle und der Änderungszeitpunkt nicht belegbar. Die Differenz ist dokumentiert, aber nicht spekulativ einzelnen Fahrzeugen zugeschrieben.

## Prüfung

- Alle 43 CSV-Bildpfade existieren; 23 unterschiedliche Dateien werden genutzt.
- Chromium lud alle 8 in dieser Runde neu eingebundenen Bilder auf Detailseiten. Die 15 weiterverwendeten bisherigen Bilder waren in der vorherigen Browserprüfung geladen.
- Desktop-Katalog bei 1440 px und Mobilansicht bei 390 px geprüft; Mobilansicht ohne horizontalen Überlauf.
- TypeScript-Typecheck und Biome-Check der Bildzuordnungen bestanden.
- Screenshots: [Desktop-Katalog](audit-screenshots/vehicle-images-recovery-desktop-catalog.png), [Mobil-Katalog](audit-screenshots/vehicle-images-recovery-mobile-catalog.png), [Nissan 180SX](audit-screenshots/vehicle-image-recovery-nissan180sx.png), [Nissan R32](audit-screenshots/vehicle-image-recovery-r32.png), [Honda NSX mobil](audit-screenshots/vehicle-image-recovery-nsx-mobile.png).
- Ein Honda-EK9-Foto wurde wegen des stark beschnittenen Ausschnitts verworfen. Es wurden keine KI-Bilder verwendet.

## Offen

- 430 Katalogzeilen bleiben Platzhalter, darunter 197 der 229 packbelegten Zeilen. Für nahezu alle dieser Modelle ist die Einzelrecherche noch nicht abgeschlossen.
- Im Projekt wurden keine Content-Pack-JARs mit nutzbaren Ingame-Ansichten gefunden. Es sind daher keine neuen Minecraft-Screenshots eingebunden.
- Wikimedia Commons hatte die frühere Abfrage mit HTTP 429 begrenzt. Diese Grenze wurde respektiert; es gab keine erneute API-Abfrage. Eine Openverse-Abfrage lieferte keinen Treffer beziehungsweise lief in einen Timeout und wurde nicht wiederholt.
- Die fünf zusätzlichen Katalogeinträge gegenüber dem älteren 468er-Stand bleiben mangels Historie nicht einzeln identifizierbar.
- Ein vorübergehender doppelter BMW-M4-Metadatensatz verursachte beim lokalen Öffnen einen Compile-Fehler. Die alte, nicht mehr verwendete Zuordnung wurde entfernt; Typecheck und Browserseiten liefen danach erfolgreich.
