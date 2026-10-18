import "server-only";

import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { PublicAccount } from "@/lib/account";
import { HttpError } from "@/lib/security";

export type AnnouncementView = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
};

function millis(value: unknown) {
  if (value && typeof value === "object" && "toMillis" in value) {
    const toMillis = value.toMillis;
    if (typeof toMillis === "function") return toMillis.call(value);
  }
  return typeof value === "number" ? value : 0;
}

function toAnnouncement(id: string, data: Record<string, unknown>) {
  return {
    id,
    title: String(data.title ?? ""),
    body: String(data.body ?? ""),
    published: data.published === true,
    createdAt: millis(data.createdAt),
    updatedAt: millis(data.updatedAt),
  } satisfies AnnouncementView;
}

export async function listPublicAnnouncements(db: Firestore) {
  const snapshot = await db.collection("announcements").limit(100).get();
  return snapshot.docs
    .map((doc) => toAnnouncement(doc.id, doc.data()))
    .filter((entry) => entry.published)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5);
}

export async function listAdminAnnouncements(db: Firestore) {
  const snapshot = await db.collection("announcements").limit(100).get();
  return snapshot.docs
    .map((doc) => toAnnouncement(doc.id, doc.data()))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveAnnouncement(
  db: Firestore,
  actor: PublicAccount,
  input:
    | {
        action: "create";
        title: string;
        body: string;
        published: boolean;
      }
    | {
        action: "update";
        announcementId: string;
        title: string;
        body: string;
        published: boolean;
      },
) {
  if (actor.role !== "owner") {
    throw new HttpError(
      "Nur der Inhaber darf Ankündigungen verwalten.",
      403,
      "owner_required",
    );
  }
  const ref =
    input.action === "create"
      ? db.collection("announcements").doc()
      : db.collection("announcements").doc(input.announcementId);
  const auditRef = db.collection("auditLogs").doc();
  const now = FieldValue.serverTimestamp();
  await db.runTransaction(async (transaction) => {
    const previous =
      input.action === "update" ? await transaction.get(ref) : null;
    if (input.action === "update" && !previous?.exists) {
      throw new HttpError(
        "Ankündigung nicht gefunden.",
        404,
        "announcement_not_found",
      );
    }
    transaction.set(
      ref,
      {
        title: input.title,
        body: input.body,
        published: input.published,
        ...(input.action === "create" ? { createdAt: now } : {}),
        updatedAt: now,
        updatedBy: actor.id,
      },
      { merge: input.action === "update" },
    );
    transaction.create(auditRef, {
      actorId: actor.id,
      action:
        input.action === "create"
          ? "announcement.created"
          : "announcement.updated",
      targetId: ref.id,
      published: input.published,
      previousPublished: previous?.get("published") === true,
      createdAt: now,
    });
  });
  return ref.id;
}
