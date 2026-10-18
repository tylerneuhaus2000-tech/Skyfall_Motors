# SKYFALL MOTORS – Bildrecherche für packbelegte Fahrzeuge, Phase 2

Stand: 18.10.2026

## Abdeckung

| Kennzahl | Vorher | Jetzt |
|---|---:|---:|
| Packbelegte Einträge mit Foto | 32/229 | **67/229** |
| Packbelegte Einträge ohne Foto | 197 | **162** |
| Gesamter Katalog mit Foto | 43/473 | **78/473** |
| Gesamter Katalog ohne Foto | 430 | **395** |

Diese Etappe ergänzt **24 neue lokale Fotos** für 34 Packeinträge und nutzt ein bereits vorhandenes, passendes Mustang-Dark-Horse-Foto für einen weiteren Packeintrag. Die Fotos zeigen reale Fahrzeuge als Referenz, keine Aufnahmen aus dem Minecraft-Pack. Unter den 229 Packeinträgen ergeben identische Namen nach Entfernen der Asset-Suffixe 211 Namensgruppen. Das ist keine sichere Zahl verschiedener Karosserievarianten: Varianten mit gleichem Basisnamen bleiben getrennt, wenn Aufbau oder Generation abweichen. Die 35 konkreten Zuordnungen und alle offenen Packeinträge stehen in der [Pack-Statusliste](docs/research/vehicle-image-pack-status.csv).

## Neue Bildquellen und Wiederverwendung

