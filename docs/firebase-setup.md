# Firebase-Einrichtung für Phase 2

Stand: 18.10.2026. Firebase `skyfall-motors` ist lokal konfiguriert. Firestore-Regeln wurden nach erfolgreichem Emulator-Test veröffentlicht; `FIRESTORE_RULES_CONFIRMED=true` ist lokal gesetzt. Der Inhaberaccount wurde nach manueller Minecraft-Prüfung über den einmaligen Bootstrap freigegeben. Bestellungen bleiben geschlossen, bis echter Fahrzeugbestand bestätigt und freigegeben ist.

## Verwendete Abläufe

- Der Browser sendet Minecraft-Name und Passwort ausschließlich an den Next.js-Server. Der Server validiert Eingaben und speichert einen scrypt-Hash mit zufälligem Salt in `users/{uid}`.
- Der Server stellt nach korrekter Anmeldung ein Firebase Custom Token aus. Der Browser tauscht es mit Firebase Auth in ein ID-Token und der Server wandelt dieses in ein fünf Tage gültiges, `HttpOnly`-Session-Cookie um. Clientseitige Auth-Persistenz wird auf `inMemoryPersistence` begrenzt und nach dem Austausch beendet.
- Der Server prüft Session-Cookies mit Revocation-Prüfung. POST-Routen verlangen denselben Origin; das Cookie verwendet `SameSite=Lax` und in Produktion `Secure`.
- Firestore-Regeln verweigern Browserzugriffe vollständig. Firebase Admin umgeht diese Regeln; deshalb prüft jede private Serverroute Session, Kontostatus, Rolle, Eingaben und Übergänge selbst.
- Login und Registrierung werden über kurzlebige Firestore-Zähler begrenzt. Zähler-IDs enthalten nur HMAC-Werte; TTL ist für die Bereinigung vorgesehen.
- Bestellungen verwenden Preise aus dem serverseitigen Katalog. Eine Firestore-Transaktion prüft Freigabe und Bestand und schreibt Auftrag, Bestellnummer, Idempotenzdatensatz, Kunden-Fahrzeug-Sperre, Reservierung und Audit-Eintrag atomar. Parallelbestellungen können den Bestand nicht überbuchen.
- Ein Minecraft-Name ist nach der Registrierung unverifiziert. Ein Inhaber/Mitarbeiter muss den Spieler persönlich im Spiel prüfen. Fertigung, Zahlungsbestätigung und Übergabe sind bis zur Prüfung serverseitig gesperrt.

## Projekt und lokale Konfiguration

1. Firebase-Projekt und Firestore im Native-Modus einrichten. Prüfe vor Aktivierung, ob der gewählte Firebase-Plan und die Nutzung zu deinen Kosten-/Quotengrenzen passen.
2. Eine Web-App in Firebase anlegen und die Firebase-Authentication-/Custom-Token-Anmeldung für das Projekt verwenden. Die Web-API-Key-Konfiguration ist öffentlich; sie ist kein Admin-Schlüssel.
3. `.env.example` ist die Vorlage; `.env.local` enthält die öffentlichen Projektwerte einschließlich Web-API-Key und vollständiger App-ID. API-Key und App-ID sind öffentliche App-Konfiguration, keine Admin-Zugangsdaten. Zum lokalen Bearbeiten: `open -e .env.local`.
4. Die lokale Entwicklung nutzt bereits private Firebase-Admin-Zugangsdaten außerhalb des Repositorys mit restriktiven Dateirechten und `cert()`. Bei einer nötigen Neueinrichtung in Firebase Console → **Project settings → Service accounts** einen Admin-SDK-Schlüssel erstellen und außerhalb des Repositorys ablegen:

   ```sh
   mkdir -p ~/.config/skyfall-motors
   chmod 700 ~/.config/skyfall-motors
   mv ~/Downloads/DEIN_SERVICE_ACCOUNT.json ~/.config/skyfall-motors/firebase-admin.json
   chmod 600 ~/.config/skyfall-motors/firebase-admin.json
   ```

   `DEIN_SERVICE_ACCOUNT.json` durch den heruntergeladenen Dateinamen ersetzen. In `.env.local` `GOOGLE_APPLICATION_CREDENTIALS=/Users/tylerneuhaus/.config/skyfall-motors/firebase-admin.json` setzen. In der lokalen Entwicklung lädt der Server diese Datei mit `cert()` und signiert Custom Tokens lokal; dafür ist keine Cloud-Berechtigung `iam.serviceAccounts.signBlob` nötig. Für Firestore braucht der Dienstaccount weiterhin die passenden Datenbankrechte. Den privaten JSON-Inhalt niemals in den Chat oder ins Repository kopieren. In einer geschützten Google-Cloud-Laufzeit ADC/Workload Identity mit denselben Firestore-Rechten verwenden und `FIREBASE_USE_ADC=true` setzen; falls dort remote signiert wird, ist zusätzlich `iam.serviceAccounts.signBlob` erforderlich.
