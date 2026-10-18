# Technische Architektur

## Zielarchitektur

- Next.js App Router und TypeScript strict für öffentliche Website, Kundenbereich und Mitarbeiterwerkzeuge.
- Firestore als persistente Datenbank; Firebase Storage nur für freigegebene Uploads.
- Firebase Admin SDK ausschließlich serverseitig. Da Admin-Aufrufe Firestore Rules umgehen, enthält jede Serveraktion explizite Session-, Rollen- und Eigentumsprüfungen.
- Firebase Authentication Custom Tokens verbinden das Minecraft-Namen/Passwort-Verfahren mit Firebase Auth. Der Next.js-Server speichert scrypt-Hash und Salt, signiert nach erfolgreichem Login einen Custom Token und tauscht das Client-ID-Token in ein HttpOnly-Session-Cookie. Keine Fake-E-Mail-Adressen.
- Firestore speichert Konten, eindeutige Minecraft-Namen, Bestand, Bestellungen, Idempotenzsperren, Rate-Limits und Audit-Ereignisse. Die Anmeldung und Datenbank bleiben fail-closed, bis Firebase und Laufzeitzugänge eingerichtet sind.
- Manuelle Identitätsprüfung, Diamantenzahlung und Fahrzeugübergabe sind explizite Mitarbeiteraktionen; es gibt keinen automatischen Zahlungsstatus.

## Vertrauensgrenzen

```text
Browser
  └─ öffentliche Anzeige/Formulare; keine Preis-/Rollen-/Zahlungsautorität
       ↓ HTTPS, Session-Cookie, CSRF-Schutz
Next.js Server Actions / Route Handlers
  ├─ Eingabevalidierung und Authentifizierung
  ├─ serverseitige Rollen- und Besitzprüfung
  ├─ Preis-/Bestands-/Statusregeln
  └─ idempotente Firestore-Transaktionen + Audit-Log
       ↓ Application Default Credentials / Secret Manager
Firebase Admin SDK → Firestore

Minecraft-Server (spätere Integration)
  └─ signierte, authentisierte Server-zu-Server-Ereignisse; keine öffentlichen Zahlungsendpunkte
```

## Zentrale Datenobjekte

Phase 2 verwendet `users`, `minecraftUsernames`, `settings`, `inventory`, `orders`, `orderNumbers`, `orderIdempotency`, `customerVehicleReservations`, `authRateLimits` und `auditLogs`. Weitere Produktbereiche folgen erst, wenn die zugehörigen Workflows implementiert werden.

Fahrzeuge tragen mindestens `packId`, `modelId`, `variantId`, `gameVersion`, `loader`, `verificationStatus`, `survivalCraftingStatus`, `priceDiamonds`, `priceSource`, `imageStatus`, `imageRightsStatus`, `orderEnabled` und nachvollziehbare Quellen. Eine Kandidatenliste darf nicht zugleich Lagerbestand oder Lieferbarkeit bedeuten.

## Transaktionsregeln

- Preis aus freigegebener Produktdefinition serverseitig lesen und im Auftrag als unveränderlichen Snapshot speichern.
- Bestand in derselben Transaktion reservieren, in der der Auftrag angelegt wird; Idempotency-Key und eine Kunden-Fahrzeug-Sperre verhindern doppelte Reservierungen.
- Zahlungsbestätigung an eine serverseitig geprüfte Mitarbeiterrolle koppeln und zusammen mit Auftrag/Audit-Log atomar schreiben.
- Zulässige Bestellstatusübergänge erzwingen; Übergabe nur nach Identitäts- und Zahlungsbestätigung.
- Miet-/Testfahrt-Zeitfenster transaktional auf Überschneidung prüfen.
- Gebrauchtwagenprovision: `Math.ceil(priceDiamonds * 0.10)` serverseitig, Verkäuferbetrag als Rest.
- Rundenzeiten ganzzahlig in Millisekunden speichern und nur autorisiert veröffentlichen.

## Externe Abhängigkeiten

Ohne Firebase-Projekt, IAM/ADC und bestätigte Infrastruktur werden keine echten Auth-, Firestore- oder Storage-Abläufe behauptet. Ohne Mod-Dateien oder bestätigte Server-Pack-Version bleibt eine Mod-Prüfung auf Quellangaben beschränkt.

Konkrete lokale und erste Inhaber-Einrichtung steht in [docs/firebase-setup.md](./firebase-setup.md).
