import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";
import { getFirebaseServices, isFirebaseReady } from "@/lib/firebase-admin";
import { hashPassword } from "@/lib/passwords";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  errorResponse,
  HttpError,
  readJson,
  requestIpKey,
  requireSameOrigin,
} from "@/lib/security";
import { normalizeMinecraftUsername, registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    if (!isFirebaseReady()) {
      throw new HttpError(
        "Die Registrierung ist noch nicht freigeschaltet. Firebase wurde nicht vollständig eingerichtet.",
        503,
        "not_configured",
      );
    }

    const services = getFirebaseServices();
    if (!services)
      throw new HttpError("Firebase ist nicht erreichbar.", 503, "unavailable");

    const parsed = registerSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      throw new HttpError(
        parsed.error.issues[0]?.message ?? "Eingaben prüfen.",
        400,
        "invalid_input",
      );
    }

    const minecraftUsername = parsed.data.minecraftUsername;
    const normalizedUsername = normalizeMinecraftUsername(minecraftUsername);
    const ip = requestIpKey(request);
    await enforceRateLimit(
      services.db,
      "register-account",
      `${normalizedUsername}\0${ip}`,
      5,
      15 * 60_000,
    );
    await enforceRateLimit(services.db, "register-ip", ip, 10, 15 * 60_000);
    await enforceRateLimit(
      services.db,
      "register-name",
      normalizedUsername,
      8,
      15 * 60_000,
    );

    const usernameRef = services.db
      .collection("minecraftUsernames")
      .doc(normalizedUsername);
    if ((await usernameRef.get()).exists) {
      throw new HttpError(
        "Dieser Minecraft-Name ist bereits registriert.",
        409,
        "username_taken",
      );
    }

    const uid = randomUUID();
    const password = await hashPassword(parsed.data.password);
    const userRef = services.db.collection("users").doc(uid);
    await services.db.runTransaction(async (transaction) => {
      const usernameSnapshot = await transaction.get(usernameRef);
      if (usernameSnapshot.exists) {
        throw new HttpError(
          "Dieser Minecraft-Name ist bereits registriert.",
          409,
          "username_taken",
        );
      }

      transaction.create(usernameRef, {
        uid,
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.create(userRef, {
        minecraftUsername,
        minecraftUsernameNormalized: normalizedUsername,
        minecraftVerified: false,
        accountStatus: "active",
        role: "customer",
        ...password,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    const customToken = await services.auth.createCustomToken(uid);
    return Response.json(
      { customToken },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
