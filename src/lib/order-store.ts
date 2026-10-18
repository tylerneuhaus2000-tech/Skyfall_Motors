import "server-only";

import { createHash } from "node:crypto";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { PublicAccount } from "@/lib/account";
import type { AdminActivityView } from "@/lib/admin-activity";
import { isStaffRole, type StaffRole } from "@/lib/admin-permissions";
import { vehicles } from "@/lib/catalog";
import {
  calculateOrderTotal,
  canChangeVehiclePrice,
  canConfirmPayment,
  canOfferVehicle,
  canSetAvailableUnits,
  canTransitionOrder,
  type OrderStatus,
  orderStatusLabels,
  type PaymentStatus,
  resolveOrderUnitPrice,
} from "@/lib/order-domain";
import { getPremiumVehicle } from "@/lib/premium-catalog";
import { HttpError } from "@/lib/security";
import {
  defaultShopSettings,
  isShopMode,
  type ShopSettings,
  shopOrderBlockReason,
} from "@/lib/shop-settings-domain";

export type InventoryView = {
  vehicleId: string;
  inventoryConfigured: boolean;
  approved: boolean;
  availableUnits: number;
  reservedUnits: number;
  priceDiamonds: number;
  orderEligible: boolean;
  ineligibilityReason: string | null;
  serverInstallationConfirmed: boolean;
  canOrder: boolean;
};

export type OrderView = {
  id: string;
  orderNumber: string;
  customerId: string;
  minecraftUsername: string;
  minecraftVerifiedAtOrder: boolean;
  vehicleId: string;
  vehicleName: string;
  packName: string;
  unitPrice: number;
  deliveryPrice: number;
  expressPrice: number;
  totalPrice: number;
  handover: "pickup" | "delivery";
  express: boolean;
  paymentMethod: "terminal" | "handover";
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: number;
  paidAt: number | null;
  handedOverAt: number | null;
};

export type ShopSettingsView = ShopSettings;

type OrderRecord = Omit<OrderView, "createdAt"> & {
  createdAt?: { toMillis?: () => number } | number;
  updatedAt?: unknown;
  paidAt?: unknown;
  paidBy?: string;
  handedOverAt?: unknown;
  handedOverBy?: string;
  cancelledAt?: unknown;
  cancelledBy?: string;
};

function count(value: unknown) {
  if (value === undefined || value === null) return 0;
  if (Number.isSafeInteger(value) && (value as number) >= 0)
    return value as number;
  throw new HttpError(
    "Der gespeicherte Lagerbestand ist inkonsistent; Bestellung gestoppt.",
    409,
    "inventory_inconsistent",
  );
}

function storedPrice(value: unknown, fallback: number) {
  try {
    return resolveOrderUnitPrice(
      fallback,
      value === undefined || value === null
        ? undefined
        : typeof value === "number"
          ? value
          : Number.NaN,
    );
  } catch {
    throw new HttpError(
      "Der gespeicherte Fahrzeugpreis ist ungültig; Bestellung gestoppt.",
      409,
      "inventory_price_invalid",
    );
  }
}

function timestampMillis(value: unknown) {
  if (value && typeof value === "object" && "toMillis" in value) {
    const toMillis = value.toMillis;
    if (typeof toMillis === "function") return toMillis.call(value);
  }
  return typeof value === "number" ? value : 0;
}

function stableDocumentKey(namespace: string, value: string) {
  return createHash("sha256").update(`${namespace}\0${value}`).digest("hex");
}

function parseShopSettings(data: Record<string, unknown>): ShopSettingsView {
  if (
    !isShopMode(data.mode) ||
    !Number.isSafeInteger(data.deliveryFee) ||
    (data.deliveryFee as number) < 0 ||
    (data.deliveryFee as number) > 100_000 ||
    !Number.isSafeInteger(data.expressFee) ||
    (data.expressFee as number) < 0 ||
    (data.expressFee as number) > 100_000
  ) {
    throw new HttpError(
      "Die Shop-Einstellungen sind ungültig. Neue Bestellungen bleiben gesperrt.",
      503,
      "shop_settings_invalid",
    );
  }
  return {
    mode: data.mode,
    deliveryFee: data.deliveryFee as number,
    expressFee: data.expressFee as number,
  };
}

