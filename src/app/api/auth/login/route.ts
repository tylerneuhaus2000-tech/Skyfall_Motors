import type { NextRequest } from "next/server";
import { getFirebaseServices, isFirebaseReady } from "@/lib/firebase-admin";
import { verifyPassword } from "@/lib/passwords";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  errorResponse,
  HttpError,
  readJson,
  requestIpKey,
  requireSameOrigin,
} from "@/lib/security";
import { loginSchema, normalizeMinecraftUsername } from "@/lib/validation";

const dummyHash = Buffer.alloc(64).toString("base64url");
const dummySalt = Buffer.alloc(16).toString("base64url");

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    if (!isFirebaseReady()) {
      throw new HttpError(
        "Die Anmeldung ist noch nicht freigeschaltet. Firebase wurde nicht vollständig eingerichtet.",
        503,
        "not_configured",
      );
    }

    const services = getFirebaseServices();
    if (!services)
      throw new HttpError("Firebase ist nicht erreichbar.", 503, "unavailable");

    const parsed = loginSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      throw new HttpError(
        "Minecraft-Name oder Passwort ist ungültig.",
        400,
        "invalid_input",
      );
    }

    const normalizedUsername = normalizeMinecraftUsername(
      parsed.data.minecraftUsername,
    );
    const ip = requestIpKey(request);
    await enforceRateLimit(
      services.db,
      "login-account",
      `${normalizedUsername}\0${ip}`,
      8,
      15 * 60_000,
    );
    await enforceRateLimit(services.db, "login-ip", ip, 30, 15 * 60_000);
    await enforceRateLimit(
      services.db,
      "login-name",
      normalizedUsername,
      10,
      15 * 60_000,
    );

    const username = await services.db
      .collection("minecraftUsernames")
      .doc(normalizedUsername)
      .get();
    const uid = username.exists ? username.get("uid") : undefined;
    const account =
      typeof uid === "string"
        ? await services.db.collection("users").doc(uid).get()
        : null;
    const data = account?.data();
    const hash =
      typeof data?.passwordHash === "string" ? data.passwordHash : dummyHash;
    const salt =
      typeof data?.passwordSalt === "string" ? data.passwordSalt : dummySalt;
    const validPassword = await verifyPassword(
      parsed.data.password,
      hash,
      salt,
    );

    if (
      !validPassword ||
      !username.exists ||
      !account?.exists ||
      data?.accountStatus !== "active" ||
      typeof uid !== "string"
    ) {
      throw new HttpError(
        "Minecraft-Name oder Passwort stimmt nicht.",
        401,
        "invalid_credentials",
      );
    }

    const customToken = await services.auth.createCustomToken(uid);
    return Response.json(
      { customToken },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
