import "server-only";

import { createHash } from "node:crypto";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { PublicAccount } from "@/lib/account";
import { vehicles } from "@/lib/catalog";
import type { OrderStatus } from "@/lib/order-domain";
import { HttpError } from "@/lib/security";
import {
  canJoinVehicleWaitlist,
  canModeratePendingEntry,
  canTransitionWorkshopTicket,
  hasDeliveredVehicleOrder,
  nextTestDriveStatus,
  type WorkshopTicketStatus,
  workshopTicketStatuses,
} from "@/lib/side-feature-domain";

function millis(value: unknown) {
  if (value && typeof value === "object" && "toMillis" in value) {
    const toMillis = value.toMillis;
    if (typeof toMillis === "function") return toMillis.call(value);
  }
  return typeof value === "number" ? value : 0;
}

function hashedId(namespace: string, value: string) {
  return createHash("sha256").update(`${namespace}\0${value}`).digest("hex");
}

function verifiedVehicle(vehicleId: string) {
  const vehicle = vehicles.find((entry) => entry.id === vehicleId);
  if (vehicle?.verificationStatus !== "verified") {
    throw new HttpError(
      "Dieses Fahrzeug ist nicht im bestätigten Katalog.",
      404,
      "vehicle_not_found",
    );
  }
  return vehicle;
}

export async function listWishlist(db: Firestore, customerId: string) {
  const snapshot = await db
    .collection("users")
    .doc(customerId)
    .collection("wishlist")
    .get();
  const knownIds = new Set(vehicles.map((vehicle) => vehicle.id));
  return snapshot.docs
    .map((doc) => doc.id)
    .filter((vehicleId) => knownIds.has(vehicleId));
}

export async function setWishlistItem(
  db: Firestore,
  account: PublicAccount,
  input: { action: "add" | "remove"; vehicleId: string },
) {
  verifiedVehicle(input.vehicleId);
  const userRef = db.collection("users").doc(account.id);
  const itemRef = userRef.collection("wishlist").doc(input.vehicleId);
  await db.runTransaction(async (transaction) => {
    const [userSnapshot, itemSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(itemRef),
    ]);
    if (
      !userSnapshot.exists ||
      userSnapshot.get("accountStatus") !== "active"
    ) {
      throw new HttpError(
        "Dein Konto ist nicht verfügbar.",
        401,
        "account_unavailable",
      );
    }
    if (input.action === "add" && !itemSnapshot.exists) {
      transaction.create(itemRef, {
        vehicleId: input.vehicleId,
        createdAt: FieldValue.serverTimestamp(),
      });
    } else if (input.action === "remove" && itemSnapshot.exists) {
      transaction.delete(itemRef);
    }
  });
  return { vehicleId: input.vehicleId, saved: input.action === "add" };
}

export type VehicleWaitlistEntryView = {
  id: string;
  customerId: string;
  minecraftUsername: string;
  vehicleId: string;
  vehicleName: string;
  status: "waiting" | "contacted";
  createdAt: number;
};

function toVehicleWaitlistEntry(
  id: string,
  data: Record<string, unknown>,
): VehicleWaitlistEntryView {
  const vehicle = vehicles.find((entry) => entry.id === data.vehicleId);
  return {
    id,
    customerId: String(data.customerId ?? ""),
    minecraftUsername: String(data.minecraftUsername ?? ""),
    vehicleId: String(data.vehicleId ?? ""),
    vehicleName: vehicle?.name ?? "Fahrzeug nicht mehr im Katalog",
    status: data.status === "contacted" ? "contacted" : "waiting",
    createdAt: millis(data.createdAt),
  };
}

