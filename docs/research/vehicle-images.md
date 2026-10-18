# Fahrzeugbilder und Nutzungsrechte

Aktueller Stand nach Phase 2: **78/473** Katalogeinträge und **67/229** packbelegte Einträge mit lokalem Bild. Die vollständigen neuen Quellen und Bearbeitungshinweise stehen im [Phase-2-Bericht](../../VEHICLE_IMAGE_RECOVERY_PHASE2_REPORT.md) und in der [Pack-Statusliste](./vehicle-image-pack-status.csv). Die folgenden Zwischenstände dokumentieren frühere Rechercheblöcke.

Stand: 18.10.2026

## Ergebnis

- Dreiundzwanzig unterschiedliche Realfahrzeug-Fotos sind lokal eingebunden; sie decken derzeit 43 Katalogzeilen ab, weil gleiche, exakt bezeichnete Modelle in Pack- und Kandidatenlisten mehrfach vorkommen.
- Sie sind ausdrücklich als Referenzfotos und nicht als Minecraft-/Mod-Aufnahmen markiert.
- Die neu ergänzten Bilddateien wurden auf maximal 1400 px verkleinert und komprimiert; die Darstellung kann responsiv zuschneiden. CC-BY-SA-Dateien bleiben unter ihrer jeweiligen ursprünglichen Lizenz und werden mit Attribution und Lizenzlink ausgewiesen.
- Die vorhandenen Mod-/Pack-Promobilder sind als ARR markiert. Im Projekt liegen keine Content-Pack-JARs mit Screenshots; deshalb enthält dieser Rechercheblock passende Realfahrzeug-Referenzen statt extrahierter Packbilder. Die private lokale Nutzung der eingebundenen Fotos folgt der ausdrücklichen Nutzeranweisung; eine öffentliche Freigabe ist damit nicht dokumentiert.
- `imageStatus: "rights-open"` bezieht sich auf Ingame-/Pack-Bilder; Realfahrzeug-Referenzen sind separat in `src/lib/vehicle-images.ts` dokumentiert.
- Im Projekt liegen 473 Einträge (229 belegte Packmodelle und 244 Kandidaten), nicht 468. Die vollständige zeilenweise Abdeckung steht in [`vehicle-image-audit.csv`](./vehicle-image-audit.csv).

## Eingebundene Fotos

