import "server-only";

import { readFileSync } from "node:fs";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export type FirebaseServices = {
  auth: ReturnType<typeof getAuth>;
  db: ReturnType<typeof getFirestore>;
};

let cachedServices: FirebaseServices | null | undefined;

function getAdminCredential(projectId: string, serviceAccountJson?: string) {
  if (serviceAccountJson) return cert(JSON.parse(serviceAccountJson));

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (process.env.NODE_ENV !== "production" && credentialsPath) {
    const localServiceAccount = JSON.parse(
      readFileSync(credentialsPath, "utf8"),
    );
    if (
      localServiceAccount.type !== "service_account" ||
      localServiceAccount.project_id !== projectId
    ) {
      throw new Error(
        "Local Firebase service account does not match the project",
      );
    }
    return cert(localServiceAccount);
  }

  return applicationDefault();
}

export function getFirebaseServices(): FirebaseServices | null {
  if (cachedServices !== undefined) return cachedServices;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const useApplicationDefault = process.env.FIREBASE_USE_ADC === "true";
  const hasApplicationDefaultCredentials = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
  );

  if (
    !projectId ||
    (!serviceAccountJson &&
      !useApplicationDefault &&
      !hasApplicationDefaultCredentials)
  ) {
    cachedServices = null;
    return cachedServices;
  }

  try {
    const existing = getApps().find((app) => app.name === "skyfall-admin");
    const app =
      existing ??
      initializeApp(
        {
          projectId,
          credential: getAdminCredential(projectId, serviceAccountJson),
        },
        "skyfall-admin",
      );

    cachedServices = { auth: getAuth(app), db: getFirestore(app) };
    return cachedServices;
  } catch {
    cachedServices = null;
    return null;
  }
}

export function getPublicFirebaseConfig() {
  const {
    NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  } = process.env;
  if (
    !NEXT_PUBLIC_FIREBASE_API_KEY ||
    !NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    !NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    !NEXT_PUBLIC_FIREBASE_APP_ID ||
    NEXT_PUBLIC_FIREBASE_PROJECT_ID !== process.env.FIREBASE_PROJECT_ID
  ) {
    return null;
  }

  return {
    apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: NEXT_PUBLIC_FIREBASE_APP_ID,
    ...(NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      ? { storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }
      : {}),
    ...(NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      ? { messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }
      : {}),
    ...(NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      ? { measurementId: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
      : {}),
  };
}

export function isFirebaseReady() {
  return Boolean(
    getFirebaseServices() &&
      getPublicFirebaseConfig() &&
      process.env.APP_SECRET &&
      process.env.APP_SECRET.length >= 32 &&
      process.env.FIRESTORE_RULES_CONFIRMED === "true" &&
      (process.env.NODE_ENV !== "production" || process.env.APP_ORIGIN),
  );
}