export async function changeVehicleWaitlist(
  db: Firestore,
  account: PublicAccount,
  input: { action: "join" | "leave"; vehicleId: string },
) {
  const vehicle = verifiedVehicle(input.vehicleId);
  const entryId = hashedId("vehicle-waitlist", `${account.id}\0${vehicle.id}`);
  const userRef = db.collection("users").doc(account.id);
  const inventoryRef = db.collection("inventory").doc(vehicle.id);
  const entryRef = db.collection("vehicleWaitlist").doc(entryId);
  const auditRef = db.collection("auditLogs").doc();

  await db.runTransaction(async (transaction) => {
    const [user, entry, inventory] = await Promise.all([
      transaction.get(userRef),
      transaction.get(entryRef),
      input.action === "join"
        ? transaction.get(inventoryRef)
        : Promise.resolve(null),
    ]);
    if (!user.exists || user.get("accountStatus") !== "active") {
      throw new HttpError(
        "Dein Konto ist nicht verfügbar.",
        401,
        "account_unavailable",
      );
    }

    if (input.action === "leave") {
      if (entry.exists && entry.get("customerId") === account.id) {
        transaction.delete(entryRef);
        transaction.create(auditRef, {
          actorId: account.id,
          action: "vehicle_waitlist.left",
          targetId: entryId,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
      return;
    }

    const inventoryData = inventory?.data();
    const stockCount = (value: unknown) =>
      Number.isSafeInteger(value) && (value as number) >= 0
        ? (value as number)
        : 0;
    if (
      !inventoryData ||
      !canJoinVehicleWaitlist({
        orderEligible: vehicle.orderEligible,
        approved: inventoryData.approved === true,
        serverInstallationConfirmed:
          inventoryData.serverInstallationConfirmed === true,
        availableUnits: stockCount(inventoryData.availableUnits),
        reservedUnits: stockCount(inventoryData.reservedUnits),
      })
    ) {
      throw new HttpError(
        "Die Warteliste ist nur für bestätigte, aktuell ausverkaufte Fahrzeuge verfügbar.",
        409,
        "waitlist_not_available",
      );
    }

    if (!entry.exists) {
      transaction.create(entryRef, {
        customerId: account.id,
        minecraftUsername: String(
          user.get("minecraftUsername") ?? account.minecraftUsername,
        ),
        vehicleId: vehicle.id,
        status: "waiting",
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.create(auditRef, {
        actorId: account.id,
        action: "vehicle_waitlist.joined",
        targetId: entryId,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  });
  return { entryId, joined: input.action === "join" };
}

export async function listCustomerVehicleWaitlist(
  db: Firestore,
  customerId: string,
) {
  const snapshot = await db
    .collection("vehicleWaitlist")
    .where("customerId", "==", customerId)
    .get();
  return snapshot.docs
    .map((doc) => toVehicleWaitlistEntry(doc.id, doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function listAdminVehicleWaitlist(db: Firestore) {
  const snapshot = await db.collection("vehicleWaitlist").get();
  return snapshot.docs
    .map((doc) => toVehicleWaitlistEntry(doc.id, doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function markVehicleWaitlistContacted(
  db: Firestore,
  actor: PublicAccount,
  input: { waitlistId: string; action: "mark_contacted" },
) {
  const entryRef = db.collection("vehicleWaitlist").doc(input.waitlistId);
  const auditRef = db.collection("auditLogs").doc();
  const notificationRef = db.collection("notifications").doc();
  await db.runTransaction(async (transaction) => {
    const entry = await transaction.get(entryRef);
    if (!entry.exists) {
      throw new HttpError(
        "Wartelisteneintrag nicht gefunden.",
        404,
        "entry_not_found",
      );
    }
    if (entry.get("status") !== "waiting") {
      throw new HttpError(
        "Dieser Eintrag wurde bereits bearbeitet.",
        409,
        "already_contacted",
      );
    }
    transaction.update(entryRef, {
      status: "contacted",
      updatedAt: FieldValue.serverTimestamp(),
      contactedBy: actor.id,
    });
    transaction.create(notificationRef, {
      customerId: String(entry.get("customerId") ?? ""),
      title: "Wartelisten-Rückmeldung",
      message:
        "Das Team hat dich außerhalb der Website zu deiner Fahrzeugvormerkung kontaktiert.",
      href: "/kundenbereich",
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorId: actor.id,
      action: "vehicle_waitlist.contacted",
      targetId: input.waitlistId,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export type WorkshopTicketView = {
  id: string;
  customerId: string;
  minecraftUsername: string;
  vehicleId: string;
  vehicleName: string;
  orderNumber: string;
  requestType: "repair" | "tuning";
  description: string;
  status: WorkshopTicketStatus;
  createdAt: number;
};

function toWorkshopTicket(id: string, data: Record<string, unknown>) {
  const vehicle = vehicles.find((entry) => entry.id === data.vehicleId);
  const status = workshopTicketStatuses.includes(
    data.status as WorkshopTicketStatus,
  )
    ? (data.status as WorkshopTicketStatus)
    : "requested";
  return {
    id,
    customerId: String(data.customerId ?? ""),
    minecraftUsername: String(data.minecraftUsername ?? ""),
    vehicleId: String(data.vehicleId ?? ""),
    vehicleName: vehicle?.name ?? "Fahrzeug nicht mehr im Katalog",
    orderNumber: String(data.orderNumber ?? ""),
    requestType: data.requestType === "tuning" ? "tuning" : "repair",
    description: String(data.description ?? ""),
    status,
    createdAt: millis(data.createdAt),
  } satisfies WorkshopTicketView;
}

export async function createWorkshopTicket(
  db: Firestore,
  account: PublicAccount,
  input: {
    vehicleId: string;
    requestType: "repair" | "tuning";
    description: string;
  },
) {
  const vehicle = verifiedVehicle(input.vehicleId);
  const userRef = db.collection("users").doc(account.id);
  const ticketRef = db.collection("workshopTickets").doc();
  const auditRef = db.collection("auditLogs").doc();
  const customerOrders = db
    .collection("orders")
    .where("customerId", "==", account.id);
  await db.runTransaction(async (transaction) => {
    const [user, orders] = await Promise.all([
      transaction.get(userRef),
      transaction.get(customerOrders),
    ]);
    if (!user.exists || user.get("accountStatus") !== "active") {
      throw new HttpError(
        "Dein Konto ist nicht verfügbar.",
        401,
        "account_unavailable",
      );
    }
    const deliveredOrder = orders.docs.find(
      (order) =>
        order.get("vehicleId") === vehicle.id &&
        order.get("status") === "delivered" &&
        millis(order.get("handedOverAt")) > 0,
    );
    if (!deliveredOrder) {
      throw new HttpError(
        "Werkstatt-Tickets sind nur für tatsächlich übergebene Fahrzeuge möglich.",
        403,
        "vehicle_not_owned",
      );
    }
    transaction.create(ticketRef, {
      customerId: account.id,
      minecraftUsername: String(
        user.get("minecraftUsername") ?? account.minecraftUsername,
      ),
      vehicleId: vehicle.id,
      orderNumber: String(deliveredOrder.get("orderNumber") ?? ""),
      requestType: input.requestType,
      description: input.description,
      status: "requested",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorId: account.id,
      action: "workshop_ticket.created",
      targetId: ticketRef.id,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { ticketId: ticketRef.id };
}

export async function listCustomerWorkshopTickets(
  db: Firestore,
  customerId: string,
) {
  const snapshot = await db
    .collection("workshopTickets")
    .where("customerId", "==", customerId)
    .get();
  return snapshot.docs
    .map((doc) => toWorkshopTicket(doc.id, doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function listAdminWorkshopTickets(db: Firestore) {
  const snapshot = await db.collection("workshopTickets").get();
  return snapshot.docs
    .map((doc) => toWorkshopTicket(doc.id, doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function setWorkshopTicketStatus(
  db: Firestore,
  actor: PublicAccount,
  input: { ticketId: string; status: WorkshopTicketStatus },
) {
  const ticketRef = db.collection("workshopTickets").doc(input.ticketId);
  const auditRef = db.collection("auditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const ticket = await transaction.get(ticketRef);
    if (!ticket.exists) {
      throw new HttpError(
        "Werkstatt-Ticket nicht gefunden.",
        404,
        "ticket_not_found",
      );
    }
    const current = String(ticket.get("status")) as WorkshopTicketStatus;
    if (
      !workshopTicketStatuses.includes(current) ||
      !canTransitionWorkshopTicket(current, input.status)
    ) {
      throw new HttpError(
        "Dieser Statuswechsel ist nicht möglich.",
        409,
        "ticket_transition",
      );
    }
    transaction.update(ticketRef, {
      status: input.status,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.id,
    });
    transaction.create(auditRef, {
      actorId: actor.id,
      action: `workshop_ticket.${input.status}`,
      targetId: input.ticketId,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export type TestDriveRequestView = {
  id: string;
  customerId: string;
  minecraftUsername: string;
  vehicleId: string;
  vehicleName: string;
  preferredWindow: string;
  status: "pending" | "approved" | "declined" | "completed";
  createdAt: number;
};

export type CustomerNotificationView = {
  id: string;
  title: string;
  message: string;
  href: string;
  read: boolean;
  createdAt: number;
};

export async function listCustomerNotifications(
  db: Firestore,
  customerId: string,
): Promise<CustomerNotificationView[]> {
  const snapshot = await db
    .collection("notifications")
    .where("customerId", "==", customerId)
    .limit(100)
    .get();
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      title: String(doc.get("title") ?? ""),
      message: String(doc.get("message") ?? ""),
      href: String(doc.get("href") ?? "/kundenbereich"),
      read: doc.get("read") === true,
      createdAt: millis(doc.get("createdAt")),
    }))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function markCustomerNotificationRead(
  db: Firestore,
  customerId: string,
  notificationId: string,
) {
  const notificationRef = db.collection("notifications").doc(notificationId);
  await db.runTransaction(async (transaction) => {
    const notification = await transaction.get(notificationRef);
    if (!notification.exists || notification.get("customerId") !== customerId) {
      throw new HttpError(
        "Benachrichtigung nicht gefunden.",
        404,
        "notification_not_found",
      );
    }
    if (notification.get("read") !== true) {
      transaction.update(notificationRef, {
        read: true,
        readAt: FieldValue.serverTimestamp(),
      });
    }
  });
}

function toTestDriveRequest(
  id: string,
  data: Record<string, unknown>,
): TestDriveRequestView {
  const vehicle = vehicles.find((entry) => entry.id === data.vehicleId);
  return {
    id,
    customerId: String(data.customerId ?? ""),
    minecraftUsername: String(data.minecraftUsername ?? ""),
    vehicleId: String(data.vehicleId ?? ""),
    vehicleName: vehicle?.name ?? "Fahrzeug nicht mehr im Katalog",
    preferredWindow: String(data.preferredWindow ?? ""),
    status:
      data.status === "approved" ||
      data.status === "declined" ||
      data.status === "completed"
        ? data.status
        : "pending",
    createdAt: millis(data.createdAt),
  };
}

export async function createTestDriveRequest(
  db: Firestore,
  account: PublicAccount,
  input: { vehicleId: string; preferredWindow: string },
) {
  const vehicle = verifiedVehicle(input.vehicleId);
  const requestId = hashedId(
    "test-drive-request",
    `${account.id}\0${input.vehicleId}`,
  );
  const requestRef = db.collection("testDriveRequests").doc(requestId);
  const userRef = db.collection("users").doc(account.id);
  const auditRef = db.collection("auditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const [userSnapshot, requestSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(requestRef),
    ]);
    if (
      !userSnapshot.exists ||
      userSnapshot.get("accountStatus") !== "active"
    ) {
      throw new HttpError(
        "Dein Konto ist nicht verfügbar.",
        401,
        "account_unavailable",
      );
    }
    const status = requestSnapshot.get("status");
    if (status === "pending" || status === "approved") {
      throw new HttpError(
        "Für dieses Fahrzeug besteht bereits eine offene Testfahrt-Anfrage.",
        409,
        "test_drive_exists",
      );
    }
    transaction.set(requestRef, {
      customerId: account.id,
      minecraftUsername: String(
        userSnapshot.get("minecraftUsername") ?? account.minecraftUsername,
      ),
      vehicleId: vehicle.id,
      preferredWindow: input.preferredWindow,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorId: account.id,
      action: "test_drive.requested",
      targetId: requestId,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { requestId };
}

export async function listCustomerTestDriveRequests(
  db: Firestore,
  customerId: string,
) {
  const snapshot = await db
    .collection("testDriveRequests")
    .where("customerId", "==", customerId)
    .get();
  return snapshot.docs
    .map((doc) => toTestDriveRequest(doc.id, doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function listAdminTestDriveRequests(db: Firestore) {
  const snapshot = await db.collection("testDriveRequests").get();
  return snapshot.docs
    .map((doc) => toTestDriveRequest(doc.id, doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function applyTestDriveAction(
  db: Firestore,
  actor: PublicAccount,
  input: { requestId: string; action: "approve" | "decline" | "complete" },
) {
  const requestRef = db.collection("testDriveRequests").doc(input.requestId);
  const auditRef = db.collection("auditLogs").doc();
  const notificationRef = db.collection("notifications").doc();
  await db.runTransaction(async (transaction) => {
    const request = await transaction.get(requestRef);
    if (!request.exists) {
      throw new HttpError("Anfrage nicht gefunden.", 404, "request_not_found");
    }
    const next = nextTestDriveStatus(
      String(request.get("status") ?? ""),
      input.action,
    );
    if (!next) {
      throw new HttpError(
        "Dieser Statuswechsel ist nicht möglich.",
        409,
        "request_transition",
      );
    }
    transaction.update(requestRef, {
      status: next,
      updatedAt: FieldValue.serverTimestamp(),
      reviewedAt: FieldValue.serverTimestamp(),
      reviewedBy: actor.id,
    });
    transaction.create(notificationRef, {
      customerId: String(request.get("customerId") ?? ""),
      title:
        next === "approved"
          ? "Testfahrt freigegeben"
          : next === "declined"
            ? "Testfahrt-Anfrage abgelehnt"
            : "Testfahrt als durchgeführt markiert",
      message:
        next === "approved"
          ? "Das Team hat deine Testfahrt-Anfrage manuell freigegeben."
          : next === "declined"
            ? "Das Team kann deine Testfahrt-Anfrage derzeit nicht bestätigen."
            : "Das Team hat die Testfahrt als durchgeführt eingetragen.",
      href: "/kundenbereich",
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorId: actor.id,
      action: `test_drive.${next}`,
      targetId: input.requestId,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export type LapEntryView = {
  id: string;
  customerId: string;
  minecraftUsername: string;
  trackName: string;
  vehicleId: string;
  vehicleName: string;
  timeMs: number;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
};

export type PublicLapEntryView = Pick<
  LapEntryView,
  "id" | "minecraftUsername" | "trackName" | "vehicleName" | "timeMs"
>;

function toLapEntry(id: string, data: Record<string, unknown>): LapEntryView {
  const vehicle = vehicles.find((entry) => entry.id === data.vehicleId);
  return {
    id,
    customerId: String(data.customerId ?? ""),
    minecraftUsername: String(data.minecraftUsername ?? ""),
    trackName: String(data.trackName ?? ""),
    vehicleId: String(data.vehicleId ?? ""),
    vehicleName: vehicle?.name ?? "Fahrzeug nicht mehr im Katalog",
    timeMs: Number.isSafeInteger(data.timeMs) ? (data.timeMs as number) : 0,
    status:
      data.status === "approved" || data.status === "rejected"
        ? data.status
        : "pending",
    createdAt: millis(data.createdAt),
  };
}

export async function createLapEntry(
  db: Firestore,
  account: PublicAccount,
  input: { vehicleId: string; trackName: string; timeMs: number },
) {
  const vehicle = verifiedVehicle(input.vehicleId);
  const userRef = db.collection("users").doc(account.id);
  const entryRef = db.collection("lapEntries").doc();
  const auditRef = db.collection("auditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const user = await transaction.get(userRef);
    if (!user.exists || user.get("accountStatus") !== "active") {
      throw new HttpError(
        "Dein Konto ist nicht verfügbar.",
        401,
        "account_unavailable",
      );
    }
    transaction.create(entryRef, {
      customerId: account.id,
      minecraftUsername: String(
        user.get("minecraftUsername") ?? account.minecraftUsername,
      ),
      trackName: input.trackName,
      vehicleId: vehicle.id,
      timeMs: input.timeMs,
      status: "pending",
      submittedManually: true,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorId: account.id,
      action: "lap_time.submitted_manually",
      targetId: entryRef.id,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { entryId: entryRef.id };
}

export async function listPublicLapEntries(
  db: Firestore,
): Promise<PublicLapEntryView[]> {
  const snapshot = await db
    .collection("lapEntries")
    .where("status", "==", "approved")
    .limit(200)
    .get();
  return snapshot.docs
    .map((doc) => toLapEntry(doc.id, doc.data()))
    .map(({ id, minecraftUsername, trackName, vehicleName, timeMs }) => ({
      id,
      minecraftUsername,
      trackName,
      vehicleName,
      timeMs,
    }))
    .sort((left, right) => left.timeMs - right.timeMs);
}

export async function listAdminLapEntries(db: Firestore) {
  const snapshot = await db.collection("lapEntries").get();
  return snapshot.docs
    .map((doc) => toLapEntry(doc.id, doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function moderateLapEntry(
  db: Firestore,
  actor: PublicAccount,
  input: { entryId: string; action: "approve" | "reject" },
) {
  await moderatePendingDocument(
    db,
    actor,
    "lapEntries",
    input.entryId,
    input.action === "approve" ? "approved" : "rejected",
    "lap_time",
  );
}

export type VehicleReviewView = {
  id: string;
  customerId: string;
  minecraftUsername: string;
  vehicleId: string;
  vehicleName: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
};

export type PublicVehicleReviewView = Pick<
  VehicleReviewView,
  "id" | "minecraftUsername" | "rating" | "comment"
>;

function toVehicleReview(
  id: string,
  data: Record<string, unknown>,
): VehicleReviewView {
  const vehicle = vehicles.find((entry) => entry.id === data.vehicleId);
  return {
    id,
    customerId: String(data.customerId ?? ""),
    minecraftUsername: String(data.minecraftUsername ?? ""),
    vehicleId: String(data.vehicleId ?? ""),
    vehicleName: vehicle?.name ?? "Fahrzeug nicht mehr im Katalog",
    rating: Number.isSafeInteger(data.rating) ? (data.rating as number) : 0,
    comment: String(data.comment ?? ""),
    status:
      data.status === "approved" || data.status === "rejected"
        ? data.status
        : "pending",
    createdAt: millis(data.createdAt),
  };
}

export async function createVehicleReview(
  db: Firestore,
  account: PublicAccount,
  input: { vehicleId: string; rating: number; comment: string },
) {
  const vehicle = verifiedVehicle(input.vehicleId);
  const reviewId = hashedId("vehicle-review", `${account.id}\0${vehicle.id}`);
  const reviewRef = db.collection("vehicleReviews").doc(reviewId);
  const ordersQuery = db
    .collection("orders")
    .where("customerId", "==", account.id);
  const userRef = db.collection("users").doc(account.id);
  const auditRef = db.collection("auditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const [review, user, orders] = await Promise.all([
      transaction.get(reviewRef),
      transaction.get(userRef),
      transaction.get(ordersQuery),
    ]);
    if (!user.exists || user.get("accountStatus") !== "active") {
      throw new HttpError(
        "Dein Konto ist nicht verfügbar.",
        401,
        "account_unavailable",
      );
    }
    if (review.exists) {
      throw new HttpError(
        "Für dieses Fahrzeug liegt bereits eine Bewertung vor.",
        409,
        "review_exists",
      );
    }
    const customerOrders = orders.docs.map((doc) => ({
      vehicleId: String(doc.get("vehicleId") ?? ""),
      status: String(doc.get("status") ?? "") as OrderStatus,
      handedOverAt: millis(doc.get("handedOverAt")) || null,
    }));
    const deliveredVehicleExists = hasDeliveredVehicleOrder(
      customerOrders,
      vehicle.id,
    );
    const deliveredOrder = deliveredVehicleExists
      ? orders.docs.find(
          (doc) =>
            doc.get("vehicleId") === vehicle.id &&
            doc.get("status") === "delivered" &&
            millis(doc.get("handedOverAt")) > 0,
        )
      : undefined;
    if (!deliveredOrder) {
      throw new HttpError(
        "Bewertungen sind nur für tatsächlich übergebene Fahrzeuge möglich.",
        403,
        "vehicle_not_owned",
      );
    }
    transaction.create(reviewRef, {
      customerId: account.id,
      minecraftUsername: String(
        user.get("minecraftUsername") ?? account.minecraftUsername,
      ),
      vehicleId: vehicle.id,
      orderId: deliveredOrder.id,
      orderNumber: String(deliveredOrder.get("orderNumber") ?? ""),
      rating: input.rating,
      comment: input.comment,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorId: account.id,
      action: "vehicle_review.submitted",
      targetId: reviewId,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { reviewId };
}

export async function listPublicVehicleReviews(
  db: Firestore,
  vehicleId: string,
): Promise<PublicVehicleReviewView[]> {
  const snapshot = await db
    .collection("vehicleReviews")
    .where("status", "==", "approved")
    .limit(500)
    .get();
  return snapshot.docs
    .map((doc) => toVehicleReview(doc.id, doc.data()))
    .filter((review) => review.vehicleId === vehicleId)
    .sort((left, right) => right.createdAt - left.createdAt)
    .map(({ id, minecraftUsername, rating, comment }) => ({
      id,
      minecraftUsername,
      rating,
      comment,
    }));
}

export async function listAdminVehicleReviews(db: Firestore) {
  const snapshot = await db.collection("vehicleReviews").get();
  return snapshot.docs
    .map((doc) => toVehicleReview(doc.id, doc.data()))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function moderateVehicleReview(
  db: Firestore,
  actor: PublicAccount,
  input: { reviewId: string; action: "approve" | "reject" },
) {
  await moderatePendingDocument(
    db,
    actor,
    "vehicleReviews",
    input.reviewId,
    input.action === "approve" ? "approved" : "rejected",
    "vehicle_review",
  );
}

async function moderatePendingDocument(
  db: Firestore,
  actor: PublicAccount,
  collection: "lapEntries" | "vehicleReviews",
  id: string,
  status: "approved" | "rejected",
  auditAction: string,
) {
  const targetRef = db.collection(collection).doc(id);
  const auditRef = db.collection("auditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const target = await transaction.get(targetRef);
    if (!target.exists) {
      throw new HttpError("Eintrag nicht gefunden.", 404, "entry_not_found");
    }
    if (!canModeratePendingEntry(String(target.get("status") ?? ""))) {
      throw new HttpError(
        "Der Eintrag wurde bereits geprüft.",
        409,
        "already_moderated",
      );
    }
    transaction.update(targetRef, {
      status,
      moderatedAt: FieldValue.serverTimestamp(),
      moderatedBy: actor.id,
    });
    transaction.create(auditRef, {
      actorId: actor.id,
      action: `${auditAction}.${status}`,
      targetId: id,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}
