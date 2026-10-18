"use client";

import { getApp, getApps, initializeApp } from "@firebase/app";
import {
  type Auth,
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithCustomToken,
  signOut,
} from "@firebase/auth";

let clientAuth: Promise<Auth> | undefined;

export function getClientAuth() {
  if (clientAuth) return clientAuth;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error("Firebase-Clientkonfiguration fehlt.");
  }

  const config = {
    apiKey,
    authDomain,
    projectId,
    appId,
    ...(storageBucket ? { storageBucket } : {}),
    ...(messagingSenderId ? { messagingSenderId } : {}),
    ...(measurementId ? { measurementId } : {}),
  };
  const app = getApps().length ? getApp() : initializeApp(config);
  clientAuth = (async () => {
    let auth: Auth;
    try {
      auth = initializeAuth(app, { persistence: inMemoryPersistence });
    } catch (error) {
      if (
        typeof error !== "object" ||
        error === null ||
        !("code" in error) ||
        error.code !== "auth/already-initialized"
      ) {
        throw error;
      }

      auth = getAuth(app);
      await setPersistence(auth, inMemoryPersistence);
    }
    const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
    if (
      process.env.NODE_ENV !== "production" &&
      emulatorHost &&
      /^(localhost|127\.0\.0\.1):\d{2,5}$/u.test(emulatorHost)
    ) {
      connectAuthEmulator(auth, `http://${emulatorHost}`, {
        disableWarnings: true,
      });
    }
    return auth;
  })();
  return clientAuth;
}

export async function exchangeCustomTokenForSession(customToken: string) {
  const auth = await getClientAuth();
  const credential = await signInWithCustomToken(auth, customToken);
  try {
    const idToken = await credential.user.getIdToken();
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(
        payload?.message ?? "Die sichere Sitzung konnte nicht geöffnet werden.",
      );
    }
  } finally {
    await signOut(auth);
  }
}