| Modellgruppe / Pack-IDs | Foto / Urheber | Lizenz | Lokale Datei |
|---|---|---|---|
| Ford Mustang Fastback von 1967; GT-Ausstattung mit roter Zierlinie, keine Pack-Aufnahme.<br>`craftspeed-1967fordmustang` | [Xnatedawgx](https://commons.wikimedia.org/wiki/File:1967_Ford_Mustang_GT_fastback,_black_with_red_trim,_front,_Golden_Super_Cruise_2026-07-04.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | `public/images/vehicles/ford-mustang-1967-fastback.webp` |
| Dodge Coronet Super Bee von 1970; keine Polizeilackierung und keine Pack-Aufnahme.<br>`craftspeed-coronet`<br>`craftspeed-coronetp` | [Sicnag](https://commons.wikimedia.org/wiki/File:1970_Dodge_Coronet_Super_Bee_(cropped).jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | `public/images/vehicles/dodge-coronet-super-bee-1970.webp` |
| Ford Mustang GT Coupé von 2000; keine Polizeilackierung und keine Pack-Aufnahme.<br>`craftspeed-sn95`<br>`craftspeed-sn95p` | [GPS 56](https://commons.wikimedia.org/wiki/File:2000_Ford_Mustang_Gt_(16720750121).jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | `public/images/vehicles/ford-mustang-gt-2000.webp` |
| Ford Mustang GT Convertible von 2000; Realfahrzeug-Referenz, keine Pack-Aufnahme.<br>`craftspeed-sn95convertible` | [Elise240SX](https://commons.wikimedia.org/wiki/File:2000_Ford_Mustang_GT_Convertible_in_Atlantic_Blue_Clearcoat_Metallic,_Front_Right,_05-27-2023.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | `public/images/vehicles/ford-mustang-gt-convertible-2000.webp` |
| Hyundai i30 N Facelift; 2022er Referenz für den 2023er Pack-Eintrag, ohne Polizeilackierung.<br>`craftspeed-i30n`<br>`craftspeed-i30np` | [Calreyn88](https://commons.wikimedia.org/wiki/File:2022_Hyundai_i30_N_T-GDi_Auto.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | `public/images/vehicles/hyundai-i30-n-2022.webp` |
| BMW M6 Coupé (E63); keine Polizeilackierung und keine Pack-Aufnahme.<br>`craftspeed-e63`<br>`craftspeed-e63p` | [OSX](https://commons.wikimedia.org/wiki/File:2005-2010_BMW_M6_(E63)_coupe_(2011-11-08).jpg) | [Public Domain (PD-self)](https://commons.wikimedia.org/wiki/Template:PD-self) | `public/images/vehicles/bmw-m6-e63.webp` |
| BMW Z8; keine Polizeilackierung und keine Pack-Aufnahme.<br>`craftspeed-z8`<br>`craftspeed-z8p` | [Luc106](https://commons.wikimedia.org/wiki/File:BMW_Z8_Front-view.JPG) | [Public Domain (PD-self)](https://commons.wikimedia.org/wiki/Template:PD-self) | `public/images/vehicles/bmw-z8.webp` |
| Volkswagen Passat R36 B6 Limousine; keine Polizeilackierung und keine Pack-Aufnahme.<br>`craftspeed-passatr36`<br>`craftspeed-passatr36p` | [OSX](https://commons.wikimedia.org/wiki/File:2008_Volkswagen_Passat_(3C)_R36_4MOTION_sedan_(2010-07-19)_01.jpg) | [Public Domain (PD-self)](https://commons.wikimedia.org/wiki/Template:PD-self) | `public/images/vehicles/vw-passat-r36-sedan.webp` |
| Volkswagen Passat R36 B6 Variant; keine Polizeilackierung und keine Pack-Aufnahme.<br>`craftspeed-passatr36variant`<br>`craftspeed-passatr36variantp` | [Rudolf Stricker](https://commons.wikimedia.org/wiki/File:VW_Passat_Variant_R36_front_20080801.jpg) | [Attribution only](https://commons.wikimedia.org/wiki/File:VW_Passat_Variant_R36_front_20080801.jpg) | `public/images/vehicles/vw-passat-r36-variant.webp` |
| Aston Martin Valkyrie; Foto einer frühen Präsentationsausführung von 2018, keine Pack-Aufnahme.<br>`svmp-valkyrie` | [Bertel Schmitt](https://commons.wikimedia.org/wiki/File:AstonMartin_Valkyrie.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | `public/images/vehicles/aston-martin-valkyrie.webp` |
| Toyota Sprinter Trueno AE86 Dreitürer; 1985er GTV als Generationsreferenz, genaue Zenki-Ausstattung nicht belegt.<br>`craftspeed-ae86`<br>`gt-craft-toyota-ae86-trueno`<br>`gt-craft-toyota-ae86-truenoe` | [Tokumeigakarinoaoshima](https://commons.wikimedia.org/wiki/File:Toyota_SPRINTER_TRUENO_3door_(AE86)_front.JPG) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `public/images/vehicles/toyota-sprinter-trueno-ae86.webp` |
| Lancia Delta HF Integrale; Straßenfahrzeug-Referenz, keine Pack-Aufnahme.<br>`craftspeed-delta` | [Brian Snelson](https://commons.wikimedia.org/wiki/File:LanciaDeltaHFintegrale.jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | `public/images/vehicles/lancia-delta-hf-integrale.webp` |
| Mazda MX-5 (NA) mit geschlossenem Stoffverdeck; keine Pack-Aufnahme.<br>`craftspeed-mx5` | [Rudolf Stricker](https://commons.wikimedia.org/wiki/File:Mazda_MX-5_front_20080704.jpg) | [Attribution only](https://commons.wikimedia.org/wiki/File:Mazda_MX-5_front_20080704.jpg) | `public/images/vehicles/mazda-mx5-na.webp` |
| Chevrolet Corvette C6 Z06 von 2006; keine Pack-Aufnahme.<br>`craftspeed-c6z06` | [Sicnag](https://commons.wikimedia.org/wiki/File:2006_Chevrolet_Corvette_C6_Z06.jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | `public/images/vehicles/chevrolet-corvette-c6-z06.webp` |
| Toyota GR Supra A90; sichtbarer Umbau mit Splitter, Rädern und Heckflügel, nicht die Serienausführung.<br>`craftspeed-supra` | [Thomas Vogt](https://commons.wikimedia.org/wiki/File:Toyota_GR_Supra_(A90)_(52591030974).jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | `public/images/vehicles/toyota-gr-supra-a90.webp` |
| Koenigsegg Jesko Attack von 2023; Realfahrzeug-Referenz, keine Pack-Aufnahme.<br>`gt-craft-koenigsegg-jesko` | [Calreyn88](https://commons.wikimedia.org/wiki/File:2023_Koenigsegg_Jesko_Attack.jpg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `public/images/vehicles/koenigsegg-jesko-attack.webp` |
| Lexus LFA; Standardmodell, nicht die Nürburgring-Ausführung.<br>`gt-craft-lexus-lfa` | [Tokumeigakarinoaoshima](https://commons.wikimedia.org/wiki/File:Lexus_LFA_1.JPG) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `public/images/vehicles/lexus-lfa.webp` |
| Lotus Elise SC (Series 2) von 2007; Präsentationsfahrzeug, keine Pack-Aufnahme.<br>`craftspeed-elise` | [Hatsukari715](https://commons.wikimedia.org/wiki/File:2007_Lotus_Elise_SC.JPG) | [Public Domain (PD-self)](https://commons.wikimedia.org/wiki/Template:PD-self) | `public/images/vehicles/lotus-elise-sc-s2.webp` |
| Nissan GT-R R35; modifizierte Räder, Sitze und Zierstreifen sichtbar. Keine Pack-Polizeilackierung.<br>`craftspeed-r35`<br>`craftspeed-r35police` | [Nika Qufarashvili](https://unsplash.com/photos/a-blue-sports-car-parked-in-a-parking-lot-DdF1pw3a7pk) | [Unsplash-Lizenz](https://unsplash.com/license) | `public/images/vehicles/nissan-gtr-r35-unsplash.webp` |
| Nissan Silvia S15; sichtbare Umbauten an Stoßfänger und Rädern, Spec.R-Ausstattung am Foto nicht belegbar.<br>`gt-craft-nissan-s15` | [Jagjeet Dhuna](https://www.pexels.com/photo/front-view-of-modified-nissan-silvia-s15-at-car-meet-31618534/) | [Pexels-Lizenz](https://www.pexels.com/license/) | `public/images/vehicles/nissan-silvia-s15-pexels.webp` |
| Toyota GT86 (ZN6); Frontsplitter, dunkle Räder und Aufkleber weichen vom Serienzustand ab.<br>`gt-craft-toyota-zn6` | [Erik Mclean](https://www.pexels.com/photo/white-toyota-gt86-25955747/) | [Pexels-Lizenz](https://www.pexels.com/license/) | `public/images/vehicles/toyota-gt86-zn6-pexels.webp` |
| Toyota MR2 (SW20); sichtbare Umbauten an Front, Rädern und Karosserie, G-Limited-Ausstattung nicht belegt.<br>`gt-craft-toyota-sw20` | [Vitali Adutskevich](https://www.pexels.com/photo/toyota-mr2-on-pavement-16350154/) | [Pexels-Lizenz](https://www.pexels.com/license/) | `public/images/vehicles/toyota-mr2-sw20-pexels.webp` |
| Volkswagen Golf R32 (Mk4); R32-Emblem und vierte Generation sichtbar, keine Pack-Aufnahme.<br>`craftspeed-golf4` | [Sevan Mammoli](https://www.pexels.com/photo/view-of-a-silver-volkswagen-golf-r32-parked-in-sunlight-16296957/) | [Pexels-Lizenz](https://www.pexels.com/license/) | `public/images/vehicles/vw-golf-r32-mk4-pexels.webp` |
| Chevrolet Corvette C5; Zubehörfelgen und abweichende Motorhaube sichtbar, keine Pack-Aufnahme.<br>`gt-craft-chevrolet-c5` | [Darion Prioleau](https://unsplash.com/photos/blue-chevrolet-corvette-c5-veFStibgfq8) | [Unsplash-Lizenz](https://unsplash.com/license) | `public/images/vehicles/chevrolet-corvette-c5-unsplash.webp` |

| Wiederverwendetes Foto | Quelle / Urheber | Lizenz | Lokale Datei |
|---|---|---|---|
| `craftspeed-s650p` – Ford Mustang Dark Horse S650; Polizeilackierung fehlt im Referenzfoto | [Alexandre Prevot](https://commons.wikimedia.org/wiki/File:Ford_Mustang_Dark_Horse_(53332672885).jpg) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | `public/images/vehicles/mustang-dark-horse-reference.jpg` |

Die Quellen, Urheber, Lizenzen, Bildunterschriften und Hinweise zu sichtbaren Umbauten stehen zusätzlich in `src/lib/vehicle-images.ts` und zeilenweise in der [vollständigen Bild-Audit-CSV](docs/research/vehicle-image-audit.csv). Verwendete Quelle: Wikimedia Commons (18 Fotos), Unsplash (2), Pexels (4). Die Auswahl erfolgte nach exaktem Modell beziehungsweise belegter Generation; Polizeivarianten werden als normale Basisfahrzeuge mit entsprechendem Hinweis gezeigt. Sichtbare Umbauten bei Toyota GR Supra A90, Toyota GT86 ZN6, Toyota MR2 SW20, Chevrolet Corvette C5, Nissan GT-R R35 und Nissan Silvia S15 sind in den Bildunterschriften vermerkt.

## Verarbeitung und Rechte

- Alle 20 neuen Dateien wurden lokal als WebP auf 1400 × 1050 px gebracht; je nach Ausgangsformat zugeschnitten oder mit einem unscharfen Hintergrund aus demselben Foto ergänzt. Keine Wasserzeichen entfernt und keine KI-Bilder erzeugt.
- Bei CC BY ist die Namensnennung erforderlich; bei CC BY-SA stehen die abgeleiteten WebP-Dateien unter derselben Lizenzversion wie die jeweilige Vorlage. Das Frontend verlinkt Fotograf und Lizenz am Bild. Bei „Attribution only“ ist die Namensnennung erforderlich. Pexels und Unsplash erlauben die hier vorgenommene Bearbeitung und Verwendung nach ihren Plattformlizenzen; Credits bleiben freiwillig sichtbar.
- Die Aufnahmen beweisen weder eine tatsächliche Serverinstallation noch eine identische Ingame-Gestaltung. Die vorhandenen Verfügbarkeits- und Freigabestände wurden nicht geändert.

## Recherchegrenzen und offene Zuordnungen

- **162 packbelegte Einträge bleiben ohne Bild.** Für die meisten ist die Einzelrecherche noch nicht abgeschlossen; der Status „ohne Bild“ bedeutet nicht, dass es nachweislich kein rechtmäßiges Foto gibt.
- Geprüfte, aber verworfene Varianten: ein stark abgeschnittenes Honda-Civic-EK9-Foto, ein Mercedes CLK GTR Roadster für einen Coupé-Eintrag, ein Porsche 911 GT3 für einen Carrera-Eintrag sowie ein offener Aston Martin Valkyrie Spider für den geschlossenen Valkyrie-Eintrag. Diese Bilder wurden nicht falsch zugeordnet.
- Weitere verworfene Treffer: BMW E36 mit sichtbarer M-Kennzeichnung statt belegtem 320i, Nissan Skyline R33 ohne sicheren GT-R-Nachweis, ein nur aus der Ferne gezeigter Nissan 240SX sowie Ferrari FXX-K Evo und Mercedes-AMG GT als reine Detailaufnahmen. Die Modell- oder Qualitätsanforderung war damit für diese Einträge nicht erfüllt.
- Für fiktive Packfahrzeuge fehlt ein frei nutzbares Realfahrzeug-Pendant; hierfür wäre ein selbst erstellter Minecraft-Screenshot oder eine ausdrückliche Erlaubnis des Packurhebers nötig.
- Wikimedia Commons antwortete bei späteren Bilddownloads mit HTTP 429. Danach wurden keine weiteren Wikimedia-Dateien abgefragt oder Sperren umgangen. Die nächste Etappe sollte die offenen exakten Modelle in kleineren Blöcken und über alternative lizenzierte Quellen weiter prüfen.

## Technische Prüfung

- Bildpfade: alle in der Audit-CSV eingetragenen lokalen Dateien vorhanden.
- TypeScript-Typecheck: bestanden.
- Browserprüfung: Desktop-Katalog bei 1440 px, Mobil-Katalog und Toyota-MR2-SW20-Detail bei 390 px sowie Ford-Mustang-1967-Detail bei 1440 px visuell geprüft. Der Browser lud alle 24 neuen WebP-Dateien erfolgreich; kein horizontaler Überlauf bei 390 px. Das ist ein Bildlade- und Layoutcheck, keine vollständige Prüfung aller 229 Detailseiten.
- Screenshots: [Desktop-Katalog](audit-screenshots/vehicle-images-phase2-desktop-catalog.png), [Mobil-Katalog](audit-screenshots/vehicle-images-phase2-mobile-catalog.png), [Ford Mustang 1967](audit-screenshots/vehicle-images-phase2-detail.png), [Toyota MR2 SW20 mobil](audit-screenshots/vehicle-images-phase2-mobile-detail.png).

## Nächste Etappe

Die Pack-Statusliste nach leeren Bildpfaden filtern, pro Modell/Generation genau einmal recherchieren und nur mit belegtem Modell sowie dokumentierter Lizenz zuordnen. Bereits vorhandene Fotos nur bei identischer Karosserie/Generation wiederverwenden.
