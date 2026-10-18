import "server-only";

import type { Firestore } from "firebase-admin/firestore";
import { HttpError, privateDocumentKey } from "@/lib/security";

export async function enforceRateLimit(
  db: Firestore,
  scope: string,
  identity: string,
  limit: number,
  windowMs: number,
) {
  const ref = db
    .collection("authRateLimits")
    .doc(privateDocumentKey("rate-limit", `${scope}\0${identity}`));
  const now = Date.now();

  const allowed = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    const resetAt = typeof data?.resetAt === "number" ? data.resetAt : 0;
    const attempts = typeof data?.attempts === "number" ? data.attempts : 0;

    if (resetAt > now && attempts >= limit) return false;

    transaction.set(ref, {
      attempts: resetAt > now ? attempts + 1 : 1,
      resetAt: resetAt > now ? resetAt : now + windowMs,
      updatedAt: now,
      expiresAt: new Date(
        (resetAt > now ? resetAt : now + windowMs) + 24 * 60 * 60_000,
      ),
    });
    return true;
  });

  if (!allowed) {
    throw new HttpError(
      "Zu viele Versuche. Bitte warte kurz und versuche es erneut.",
      429,
      "rate_limited",
    );
  }
}
