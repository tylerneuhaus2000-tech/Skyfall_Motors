# SKYFALL MOTORS

Digitale Autohaus- und Motorsportplattform für einen Minecraft-Survival-Server (Java 1.21.1, NeoForge). Das öffentliche Frontend enthält vorbereitete Kundenkonten, serverseitige Bestellabläufe und einen geschützten Inhaberbereich. Die öffentliche Konfiguration für das Firebase-Projekt `skyfall-motors` ist teilweise eingetragen; bis Web-API-Key, vollständige Web-App-ID, Admin-Zugang und freigegebener Firestore-Regeldeploy vorliegen, bleiben Anmeldung und Bestellungen geschlossen.

## Lokal starten

Voraussetzung: Node.js 20.9 oder neuer.

```bash
npm ci
npm run dev
```

Danach `http://localhost:3000` öffnen.

## Enthalten

- Deutsche, responsive Website mit Navigation und Bereichen für Autohaus, Rennstrecke, Race Center, Werkstatt und Kundenkonto.
- Durchsuchbarer, filterbarer Fahrzeugkatalog mit Detailseiten für acht quellengestützte Modelle.
- Quellen, Mod-Pack-Version und offene Prüfungen sind pro Modell dokumentiert.
- Nicht verifizierte Kandidaten sind intern getrennt; Bestellungen sind bis zur Bestätigung des konkreten Server-Modpacks geschlossen.
- Preise, Mietberechnung und aufgerundete Marktplatzprovision als getestete Geschäftsregeln.
- Minecraft-Name/Passwort-Registrierung mit scrypt-Hash, Firebase Custom Auth und HttpOnly-Session-Cookie als serverseitiger Ablauf.
- Serverseitige Bestellpreise, atomare Lagerreservierung, Idempotenz, Bestellstatus und geschützte manuelle Zahlungs-/Übergabebestätigung.
- Geschützter Inhaberbereich für Kundenprüfung, Fahrzeugfreigabe, Bestand und Bestellverwaltung.
- Öffentliche Produktbilder sind als Platzhalter kenntlich gemacht; es werden keine ungeklärten Mod-Screenshots verwendet.

## Befehle

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run start
npm run bootstrap:owner -- --confirm-offline-identity
```

## Projektstatus und Grenzen

Ohne vollständige Firebase-Webkonfiguration und private Admin-Zugangsdaten nimmt die Website keine Passwörter entgegen und speichert keine Bestellungen. Die API, Firestore-Regeln, Rollenprüfungen, Hashing-, Session-, Preis- und Transaktionslogik sind implementiert, aber noch nicht gegen ein echtes Projekt oder Emulator geprüft. Identitätsprüfung und Diamantenzahlung bleiben manuell.

Siehe [MORNING_REPORT.md](./MORNING_REPORT.md), [Firebase-Einrichtung](./docs/firebase-setup.md), [PLAN.md](./PLAN.md), [PROGRESS.md](./PROGRESS.md), [Architektur](./docs/architecture.md) und [Mod-Pack-Prüfung](./docs/research/mod-packs.md).

Ein GitHub-Remote ist noch nicht eingerichtet. Ein Push darf nur erfolgen, wenn die angemeldete GitHub-Identität vorher als `tylerneuhaus2000tech` bestätigt wurde.