export async function getShopSettings(
  db: Firestore,
): Promise<ShopSettingsView> {
  const snapshot = await db.collection("shopSettings").doc("config").get();
  if (!snapshot.exists) return { ...defaultShopSettings };
  return parseShopSettings(snapshot.data() ?? {});
}

export async function updateShopSettings(
  db: Firestore,
  actor: PublicAccount,
  input: ShopSettings,
) {
  if (actor.role !== "owner") {
    throw new HttpError(
      "Nur der Inhaber darf Shop-Einstellungen ändern.",
      403,
      "owner_required",
    );
  }
  const ref = db.collection("shopSettings").doc("config");
  const auditRef = db.collection("auditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(ref);
    const previous = current.exists ? current.data() : defaultShopSettings;
    transaction.set(ref, {
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.id,
    });
    transaction.create(auditRef, {
      actorId: actor.id,
      action: "shop.settings_updated",
      targetId: "config",
      previousMode: previous?.mode ?? defaultShopSettings.mode,
      previousDeliveryFee:
        previous?.deliveryFee ?? defaultShopSettings.deliveryFee,
      previousExpressFee:
        previous?.expressFee ?? defaultShopSettings.expressFee,
      mode: input.mode,
      deliveryFee: input.deliveryFee,
      expressFee: input.expressFee,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export function toOrderView(id: string, record: OrderRecord): OrderView {
  return {
    id,
    orderNumber: record.orderNumber,
    customerId: record.customerId,
    minecraftUsername: record.minecraftUsername,
    minecraftVerifiedAtOrder: record.minecraftVerifiedAtOrder === true,
    vehicleId: record.vehicleId,
    vehicleName: record.vehicleName,
    packName: record.packName,
    unitPrice: record.unitPrice,
    deliveryPrice: record.deliveryPrice,
    expressPrice: record.expressPrice,
    totalPrice: record.totalPrice,
    handover: record.handover,
    express: record.express,
    paymentMethod: record.paymentMethod,
    paymentStatus: record.paymentStatus,
    status: record.status,
    createdAt: timestampMillis(record.createdAt),
    paidAt: timestampMillis(record.paidAt) || null,
    handedOverAt: timestampMillis(record.handedOverAt) || null,
  };
}

export async function getInventoryView(
  db: Firestore,
  vehicleId: string,
): Promise<InventoryView> {
  const snapshot = await db.collection("inventory").doc(vehicleId).get();
  const data = snapshot.data();
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const approved = data?.approved === true;
  const availableUnits = count(data?.availableUnits);
  const reservedUnits = count(data?.reservedUnits);
  const serverInstallationConfirmed =
    data?.serverInstallationConfirmed === true;
  return {
    vehicleId,
    inventoryConfigured: snapshot.exists,
    approved,
    availableUnits,
    reservedUnits,
    priceDiamonds: vehicle
      ? (getPremiumVehicle(vehicle.id)?.priceDiamonds ??
        storedPrice(data?.priceDiamonds, vehicle.priceDiamonds))
      : 1,
    orderEligible: vehicle?.orderEligible === true,
    ineligibilityReason:
      vehicle?.ineligibilityReason ??
      "Fahrzeug nicht im freigegebenen Katalog.",
    serverInstallationConfirmed,
    canOrder:
      Boolean(vehicle && getPremiumVehicle(vehicle.id)) &&
      canOfferVehicle(
        vehicle?.orderEligible === true,
        serverInstallationConfirmed,
        approved,
        availableUnits,
        reservedUnits,
      ),
  };
}

export async function listPublicCatalogInventory(db: Firestore) {
  const snapshot = await db.collection("inventory").get();
  const inventoryById = new Map(
    snapshot.docs.map((doc) => [doc.id, doc.data()]),
  );
  return Object.fromEntries(
    vehicles.map((vehicle) => {
      const data = inventoryById.get(vehicle.id);
      const premium = getPremiumVehicle(vehicle.id);
      return [
        vehicle.id,
        {
          inventoryConfigured: data !== undefined,
          approved: data?.approved === true,
          availableUnits: count(data?.availableUnits),
          reservedUnits: count(data?.reservedUnits),
          ...(premium ? { priceDiamonds: premium.priceDiamonds } : {}),
          serverInstallationConfirmed:
            data?.serverInstallationConfirmed === true,
        },
      ];
    }),
  );
}

export async function createOrder(
  db: Firestore,
  account: PublicAccount,
  input: {
    vehicleId: string;
    idempotencyKey: string;
    handover: "pickup" | "delivery";
    express: boolean;
    paymentMethod: "terminal" | "handover";
    acceptedOfferId?: string;
  },
) {
  const vehicle = vehicles.find((item) => item.id === input.vehicleId);
  const premium = getPremiumVehicle(input.vehicleId);
  if (
    (!premium && !input.acceptedOfferId) ||
    vehicle?.verificationStatus !== "verified" ||
    !vehicle.orderEligible
  ) {
    throw new HttpError(
      "Dieses Fahrzeug ist nicht freigegeben.",
      404,
      "vehicle_unavailable",
    );
  }

  const idempotencyId = stableDocumentKey(
    "order-idempotency",
    `${account.id}\0${input.idempotencyKey}`,
  );
  const idempotencyRef = db.collection("orderIdempotency").doc(idempotencyId);
  const userRef = db.collection("users").doc(account.id);
  const inventoryRef = db.collection("inventory").doc(vehicle.id);
  const shopSettingsRef = db.collection("shopSettings").doc("config");
  const customerVehicleRef = db
    .collection("customerVehicleReservations")
    .doc(stableDocumentKey("customer-vehicle", `${account.id}\0${vehicle.id}`));
  const orderRef = db.collection("orders").doc();
  const acceptedInquiryRef = input.acceptedOfferId
    ? db.collection("customerInquiries").doc(input.acceptedOfferId)
    : null;
  const orderNumber = `SKY-${new Date().getFullYear()}-${orderRef.id.slice(0, 10).toUpperCase()}`;
  const orderNumberRef = db.collection("orderNumbers").doc(orderNumber);
  const auditRef = db.collection("auditLogs").doc();

  const result = await db.runTransaction(async (transaction) => {
    const previousAttempt = await transaction.get(idempotencyRef);
    if (previousAttempt.exists) {
      const previousOrderId = previousAttempt.get("orderId");
      const previousOrder =
        typeof previousOrderId === "string"
          ? await transaction.get(db.collection("orders").doc(previousOrderId))
          : null;
      return {
        orderNumber: previousAttempt.get("orderNumber") as string,
        reused: true,
        totalPrice: previousOrder?.get("totalPrice") as number | undefined,
      };
    }

    const [
      userSnapshot,
      inventorySnapshot,
      numberSnapshot,
      existingVehicleReservation,
      shopSettingsSnapshot,
      acceptedInquirySnapshot,
    ] = await Promise.all([
      transaction.get(userRef),
      transaction.get(inventoryRef),
      transaction.get(orderNumberRef),
      transaction.get(customerVehicleRef),
      transaction.get(shopSettingsRef),
      acceptedInquiryRef
        ? transaction.get(acceptedInquiryRef)
        : Promise.resolve(null),
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
    if (numberSnapshot.exists) {
      throw new HttpError(
        "Die Bestellnummer konnte nicht erzeugt werden. Bitte erneut versuchen.",
        409,
        "number_collision",
      );
    }
    if (existingVehicleReservation.exists) {
      throw new HttpError(
        "Für dieses Fahrzeug besteht bereits eine offene Bestellung.",
        409,
        "duplicate_reservation",
      );
    }

    let acceptedOfferPrice: number | null = null;
    if (acceptedInquiryRef) {
      if (
        !acceptedInquirySnapshot?.exists ||
        acceptedInquirySnapshot.get("customerId") !== account.id ||
        acceptedInquirySnapshot.get("vehicleId") !== vehicle.id ||
        acceptedInquirySnapshot.get("offerStatus") !== "offered" ||
        acceptedInquirySnapshot.get("status") === "closed"
      ) {
        throw new HttpError(
          "Dieses Angebot ist nicht mehr gültig.",
          409,
          "offer_unavailable",
        );
      }
      const offerPrice = acceptedInquirySnapshot.get("offerPriceDiamonds");
      if (!Number.isSafeInteger(offerPrice) || Number(offerPrice) < 1) {
        throw new HttpError(
          "Das Angebot enthält keinen gültigen Diamantenpreis.",
          409,
          "offer_price_invalid",
        );
      }
      acceptedOfferPrice = Number(offerPrice);
    }

    const settings = shopSettingsSnapshot.exists
      ? parseShopSettings(shopSettingsSnapshot.data() ?? {})
      : defaultShopSettings;
    const blockedReason = shopOrderBlockReason(
      settings,
      userSnapshot.get("minecraftVerified") === true,
      input.handover,
      input.express,
    );
    if (blockedReason) {
      const errors = {
        shop_closed: [
          "Der Shop nimmt derzeit keine neuen Bestellungen an.",
          409,
        ],
        shop_maintenance: [
          "Der Shop ist wegen Wartungsarbeiten vorübergehend geschlossen.",
          503,
        ],
        shop_verification_required: [
          "Im eingeschränkten Betrieb können nur verifizierte Minecraft-Konten bestellen.",
          403,
        ],
        shop_restricted_options: [
          "Im eingeschränkten Betrieb sind nur Abholung ohne Express verfügbar.",
          409,
        ],
      } as const;
      const [message, status] = errors[blockedReason];
      throw new HttpError(message, status, blockedReason);
    }

    const inventory = inventorySnapshot.data();
    const availableUnits = count(inventory?.availableUnits);
    const reservedUnits = count(inventory?.reservedUnits);
    if (
      !canOfferVehicle(
        vehicle.orderEligible,
        inventory?.serverInstallationConfirmed === true,
        inventory?.approved === true,
        availableUnits,
        reservedUnits,
      )
    ) {
      throw new HttpError(
        "Dieses Fahrzeug ist derzeit nicht verfügbar.",
        409,
        "not_available",
      );
    }

    const unitPrice = premium?.priceDiamonds ?? acceptedOfferPrice;
    if (unitPrice === null || unitPrice === undefined) {
      throw new HttpError(
        "Für dieses Fahrzeug liegt kein bestätigter Festpreis oder Angebot vor.",
        409,
        "price_unavailable",
      );
    }
    const deliveryPrice =
      input.handover === "delivery" ? settings.deliveryFee : 0;
    const expressPrice = input.express ? settings.expressFee : 0;
    const totalPrice = calculateOrderTotal(
      unitPrice,
      input.handover,
      input.express,
      settings,
    );
    const order: Omit<OrderView, "createdAt" | "paidAt" | "handedOverAt"> & {
      createdAt: unknown;
      updatedAt: unknown;
    } = {
      id: orderRef.id,
      orderNumber,
      customerId: account.id,
      minecraftUsername: userSnapshot.get("minecraftUsername") as string,
      minecraftVerifiedAtOrder: userSnapshot.get("minecraftVerified") === true,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      packName: vehicle.packName,
      unitPrice,
      deliveryPrice,
      expressPrice,
      totalPrice,
      handover: input.handover,
      express: input.express,
      paymentMethod: input.paymentMethod,
      paymentStatus: "unpaid",
      status: "reserved",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    transaction.update(inventoryRef, {
      reservedUnits: reservedUnits + 1,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(customerVehicleRef, {
      orderId: orderRef.id,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(orderRef, order);
    transaction.create(orderNumberRef, {
      orderId: orderRef.id,
      createdAt: FieldValue.serverTimestamp(),
    });
    if (acceptedInquiryRef) {
      transaction.update(acceptedInquiryRef, {
        offerStatus: "accepted",
        status: "closed",
        orderId: orderRef.id,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: account.id,
      });
    }
    transaction.create(idempotencyRef, {
      orderId: orderRef.id,
      orderNumber,
      totalPrice,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorId: account.id,
      action: "order.created",
      targetId: orderRef.id,
      orderNumber,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { orderNumber, totalPrice, reused: false };
  });

  return result;
}

export async function listOrdersForCustomer(db: Firestore, customerId: string) {
  const snapshot = await db
    .collection("orders")
    .where("customerId", "==", customerId)
    .get();
  return snapshot.docs
    .map((doc) => toOrderView(doc.id, doc.data() as OrderRecord))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function getCustomerOrderById(
  db: Firestore,
  customerId: string,
  orderId: string,
) {
  if (!/^[A-Za-z0-9]{20}$/.test(orderId)) return null;
  const snapshot = await db.collection("orders").doc(orderId).get();
  if (!snapshot.exists || snapshot.get("customerId") !== customerId)
    return null;
  return toOrderView(snapshot.id, snapshot.data() as OrderRecord);
}

export async function listAdminOrders(db: Firestore) {
  const snapshot = await db.collection("orders").get();
  return snapshot.docs
    .map((doc) => toOrderView(doc.id, doc.data() as OrderRecord))
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function listAdminCustomers(db: Firestore) {
  const snapshot = await db.collection("users").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      minecraftUsername: String(data.minecraftUsername ?? ""),
      role:
        data.role === "owner" || data.role === "staff" ? data.role : "customer",
      staffRole:
        data.role === "staff" && isStaffRole(data.staffRole)
          ? data.staffRole
          : null,
      minecraftVerified: data.minecraftVerified === true,
      accountStatus: data.accountStatus === "disabled" ? "disabled" : "active",
      createdAt: timestampMillis(data.createdAt),
    };
  });
}

export async function listAdminAuditActivities(
  db: Firestore,
): Promise<AdminActivityView[]> {
  const snapshot = await db
    .collection("auditLogs")
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    actorId: String(doc.get("actorId") ?? ""),
    action: String(doc.get("action") ?? "administrative_action"),
    targetId: String(doc.get("targetId") ?? ""),
    createdAt: timestampMillis(doc.get("createdAt")),
  }));
}

export async function getHomepageHighlightVehicleId(
  db: Firestore,
  dateKey: string,
) {
  const snapshot = await db.collection("homepageHighlights").doc(dateKey).get();
  const vehicleId = snapshot.get("vehicleId");
  return typeof vehicleId === "string" &&
    vehicles.some(
      (vehicle) => vehicle.id === vehicleId && vehicle.orderEligible,
    )
    ? vehicleId
    : null;
}

export async function setHomepageHighlight(
  db: Firestore,
  actor: PublicAccount,
  input: { vehicleId?: string; dateKey: string },
) {
  if (actor.role !== "owner") {
    throw new HttpError(
      "Nur der Inhaber darf Startseiten-Highlights festlegen.",
      403,
      "owner_required",
    );
  }
  const vehicle = input.vehicleId
    ? vehicles.find(
        (entry) => entry.id === input.vehicleId && entry.orderEligible,
      )
    : null;
  if (input.vehicleId && !vehicle) {
    throw new HttpError(
      "Das Modell ist nicht für ein Highlight freigegeben.",
      409,
      "vehicle_not_eligible",
    );
  }
  const date = new Date(`${input.dateKey}T00:00:00.000Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dateOffset = Math.round(
    (date.getTime() - today.getTime()) / 86_400_000,
  );
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== input.dateKey ||
    dateOffset < 0 ||
    dateOffset > 30
  ) {
    throw new HttpError(
      "Wähle einen gültigen Tag innerhalb der nächsten 30 Tage.",
      400,
      "date_out_of_range",
    );
  }
  const highlightRef = db.collection("homepageHighlights").doc(input.dateKey);
  const auditRef = db.collection("auditLogs").doc();
  await db.runTransaction(async (transaction) => {
    if (vehicle) {
      transaction.set(highlightRef, {
        dateKey: input.dateKey,
        vehicleId: vehicle.id,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actor.id,
      });
    } else {
      transaction.delete(highlightRef);
    }
    transaction.create(auditRef, {
      actorId: actor.id,
      action: vehicle
        ? "marketing.homepage_highlight_set"
        : "marketing.homepage_highlight_cleared",
      targetId: input.dateKey,
      ...(vehicle ? { vehicleId: vehicle.id } : {}),
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function updateStaffRole(
  db: Firestore,
  actor: PublicAccount,
  input: { userId: string; staffRole: StaffRole | null },
) {
  if (actor.role !== "owner") {
    throw new HttpError(
      "Nur der Inhaber darf Mitarbeiterrollen vergeben.",
      403,
      "owner_required",
    );
  }
  if (input.userId === actor.id) {
    throw new HttpError(
      "Die eigene Rolle kann nicht geändert werden.",
      409,
      "self_role_change",
    );
  }
  const userRef = db.collection("users").doc(input.userId);
  const auditRef = db.collection("auditLogs").doc();
  let changed = false;
  await db.runTransaction(async (transaction) => {
    const user = await transaction.get(userRef);
    if (!user.exists || user.get("accountStatus") !== "active") {
      throw new HttpError(
        "Aktives Kundenkonto nicht gefunden.",
        404,
        "customer_not_found",
      );
    }
    const currentRole = user.get("role");
    if (currentRole === "owner") {
      throw new HttpError(
        "Ein Inhaberkonto kann hier nicht geändert werden.",
        409,
        "owner_immutable",
      );
    }
    if (input.staffRole && user.get("minecraftVerified") !== true) {
      throw new HttpError(
        "Bestätige zuerst die Minecraft-Identität.",
        409,
        "identity_not_verified",
      );
    }
    const currentStaffRole =
      currentRole === "staff" ? user.get("staffRole") : null;
    if (currentStaffRole === input.staffRole) return;
    if (!input.staffRole && currentRole !== "staff") return;

    changed = true;
    transaction.update(userRef, {
      role: input.staffRole ? "staff" : "customer",
      staffRole: input.staffRole,
      staffRoleUpdatedAt: FieldValue.serverTimestamp(),
      staffRoleUpdatedBy: actor.id,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorId: actor.id,
      action: input.staffRole ? "staff.role_assigned" : "staff.role_revoked",
      targetId: input.userId,
      staffRole: input.staffRole,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { changed };
}

export async function listAdminInventory(db: Firestore) {
  const snapshot = await db.collection("inventory").get();
  const inventoryById = new Map(
    snapshot.docs.map((doc) => [doc.id, doc.data()]),
  );
  return vehicles.map((vehicle) => {
    const data = inventoryById.get(vehicle.id);
    const approved = data?.approved === true;
    const availableUnits = count(data?.availableUnits);
    const reservedUnits = count(data?.reservedUnits);
    return {
      vehicleId: vehicle.id,
      inventoryConfigured: data !== undefined,
      approved,
      manufacturer: vehicle.manufacturer ?? "Hersteller nicht hinterlegt",
      availableUnits,
      reservedUnits,
      priceDiamonds:
        getPremiumVehicle(vehicle.id)?.priceDiamonds ??
        storedPrice(data?.priceDiamonds, vehicle.priceDiamonds),
      orderEligible: vehicle.orderEligible,
      ineligibilityReason: vehicle.ineligibilityReason,
      serverInstallationConfirmed: data?.serverInstallationConfirmed === true,
      priceBasis: vehicle.priceBasis,
      vehicleClass: vehicle.vehicleClass,
      vehicleName: vehicle.name,
      packName: vehicle.packName,
      canOrder:
        Boolean(getPremiumVehicle(vehicle.id)) &&
        canOfferVehicle(
          vehicle.orderEligible,
          data?.serverInstallationConfirmed === true,
          approved,
          availableUnits,
          reservedUnits,
        ),
    };
  });
}

export async function updateInventory(
  db: Firestore,
  actor: PublicAccount,
  input: {
    vehicleId: string;
    approved: boolean;
    availableUnits: number;
    priceDiamonds: number;
    serverInstallationConfirmed: boolean;
  },
) {
  const vehicle = vehicles.find((item) => item.id === input.vehicleId);
  if (!vehicle)
    throw new HttpError("Fahrzeug nicht gefunden.", 404, "vehicle_not_found");
  const premium = getPremiumVehicle(vehicle.id);
  if (premium && input.priceDiamonds !== premium.priceDiamonds) {
    throw new HttpError(
      "Der öffentliche Premiumpreis ist fest vorgegeben.",
      409,
      "premium_price_locked",
    );
  }
  if (!vehicle.orderEligible && (input.approved || input.availableUnits > 0)) {
    throw new HttpError(
      vehicle.ineligibilityReason ?? "Dieses Fahrzeug ist nicht bestellbar.",
      409,
      "vehicle_not_order_eligible",
    );
  }
  if (
    (input.approved || input.availableUnits > 0) &&
    !input.serverInstallationConfirmed
  ) {
    throw new HttpError(
      "Bestätige zuerst, dass genau diese Fahrzeugdatei auf dem Zielserver installiert und getestet ist.",
      409,
      "server_installation_unconfirmed",
    );
  }
  const ref = db.collection("inventory").doc(vehicle.id);
  const auditRef = db.collection("auditLogs").doc();

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existingPrice = storedPrice(
      snapshot.get("priceDiamonds"),
      vehicle.priceDiamonds,
    );
    if (
      !canChangeVehiclePrice(actor.role, existingPrice, input.priceDiamonds)
    ) {
      throw new HttpError(
        "Nur der Inhaber darf Fahrzeugpreise ändern.",
        403,
        "owner_required",
      );
    }
    const reservedUnits = count(snapshot.get("reservedUnits"));
    if (!canSetAvailableUnits(input.availableUnits, reservedUnits)) {
      throw new HttpError(
        "Der Bestand darf nicht kleiner als die offenen Reservierungen sein.",
        409,
        "stock_reserved",
      );
    }
    transaction.set(
      ref,
      {
        vehicleId: vehicle.id,
        approved: input.approved,
        availableUnits: input.availableUnits,
        reservedUnits,
        priceDiamonds: input.priceDiamonds,
        serverInstallationConfirmed: input.serverInstallationConfirmed,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actor.id,
      },
      { merge: true },
    );
    transaction.create(auditRef, {
      actorId: actor.id,
      action: "inventory.updated",
      targetId: vehicle.id,
      approved: input.approved,
      availableUnits: input.availableUnits,
      priceDiamonds: input.priceDiamonds,
      serverInstallationConfirmed: input.serverInstallationConfirmed,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function pauseInventorySales(
  db: Firestore,
  actor: PublicAccount,
  vehicleIds: string[],
) {
  const uniqueIds = Array.from(new Set(vehicleIds));
  const selected = uniqueIds.map((vehicleId) => {
    const vehicle = vehicles.find((entry) => entry.id === vehicleId);
    if (!vehicle) {
      throw new HttpError("Fahrzeug nicht gefunden.", 404, "vehicle_not_found");
    }
    return vehicle;
  });
  if (selected.length < 1 || selected.length > 50) {
    throw new HttpError("Wähle 1 bis 50 Fahrzeuge aus.", 400, "bulk_limit");
  }

  await db.runTransaction(async (transaction) => {
    const records = await Promise.all(
      selected.map((vehicle) =>
        transaction.get(db.collection("inventory").doc(vehicle.id)),
      ),
    );
    selected.forEach((vehicle, index) => {
      const record = records[index];
      if (!record) return;
      transaction.set(
        db.collection("inventory").doc(vehicle.id),
        {
          vehicleId: vehicle.id,
          approved: false,
          availableUnits: count(record.get("availableUnits")),
          reservedUnits: count(record.get("reservedUnits")),
          priceDiamonds: storedPrice(
            record.get("priceDiamonds"),
            vehicle.priceDiamonds,
          ),
          serverInstallationConfirmed:
            record.get("serverInstallationConfirmed") === true,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: actor.id,
        },
        { merge: true },
      );
      const auditRef = db.collection("auditLogs").doc();
      transaction.create(auditRef, {
        actorId: actor.id,
        action: "inventory.sales_paused",
        targetId: vehicle.id,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  });
}

export async function verifyCustomerIdentity(
  db: Firestore,
  actor: PublicAccount,
  userId: string,
) {
  const userRef = db.collection("users").doc(userId);
  const auditRef = db.collection("auditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const user = await transaction.get(userRef);
    if (!user.exists || user.get("accountStatus") !== "active") {
      throw new HttpError(
        "Kundenkonto nicht gefunden.",
        404,
        "customer_not_found",
      );
    }
    if (user.get("minecraftVerified") === true) return;
    transaction.update(userRef, {
      minecraftVerified: true,
      minecraftVerifiedAt: FieldValue.serverTimestamp(),
      minecraftVerifiedBy: actor.id,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorId: actor.id,
      action: "customer.minecraft_identity_verified",
      targetId: userId,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function applyOrderAction(
  db: Firestore,
  actor: PublicAccount,
  input:
    | { action: "confirm_payment"; orderId: string }
    | {
        action: "set_status";
        orderId: string;
        status:
          | "in_production"
          | "ready_for_handover"
          | "delivered"
          | "cancelled";
      },
) {
  const orderRef = db.collection("orders").doc(input.orderId);
  const auditRef = db.collection("auditLogs").doc();
  const notificationRef = db.collection("notifications").doc();
  await db.runTransaction(async (transaction) => {
    const orderSnapshot = await transaction.get(orderRef);
    if (!orderSnapshot.exists)
      throw new HttpError("Bestellung nicht gefunden.", 404, "order_not_found");
    const order = orderSnapshot.data() as OrderRecord;
    const userRef = db.collection("users").doc(order.customerId);
    const inventoryRef = db.collection("inventory").doc(order.vehicleId);

    if (input.action === "confirm_payment") {
      if (order.paymentStatus === "paid") return;
      if (!canConfirmPayment(order.status, order.paymentStatus)) {
        throw new HttpError(
          "Für diese Bestellung kann keine Zahlung bestätigt werden.",
          409,
          "payment_transition",
        );
      }
      const customer = await transaction.get(userRef);
      if (customer.get("minecraftVerified") !== true) {
        throw new HttpError(
          "Prüfe zuerst die Minecraft-Identität des Kunden.",
          409,
          "identity_not_verified",
        );
      }
      transaction.update(orderRef, {
        paymentStatus: "paid",
        paidAt: FieldValue.serverTimestamp(),
        paidBy: actor.id,
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.create(auditRef, {
        actorId: actor.id,
        action: "order.payment_confirmed",
        targetId: input.orderId,
        orderNumber: order.orderNumber,
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.create(notificationRef, {
        customerId: order.customerId,
        title: "Zahlung bestätigt",
        message:
          "Die Zahlung für Auftrag " +
          order.orderNumber +
          " wurde manuell bestätigt.",
        href: "/kundenbereich#bestellungen",
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
      return;
    }

    const customer = await transaction.get(userRef);
    const verified = customer.get("minecraftVerified") === true;
    const currentStatus = order.status as OrderStatus;
    const paymentStatus = order.paymentStatus as PaymentStatus;
    if (
      !canTransitionOrder(currentStatus, input.status, paymentStatus, verified)
    ) {
      throw new HttpError(
        "Statuswechsel nicht möglich. Prüfe Identität, Zahlung und vorherigen Bestellstatus.",
        409,
        "status_transition",
      );
    }

    if (input.status === "delivered" || input.status === "cancelled") {
      const inventorySnapshot = await transaction.get(inventoryRef);
      const customerVehicleRef = db
        .collection("customerVehicleReservations")
        .doc(
          stableDocumentKey(
            "customer-vehicle",
            `${order.customerId}\0${order.vehicleId}`,
          ),
        );
      const customerVehicleSnapshot = await transaction.get(customerVehicleRef);
      const reservedUnits = count(inventorySnapshot.get("reservedUnits"));
      const availableUnits = count(inventorySnapshot.get("availableUnits"));
      if (reservedUnits < 1) {
        throw new HttpError(
          "Die Bestandsreservierung ist inkonsistent; Übergabe gestoppt.",
          409,
          "inventory_inconsistent",
        );
      }
      if (customerVehicleSnapshot.get("orderId") !== input.orderId) {
        throw new HttpError(
          "Die Kundenreservierung ist inkonsistent; Übergabe gestoppt.",
          409,
          "reservation_inconsistent",
        );
      }
      transaction.update(inventoryRef, {
        reservedUnits: reservedUnits - 1,
        ...(input.status === "delivered"
          ? { availableUnits: Math.max(0, availableUnits - 1) }
          : {}),
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.delete(customerVehicleRef);
    }

    transaction.update(orderRef, {
      status: input.status,
      updatedAt: FieldValue.serverTimestamp(),
      ...(input.status === "delivered"
        ? { handedOverAt: FieldValue.serverTimestamp(), handedOverBy: actor.id }
        : {}),
      ...(input.status === "cancelled"
        ? { cancelledAt: FieldValue.serverTimestamp(), cancelledBy: actor.id }
        : {}),
    });
    transaction.create(auditRef, {
      actorId: actor.id,
      action: `order.status.${input.status}`,
      targetId: input.orderId,
      orderNumber: order.orderNumber,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(notificationRef, {
      customerId: order.customerId,
      title: "Bestellstatus aktualisiert",
      message:
        "Auftrag " +
        order.orderNumber +
        ": " +
        orderStatusLabels[input.status] +
        ".",
      href: "/kundenbereich#bestellungen",
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}