5. `APP_ORIGIN=http://localhost:3000` lokal setzen. In Produktion den exakten HTTPS-Origin konfigurieren. `APP_SECRET` mit einem zufälligen Wert von mindestens 32 Bytes befüllen, z. B. lokal mit `openssl rand -hex 32`.
6. Die aktuellen `deny all`-Clientregeln sind für `skyfall-motors` veröffentlicht. Vor jeder künftigen Regeländerung `firestore.rules` prüfen und **nicht ohne ausdrückliche Freigabe deployen**. Alle App-Daten laufen über den Next.js-Server.
7. `FIRESTORE_RULES_CONFIRMED=true` ist nach dem erfolgreichen Rule-Deploy lokal gesetzt. Nach künftigen Regeländerungen erst nach geprüftem Deployment bestätigen.
8. Bei Änderungen an `.env.local` den Entwicklungsserver neu starten. Registrierung, Passwortlogin, Session-Cookies, Logout, Profil, Bestellung, Berechtigungen und Adminaktionen wurden mit kontrollierten Testdaten geprüft; die Testdaten wurden entfernt.

Alle sensiblen Einstellungen kommen aus `.env.local` bzw. der Laufzeitumgebung. `.env.local`, PEM-Schlüssel und Firebase-Service-Account-JSON-Dateien sind in `.gitignore` ausgeschlossen; nur `.env.example` enthält leere Platzhalter.

## Erstmalige Inhaberfreigabe

Es gibt keinen Standard-Admin und keine fest eingebauten Zugangsdaten.

1. Nach der Firebase-Einrichtung ein normales Konto mit dem Minecraft-Namen des Inhabers über die Website registrieren.
2. Den Namen persönlich auf dem Minecraft-Server prüfen. Die Website kann eine Minecraft-UUID nicht selbst bestätigen.
3. In einer geschützten lokalen Umgebung mit Firebase-Admin-Zugang `OWNER_BOOTSTRAP_USERNAME` auf genau diesen Namen setzen.
4. Einmalig ausführen: `npm run bootstrap:owner -- --confirm-offline-identity`.

Die erstmalige Inhaberfreigabe für den registrierten Inhaber wurde bereits erfolgreich ausgeführt. `OWNER_BOOTSTRAP_USERNAME` ist danach lokal geleert; das Bootstrap-Skript darf nicht erneut für eine weitere Rolle verwendet werden.

Das Skript bricht ab, wenn `settings/owner` schon existiert, der Account nicht aktiv ist oder der Benutzername nicht registriert wurde. In einer Transaktion setzt es `role=owner`, bestätigt die manuell geprüfte Identität und schreibt einen Audit-Eintrag. Es gibt keine öffentliche Route zum Ändern von Rollen. Eine Mitarbeiterfreigabe muss separat über einen vertrauenswürdigen, auditierten Admin-Prozess erfolgen.

## Bestellfreigabe und Daten

- Fehlt `inventory/{vehicleId}`, ist das Fahrzeug nicht bestellbar. Im Adminbereich müssen Pack/Variante im konkreten Server geprüft, `approved=true` und der tatsächliche verfügbare Bestand eingetragen werden.
- `availableUnits` ist der bestätigte physische Bestand; `reservedUnits` wird serverseitig erhöht. Bei bestätigter Übergabe werden beide vermindert, bei zulässiger Stornierung wird nur die Reservierung freigegeben.
- Eine offene Bestellung desselben Kunden für dasselbe Fahrzeug blockiert weitere Bestellungen dieses Fahrzeugs.
- Zahlung wird nicht automatisch bestätigt. Ein berechtigter Inhaber/Mitarbeiter erfasst den Eingang der Diamanten manuell. Die Übergabe erfordert bestätigte Identität und Zahlung.
- Eine Passwortwiederherstellung ist noch nicht implementiert. Ohne E-Mail muss sie nach manueller Identitätsprüfung durch den Inhaber erfolgen; bis zu einem sicheren Recovery-Ablauf gibt es keine Selbstbedienungs-Zurücksetzung.

## Firestore-Collections

`users`, `minecraftUsernames`, `settings`, `inventory`, `orders`, `orderNumbers`, `orderIdempotency`, `customerVehicleReservations`, `authRateLimits` und `auditLogs`. Öffentliche Profil- und Bestellantworten werden explizit ausgelesen; Passwort-Hash und Salt werden nie an den Browser gesendet.

## Offizielle technische Dokumentation

- [Firebase Custom Tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens)
- [Firebase Session Cookies](https://firebase.google.com/docs/auth/admin/manage-cookies)
- [Cloud Firestore Transaktionen](https://firebase.google.com/docs/firestore/manage-data/transactions)
