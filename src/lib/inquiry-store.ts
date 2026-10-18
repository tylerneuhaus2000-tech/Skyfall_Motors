import "server-only";

import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { PublicAccount } from "@/lib/account";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { findVehicle } from "@/lib/catalog";
import { getPremiumVehicle } from "@/lib/premium-catalog";
import { HttpError } from "@/lib/security";
import { findVehicleCandidate } from "@/lib/vehicle-candidates";

export type InquiryStatus = "open" | "in_progress" | "answered" | "closed";

export type InquiryView = {
  id: string;
  customerId: string;
  minecraftUsername: string;
  subject: string;
  message: string;
  staffReply: string;
  status: InquiryStatus;
  createdAt: number;
  updatedAt: number;
  vehicleId?: string;
  vehicleName?: string;
  offerPriceDiamonds?: number | null;
  offerStatus?: "none" | "offered" | "accepted" | "declined";
};

export type AdminInquiryView = InquiryView & { internalNote: string };

function millis(value: unknown) {
  if (value && typeof value === "object" && "toMillis" in value) {
    const toMillis = value.toMillis;
    if (typeof toMillis === "function") return toMillis.call(value);
  }
  return typeof value === "number" ? value : 0;
}

function validStatus(value: unknown): value is InquiryStatus {
  return ["open", "in_progress", "answered", "closed"].includes(String(value));
}

function toInquiry(id: string, data: Record<string, unknown>): InquiryView {
  if (!validStatus(data.status)) {
    throw new HttpError(
      "Eine Anfrage enthält einen ungültigen Status.",
      503,
      "inquiry_invalid",
    );
  }
  return {
    id,
    customerId: String(data.customerId ?? ""),
    minecraftUsername: String(data.minecraftUsername ?? ""),
    subject: String(data.subject ?? ""),
    message: String(data.message ?? ""),
    staffReply: String(data.staffReply ?? ""),
    status: data.status,
    createdAt: millis(data.createdAt),
    updatedAt: millis(data.updatedAt),
    ...(typeof data.vehicleId === "string"
      ? { vehicleId: data.vehicleId }
      : {}),
    ...(typeof data.vehicleName === "string"
      ? { vehicleName: data.vehicleName }
      : {}),
    offerPriceDiamonds:
      typeof data.offerPriceDiamonds === "number"
        ? data.offerPriceDiamonds
        : null,
    offerStatus: ["offered", "accepted", "declined"].includes(
      String(data.offerStatus),
    )
      ? (data.offerStatus as "offered" | "accepted" | "declined")
      : "none",
  };
}

