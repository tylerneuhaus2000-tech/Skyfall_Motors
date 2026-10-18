import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_DURATION_MS } from "@/lib/account";
import { getFirebaseServices, isFirebaseReady } from "@/lib/firebase-admin";
import {
  errorResponse,
  HttpError,
  readJson,
  requireSameOrigin,
} from "@/lib/security";
import { sessionSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    if (!isFirebaseReady()) {
      throw new HttpError(
        "Firebase ist noch nicht eingerichtet.",
        503,
        "not_configured",
      );
    }
    const services = getFirebaseServices();
    if (!services)
      throw new HttpError("Firebase ist nicht erreichbar.", 503, "unavailable");

    const parsed = sessionSchema.safeParse(await readJson(request));
    if (!parsed.success)
      throw new HttpError("Anmeldung ungültig.", 401, "invalid_token");
    const decoded = await services.auth.verifyIdToken(
      parsed.data.idToken,
      true,
    );
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
      throw new HttpError("Bitte melde dich erneut an.", 401, "stale_auth");
    }

    const account = await services.db
      .collection("users")
      .doc(decoded.uid)
      .get();
    if (!account.exists || account.get("accountStatus") !== "active") {
      throw new HttpError(
        "Das Konto ist nicht verfügbar.",
        401,
        "account_unavailable",
      );
    }

    const sessionCookie = await services.auth.createSessionCookie(
      parsed.data.idToken,
      {
        expiresIn: SESSION_DURATION_MS,
      },
    );
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_MS / 1000,
    });
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