| Fahrzeug | Datei | Urheber | Lizenz | Quelle | Hinweis |
|---|---|---|---|---|---|
| Merc | `public/images/vehicles/mercedes-230.jpg` | Rutger van der Maar | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [Mercedes-Benz 230 W123 (1976)](https://commons.wikimedia.org/wiki/File:1976_Mercedes-Benz_230_(W123)_(52102422537).jpg) | Referenz; genaue Packvariante offen |
| Scout | `public/images/vehicles/international-scout.jpg` | Jeremy (Sydney, Australia) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [International Harvester Scout 80 (1964)](https://commons.wikimedia.org/wiki/File:1964_International_Harvester_Scout_80_utility_(25780691342).jpg) | Referenz; genaue Packvariante offen |
| GMC Brigadier | `public/images/vehicles/gmc-brigadier.jpg` | Mr.choppers | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | [GMC Brigadier 8000 (1986)](https://commons.wikimedia.org/wiki/File:1986_GMC_Brigadier_8000-series_4x2_Class_7_dump_truck.jpg) | Kipper-Aufbau, keine bestätigte Packvariante |
| Quad | `public/images/vehicles/quad-atv.jpg` | Royalbroil | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | [ATVs beim Eisrennen](https://commons.wikimedia.org/wiki/File:Quad_Ice_Racing_Tilleda_Thunder.jpg) | Kategorienreferenz; Hersteller offen |
| Highwayman | `public/images/vehicles/1957-corvette.jpg` | Jeremy (Sydney, Australia) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [Chevrolet Corvette C1 (1957)](https://commons.wikimedia.org/wiki/File:1957_Chevrolet_Corvette_C1_(24776392743).jpg) | Stilreferenz; exakte Corvette-Variante offen |
| Bell 206 | `public/images/vehicles/bell-206-reference.jpg` | Schlurcher | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [Bell 206 JetRanger](https://commons.wikimedia.org/wiki/File:Bell_206_JetRanger.JPG) | Realfahrzeug-Referenz; kein Pack-Screenshot |
| Ford Mustang 1969 | `public/images/vehicles/1969-ford-mustang-reference.jpg` | IFCAR | [Public Domain](https://commons.wikimedia.org/wiki/Template:PD-self) | [1969 Ford Mustang](https://commons.wikimedia.org/wiki/File:1969-Ford-Mustang.jpg) | Realfahrzeug-Referenz; kein Pack-Screenshot |
| BMW M3 (E30) | `public/images/vehicles/bmw-m3-e30-reference.jpg` | Ethan Llamas | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [BMW M3 E30 black (1)](https://commons.wikimedia.org/wiki/File:BMW_M3_E30_black_(1).jpg) | Exakte Modellgeneration; verkleinert und komprimiert |
| BMW M3 (E46) | `public/images/vehicles/bmw-m3-e46-reference.jpg` | Bull-Doser | [Public Domain (PD-self)](https://commons.wikimedia.org/wiki/Template:PD-self) | [BMW M3 E46 Orange Julep](https://commons.wikimedia.org/wiki/File:BMW_M3_E46_(Orange_Julep).JPG) | Exakte Modellgeneration; verkleinert und komprimiert |
| BMW M5 (E39) | `public/images/vehicles/bmw-m5-e39-reference.jpg` | nakhon100 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [BMW M5 E39](https://commons.wikimedia.org/wiki/File:BMW_M5_E39_(5676042701).jpg) | Exakte Modellgeneration; verkleinert und komprimiert |
| BMW M4 (F82) | `public/images/vehicles/bmw-m4-f82-pexels.webp` | Shane West | [Pexels-Lizenz](https://www.pexels.com/license/) | [BMW M4 F82](https://www.pexels.com/photo/compact-executive-car-bmw-m4-f82-18726778/) | Exakte Modellgeneration; 1400 × 1050 WebP; Attribution freiwillig |
| Ford Mustang Dark Horse (S650) | `public/images/vehicles/mustang-dark-horse-reference.jpg` | Alexandre Prevot | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | [Ford Mustang Dark Horse](https://commons.wikimedia.org/wiki/File:Ford_Mustang_Dark_Horse_(53332672885).jpg) | Exakte Ausführung; verkleinert und komprimiert |
| Nissan Skyline GT-R (R34) | `public/images/vehicles/nissan-skyline-r34-reference.jpg` | Espsko | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | [Nissan Skyline GT-R34](https://commons.wikimedia.org/wiki/File:Nissan_Skyline_GT-R34.jpg) | Exakte Modellgeneration; verkleinert und komprimiert |
| Lamborghini Huracán EVO | `public/images/vehicles/lamborghini-huracan-evo-reference.jpg` | Calreyn88 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [Lamborghini Huracan EVO](https://commons.wikimedia.org/wiki/File:Lamborghini_Huracan_EVO.jpg) | Exakte EVO-Ausführung; nicht der Spyder; verkleinert und komprimiert |
| Porsche 911 Turbo (930) | `public/images/vehicles/porsche-911-930-reference.jpg` | Calreyn88 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [Porsche 911 930 Turbo](https://commons.wikimedia.org/wiki/File:Porsche_911_930_Turbo.jpg) | Exakte Modellreihe; keine Slantnose-Variante; verkleinert und komprimiert |
| Ferrari F40 | `public/images/vehicles/ferrari-f40-reference.jpg` | Adriano | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) und GFDL 1.2+ | [Ferrari F40](https://commons.wikimedia.org/wiki/File:Ferrari_F40.JPG) | Exaktes Modell; Aufnahme in Ausstellung; verkleinert und komprimiert |

Bildcredits und Lizenzlinks sind auf den Karten sowie der Detailseite sichtbar. Die Fotoquellen bestätigen jeweils die oben genannte Lizenz und Urheberschaft. Der OAmP-Versionshinweis beschreibt den Highwayman als Corvette der 1950er-Jahre; das konkrete 1957-Foto bleibt eine Stilreferenz, keine bestätigte Ingame-Variante.

## Neu recherchierte und zugeordnete Fotos – Block 1 (18.10.2026)

| Modell | Datei | Urheber | Lizenz / Quelle | Zuordnung und Hinweis |
|---|---|---|---|---|
| Datsun 240Z | `public/images/vehicles/datsun-240z-pexels.webp` | WAVYVISUALS | [Pexels](https://www.pexels.com/photo/a-datsun-240z-on-the-driveway-on-the-background-of-autumnal-trees-18818897/) · [Lizenz](https://www.pexels.com/license/) | Exaktes Modell; Quelle nennt kein Baujahr. Realfahrzeug-Referenz. |
| Mitsubishi Lancer Evolution IX (2006) | `public/images/vehicles/mitsubishi-evolution-ix-pexels.webp` | Erik Mclean | [Pexels](https://www.pexels.com/photo/2006-mitsubishi-lancer-evolution-ix-9846172/) · [Lizenz](https://www.pexels.com/license/) | Auf EVO-IX-Basis und genau benannten Kandidaten abgebildet; nicht als Polizeilackierung ausgegeben. |
| Mazda RX-7 FD3S VeilSide Fortune | `public/images/vehicles/mazda-rx7-veilside-unsplash.webp` | Loris Boulinguez (cli_k) | [Unsplash](https://unsplash.com/photos/an-orange-sports-car-parked-on-a-sunny-street-bJwEWrRLyhY) · [Lizenz](https://unsplash.com/license) | Exakte FD3S/VeiSide-Fortune-Ausführung; bei normalen FD3S-Einträgen als abweichende Karosserie ausdrücklich bezeichnet. |
| Nissan Silvia S13 | `public/images/vehicles/nissan-silvia-s13-pexels.webp` | Jacob Moore | [Pexels](https://www.pexels.com/photo/a-nissan-silvia-drifting-on-a-track-14411422/) · [Lizenz](https://www.pexels.com/license/) | Exaktes S13-Modell, modifizierte Drift-/Rennversion; entsprechend beschriftet. |
| Honda NSX erste Generation / E-NA1 | `public/images/vehicles/honda-nsx-na1-unsplash.webp` | Shoham Avisrur | [Unsplash](https://unsplash.com/photos/silver-honda-nsx-sports-car-parked-outdoors-uk2XCmleXzM) · [Lizenz](https://unsplash.com/license) | Sichtbare Klappscheinwerfer und Karosserie passen zur ersten NSX-Generation; nur dem E-NA1-Packeintrag zugeordnet, nicht generischen NSX-Kandidaten oder VeilSide-Fahrzeug. |

Pexels und Unsplash erlauben nach ihren jeweiligen Plattformlizenzen kostenlose Nutzung und Bearbeitung; bei beiden ist Attribution freiwillig. Auf ausdrückliche Nutzeranweisung ist die aktuelle Verwendung auf eine private lokale Vorschau mit drei Personen begrenzt; sie ist nicht als Veröffentlichungsfreigabe dokumentiert. Sie bleibt dennoch als nachvollziehbarer Credit auf der Fahrzeugansicht erhalten. Alle sechs lokalen Dateien sind auf 1400 × 1050 px zugeschnitten und als WebP komprimiert. Neue Quellen sind die Bildseiten von Pexels und Unsplash; historische Wikimedia-Commons-Quellen bleiben erhalten. Nicht genutzte Suchtreffer wurden verworfen, wenn die Generation/Variante nicht passte oder das Fahrzeug zu eng abgeschnitten war. Keine Commons-API-Abfrage wurde wiederholt; die dokumentierte HTTP-429-Grenze wurde respektiert.

### Zwischenstand nach Rechercheblock 1

- Katalogzeilen mit lokalem Bild: **39/473** (vorher 25/473); verbleibende Platzhalter: **434**.
- Packdatei-belegte Zeilen mit Bild: **29/229**; Pack-Screenshots selbst bleiben mangels Rechtefreigabe ausgeschlossen.
- Unterschiedliche verwendete Bilddateien: **21**.
- Die 473 Zeilen ergeben **445 konservativ zusammengefasste Modellnamens-/Generationsgruppen**, nachdem nur wiederholte Pack-Asset-Suffixe entfernt und identische Namen zusammengeführt wurden. Das ist keine vollständige physische Modellzählung: mehrdeutige oder aliasartige Namen bleiben getrennt, solange Belege zum Zusammenführen fehlen.
- Kataloghistorie: ältere Audittexte nennen 468 Zeilen, aktuelle CSV enthält 473 (229 Packmodelle + 244 Kandidaten). Das Projekt enthält kein Git-Repository und keinen archivierten 468-Zeilen-Snapshot. Damit lässt sich nur eine Differenz von **fünf Zeilen** feststellen; ihre IDs, Quelle und Änderungszeit sind nicht rekonstruierbar. Packmodell-Zeilen sind weiterhin 229. Es wäre unbelegt, die fünf als neu hinzugekommene Fahrzeuge oder Pack-Inhalte zu bezeichnen.

## Neu recherchierte Fotos – Block 2 (18.10.2026)

| Modell | Datei | Urheber | Lizenz / Quelle | Zuordnung und Hinweis |
|---|---|---|---|---|
| Nissan 180SX RPS13 | `public/images/vehicles/nissan-180sx-pexels.webp` | Erik Mclean | [Pexels](https://www.pexels.com/photo/nissan-180sx-on-an-underground-car-park-9661387/) · [Lizenz](https://www.pexels.com/license/) | Exaktes Modell und Packgeneration; modifizierter Wagen in dunkler Tiefgarage. |
| Nissan Skyline GT-R R32 / BNR32 | `public/images/vehicles/nissan-skyline-r32-unsplash.webp` | JOHN BEARBY IMAGES | [Unsplash](https://unsplash.com/photos/a-purple-race-car-on-a-road-hZ7jfy5oPME) · [Lizenz](https://unsplash.com/license) | R32 GT-R; sichtbar modifiziertes Widebody-Track-Fahrzeug. Als abweichende Karosserievariante gekennzeichnet. Für R32 und BNR32 benannt; nicht auf andere Skyline-Generationen übertragen. |

Beide Fotos wurden visuell geprüft, auf 1400 × 1050 px zugeschnitten und als WebP komprimiert. Unsplash/Pexels kennzeichnen die Bilder als kostenlos nutzbar; die Attribution bleibt sichtbar. Die Aufnahme für den ähnlich aussehenden, aber eigenständigen R32-Coupé ohne GT-R-Kennung wurde nicht zugeordnet. Eine Kandidatenzeile BNR32 erhält dieselbe passende Referenz, bleibt jedoch als nicht verifiziert gekennzeichnet. Der Besitzer hat die Nutzung für die lokale Vorschau mit drei Personen freigegeben; das ist keine Freigabe zur öffentlichen Veröffentlichung oder Weiterverteilung. Der gefundene Civic-EK9-Treffer wurde wegen des stark abgeschnittenen Ausschnitts verworfen.

### Zwischenstand nach Rechercheblock 2

- Katalogzeilen mit lokalem Bild: **43/473**; verbleibende Platzhalter: **430**.
- Packdatei-belegte Zeilen mit Bild: **32/229**.
- Unterschiedliche verwendete Bilddateien: **23**.
- Der konservative Modellnamens-/Generationsstand bleibt **445 Gruppen**.

## Abdeckung und Grenzen der Recherche (18.10.2026)

- Nach Rechercheblock 2 sind 43 von 473 Einträgen (9,1%) mit einem lokal eingebundenen Referenzfoto versorgt. Die Abdeckung in unterschiedlichen Bilddateien beträgt 23 Fotos. Die CSV ist der zeilenweise, aktuelle Stand.
- Für Einträge ohne Bild wird nicht behauptet, die vollständige Einzelrecherche sei abgeschlossen. Commons-Suchen wurden gezielt wiederholt und eine automatisierte Vollabfrage versucht; Wikimedia Commons begrenzte die Anfragen mit HTTP 429. Die verbleibenden Zeilen sind daher ausdrücklich als Recherche offen markiert.
- Die Mod-/Pack-Abbildungen wurden anhand der offiziellen Projektseiten geprüft. OCP, OAmP, Craftspeed, SVMP, GT CRAFT und R.A.G.E kennzeichnen die Dateien als All Rights Reserved beziehungsweise ARR. Daher sind Screenshots daraus ohne gesonderte Erlaubnis nicht lokal eingebunden.
- Es wurden keine KI-Bilder und keine zufälligen Ersatzfotos hinzugefügt. Nicht eindeutig passende Varianten, etwa Polizei-Ausführungen oder generische Modellnamen ohne bestätigte Generation, bleiben ohne Zuordnung.
- Lokaler Chromium-Test: die 15 bisherigen, weiterhin genutzten Fotos waren in der vorherigen Prüfung geladen; in dieser Runde wurden alle 8 neu eingebundenen Fotos in Detailseiten geprüft. Das ergibt Browsernachweis für 23/23 aktuell genutzte Dateien. Desktop 1440 px und Mobil 390 px geprüft; bei 390 px kein horizontaler Überlauf.
- Screenshots dieser Runde: [`vehicle-images-recovery-desktop-catalog.png`](../../audit-screenshots/vehicle-images-recovery-desktop-catalog.png), [`vehicle-images-recovery-mobile-catalog.png`](../../audit-screenshots/vehicle-images-recovery-mobile-catalog.png), [`vehicle-image-recovery-nissan180sx.png`](../../audit-screenshots/vehicle-image-recovery-nissan180sx.png), [`vehicle-image-recovery-r32.png`](../../audit-screenshots/vehicle-image-recovery-r32.png), [`vehicle-image-recovery-nsx-mobile.png`](../../audit-screenshots/vehicle-image-recovery-nsx-mobile.png).

Vollständige Tabelle je Katalog-ID: [`vehicle-image-audit.csv`](./vehicle-image-audit.csv).

## Quellen zur Rechteprüfung

- [OCP – Modrinth-Lizenz und Release](https://modrinth.com/mod/immersive-vehicles-official-content-pack/version/f4rn8RAt)
- [OAmP V3 – Fahrzeughinweis zum Highwayman](https://modrinth.com/mod/immersive-vehicles-official-automobile-pack/version/OAmP-V3)
- [OAmP – CurseForge-Datei](https://www.curseforge.com/minecraft/mc-mods/mts-iv-official-automobile-pack/files/7933542)
- [Craftspeed – CurseForge-Datei](https://www.curseforge.com/minecraft/mc-mods/immersive-vehicles-craftspeed/files/8605108)
- [SVMP – CurseForge-Projekt und Serverhinweis](https://www.curseforge.com/minecraft/mc-mods/iv-mts-sphase-vehicle-mashup-pack-svmp)
- [R.A.G.E – CurseForge-Projekt](https://www.curseforge.com/minecraft/mc-mods/immersive-vehicles-blocky-rage)
- [GT CRAFT – CurseForge-Projekt](https://www.curseforge.com/minecraft/mc-mods/gt-craft-iv-mts)
- [OCP – CurseForge-Projekt mit Lizenzangabe „All Rights Reserved“](https://www.curseforge.com/minecraft/mc-mods/transport-simulator-official-vehicle-set)

## Premium-Sortiment: lizenzierte WebP-Referenzbilder

Alle 16 offiziellen Premium-Fahrzeuge haben ein lokal gespeichertes, responsives WebP-Referenzbild. Das Bild zeigt ein reales Fahrzeug und ist kein Nachweis für Serverinstallation oder exakte Ingame-Lackierung. Bestehende Fotoquellen stehen im Code in `src/lib/vehicle-images.ts`; die sechs neu recherchierten Quellen:

| SKYFALL-Modell | Bilddatei | Urheber | Quelle | Lizenz | Bearbeitung |
|---|---|---|---|---|---|
| BMW M3 GTR E46 | `premium-bmw-m3-gtr-e46.webp` | David Merrett (Dave Hamster) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:BMW_M3_E46_GTR.jpg) | CC BY 2.0 | Verkleinert/WebP; Attribution |
| Ferrari Challenge Stradale | `premium-ferrari-challenge-stradale.webp` | Mustang Joe (Joe deSousa) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:2004_Ferrari_360_Challenge_Stradale.jpg) | CC0 1.0 | Verkleinert/WebP |
| Lotus Evija | `premium-lotus-evija.webp` | Liam Walker | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:2020_Lotus_Evija.jpg) | CC BY-SA 4.0 | Verkleinert/WebP; Attribution/Share-Alike |
| De Tomaso Pantera GT5-S | `premium-de-tomaso-pantera-gt5s.webp` | Sicnag | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:1976_DeTomaso_Pantera_GT5S.jpg) | CC BY 2.0 | Verkleinert/WebP; Attribution |
| Wiesmann GT MF5 | `premium-wiesmann-gt-mf5.webp` | Calreyn88 | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:2017_Wiesmann_MF5_GT.jpg) | CC BY-SA 4.0 | Verkleinert/WebP; Attribution/Share-Alike |
| Toyota Supra A80 RZ | `premium-toyota-supra-a80.webp` | Falcon® Photography | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Toyota_E-JZA80_Supra_RZ_(20122617014).jpg) | CC BY-SA 2.0 | Verkleinert/WebP; Attribution/Share-Alike |

Abgeleitete CC BY-SA Bilder werden nach der jeweiligen Share-Alike-Lizenz weitergegeben. Bildcredits und Lizenzlinks sind an den Fahrzeugkarten und Detailseiten sichtbar. Beim RX-7-Foto ist ein VeilSide-Fortune-Kit sichtbar; es ist als modifizierte Referenzausführung gekennzeichnet.
