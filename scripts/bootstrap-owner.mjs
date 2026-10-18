import { createHash } from "node:crypto";
import nextEnv from "@next/env";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function stop(message) {
  console.error(message);
  process.exitCode = 1;
}

const username = process.env.OWNER_BOOTSTRAP_USERNAME?.trim();
const normalized = username?.toLowerCase();
if (!username || !/^[A-Za-z0-9_]{3,16}$/.test(username)) {
  stop("OWNER_BOOTSTRAP_USERNAME fehlt oder ist kein gültiger Minecraft-Name.");
} else if (!process.argv.includes("--confirm-offline-identity")) {
  stop(
    "Zuerst die Identität im Spiel persönlich prüfen, dann --confirm-offline-identity übergeben.",
  );
} else if (!process.env.FIREBASE_PROJECT_ID) {
  stop("FIREBASE_PROJECT_ID fehlt.");
} else if (process.env.FIRESTORE_RULES_CONFIRMED !== "true") {
  stop(
    "Zuerst firestore.rules im Projekt deployen und FIRESTORE_RULES_CONFIRMED=true setzen.",
  );
} else if (
  !process.env.FIREBASE_SERVICE_ACCOUNT_JSON &&
  !process.env.GOOGLE_APPLICATION_CREDENTIALS &&
  process.env.FIREBASE_USE_ADC !== "true"
) {
  stop(
    "Geschützte Service-Account-Zugangsdaten oder FIREBASE_USE_ADC=true fehlen.",
  );
} else {
  try {
    const existing = getApps().find(
      (app) => app.name === "skyfall-owner-bootstrap",
    );
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const app =
      existing ??
      initializeApp(
        {
          projectId: process.env.FIREBASE_PROJECT_ID,
          credential: serviceAccountJson
            ? cert(JSON.parse(serviceAccountJson))
            : applicationDefault(),
        },
        "skyfall-owner-bootstrap",
      );
    const db = getFirestore(app);
    const usernameRef = db.collection("minecraftUsernames").doc(normalized);
    const ownerRef = db.collection("settings").doc("owner");
    const auditRef = db.collection("auditLogs").doc();

    await db.runTransaction(async (transaction) => {
      const owner = await transaction.get(ownerRef);
      const existingOwners = await transaction.get(
        db.collection("users").where("role", "==", "owner").limit(1),
      );
      const name = await transaction.get(usernameRef);
      if (owner.exists || !existingOwners.empty) {
        throw new Error(
          "Die erstmalige Inhaberfreigabe wurde bereits ausgeführt.",
        );
      }
      if (!name.exists || typeof name.get("uid") !== "string") {
        throw new Error(
          "Für diesen Namen muss zuerst ein normales Kundenkonto erstellt werden.",
        );
      }

      const uid = name.get("uid");
      const userRef = db.collection("users").doc(uid);
      const user = await transaction.get(userRef);
      if (!user.exists || user.get("accountStatus") !== "active") {
        throw new Error("Das Kundenkonto ist nicht aktiv.");
      }

      transaction.create(ownerRef, {
        uid,
        minecraftUsername: username,
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.update(userRef, {
        role: "owner",
        minecraftVerified: true,
        minecraftVerifiedAt: FieldValue.serverTimestamp(),
        minecraftVerifiedBy: "initial-owner-bootstrap",
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.create(auditRef, {
        actorId: uid,
        action: "owner.initial_bootstrap",
        targetId: uid,
        identityConfirmation: "offline-manual-check",
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    const fingerprint = createHash("sha256")
      .update(normalized)
      .digest("hex")
      .slice(0, 8);
    console.log(
      `Inhaberfreigabe abgeschlossen (Name-Fingerprint ${fingerprint}).`,
    );
  } catch (error) {
    stop(
      error instanceof Error
        ? error.message
        : "Inhaberfreigabe fehlgeschlagen.",
    );
  }
}