export async function listCustomerInquiries(db: Firestore, customerId: string) {
  const snapshot = await db
    .collection("customerInquiries")
    .where("customerId", "==", customerId)
    .get();
  return snapshot.docs
    .map((doc) => toInquiry(doc.id, doc.data()))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listAdminInquiries(db: Firestore) {
  const snapshot = await db
    .collection("customerInquiries")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  return snapshot.docs.map((doc) => ({
    ...toInquiry(doc.id, doc.data()),
    internalNote: String(doc.get("internalNote") ?? ""),
  }));
}

export async function createCustomerInquiry(
  db: Firestore,
  account: PublicAccount,
  input: { subject: string; message: string; vehicleId?: string },
) {
  const vehicle = input.vehicleId
    ? (findVehicle(input.vehicleId) ?? findVehicleCandidate(input.vehicleId))
    : undefined;
  if (input.vehicleId && !vehicle)
    throw new HttpError("Fahrzeug nicht gefunden.", 404, "vehicle_not_found");
  const userRef = db.collection("users").doc(account.id);
  const inquiryRef = db.collection("customerInquiries").doc();
  const auditRef = db.collection("auditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists || snapshot.get("accountStatus") !== "active") {
      throw new HttpError(
        "Dein Konto ist nicht verfügbar.",
        401,
        "account_unavailable",
      );
    }
    transaction.create(inquiryRef, {
      customerId: account.id,
      minecraftUsername: String(snapshot.get("minecraftUsername") ?? ""),
      subject: input.subject,
      message: input.message,
      ...(vehicle ? { vehicleId: vehicle.id, vehicleName: vehicle.name } : {}),
      offerPriceDiamonds: null,
      offerStatus: "none",
      staffReply: "",
      status: "open",
      internalNote: "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorId: account.id,
      action: "customer_inquiry.created",
      targetId: inquiryRef.id,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return inquiryRef.id;
}

export async function updateCustomerInquiry(
  db: Firestore,
  actor: PublicAccount,
  input: {
    inquiryId: string;
    status: InquiryStatus;
    staffReply: string;
    internalNote: string;
    offerPriceDiamonds?: number | null;
  },
) {
  if (!hasAdminPermission(actor.role, actor.staffRole, "inquiries")) {
    throw new HttpError(
      "Für diese Anfrage fehlen die erforderlichen Rechte.",
      403,
      "forbidden",
    );
  }
  const inquiryRef = db.collection("customerInquiries").doc(input.inquiryId);
  const auditRef = db.collection("auditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const inquiry = await transaction.get(inquiryRef);
    if (!inquiry.exists) {
      throw new HttpError(
        "Kundenanfrage nicht gefunden.",
        404,
        "inquiry_not_found",
      );
    }
    if (inquiry.get("offerStatus") === "accepted") {
      throw new HttpError(
        "Ein angenommenes Angebot kann nicht geändert werden.",
        409,
        "offer_already_accepted",
      );
    }
    if (
      input.offerPriceDiamonds != null &&
      (typeof inquiry.get("vehicleId") !== "string" ||
        getPremiumVehicle(String(inquiry.get("vehicleId"))))
    ) {
      throw new HttpError(
        "Ein individuelles Angebot ist nur für Anfragefahrzeuge zulässig.",
        409,
        "offer_not_allowed",
      );
    }
    const previousStatus = inquiry.get("status");
    const previousNote = String(inquiry.get("internalNote") ?? "");
    const previousReply = String(inquiry.get("staffReply") ?? "");
    const previousOfferPrice = inquiry.get("offerPriceDiamonds");
    if (input.offerPriceDiamonds != null) {
      const vehicle = findVehicle(String(inquiry.get("vehicleId") ?? ""));
      if (!vehicle?.orderEligible) {
        throw new HttpError(
          "Ein Angebot kann erst erstellt werden, wenn das Fahrzeug technisch für eine Bestellung freigegeben ist.",
          409,
          "offer_vehicle_unavailable",
        );
      }
    }
    if (
      previousStatus === input.status &&
      previousNote === input.internalNote &&
      previousReply === input.staffReply &&
      previousOfferPrice === (input.offerPriceDiamonds ?? null)
    )
      return;
    transaction.update(inquiryRef, {
      status: input.status,
      staffReply: input.staffReply,
      internalNote: input.internalNote,
      offerPriceDiamonds: input.offerPriceDiamonds ?? null,
      offerStatus:
        typeof input.offerPriceDiamonds === "number" ? "offered" : "none",
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.id,
    });
    transaction.create(auditRef, {
      actorId: actor.id,
      action:
        typeof input.offerPriceDiamonds === "number"
          ? "customer_inquiry.offer_created"
          : "customer_inquiry.updated",
      targetId: input.inquiryId,
      previousStatus: String(previousStatus ?? "open"),
      status: input.status,
      ...(input.offerPriceDiamonds != null
        ? {
            previousOfferPriceDiamonds:
              typeof previousOfferPrice === "number"
                ? previousOfferPrice
                : null,
            offerPriceDiamonds: input.offerPriceDiamonds,
          }
        : {}),
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function declineCustomerOffer(
  db: Firestore,
  customerId: string,
  inquiryId: string,
) {
  const inquiryRef = db.collection("customerInquiries").doc(inquiryId);
  const auditRef = db.collection("auditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const inquiry = await transaction.get(inquiryRef);
    if (!inquiry.exists || inquiry.get("customerId") !== customerId) {
      throw new HttpError("Angebot nicht gefunden.", 404, "offer_not_found");
    }
    if (inquiry.get("offerStatus") !== "offered") {
      throw new HttpError(
        "Dieses Angebot ist nicht mehr offen.",
        409,
        "offer_unavailable",
      );
    }
    transaction.update(inquiryRef, {
      offerStatus: "declined",
      status: "closed",
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorId: customerId,
      action: "customer_inquiry.offer_declined",
      targetId: inquiryId,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}
