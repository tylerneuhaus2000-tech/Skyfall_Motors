import { defaultShopSettings, type OrderFees } from "./shop-settings-domain";

export const orderStatuses = [
  "reserved",
  "in_production",
  "ready_for_handover",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];
export type PaymentStatus = "unpaid" | "paid";

export function resolveOrderUnitPrice(
  catalogPrice: number,
  savedPrice?: number,
) {
  const price = savedPrice ?? catalogPrice;
  if (
    !Number.isSafeInteger(catalogPrice) ||
    catalogPrice < 1 ||
    catalogPrice > 100_000 ||
    !Number.isSafeInteger(price) ||
    price < 1 ||
    price > 100_000
  ) {
    throw new RangeError(
      "Vehicle price must be a safe integer from 1 to 100000",
    );
  }
  return price;
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  reserved: "Eingegangen",
  in_production: "In Fertigung",
  ready_for_handover: "Zur Übergabe bereit",
  delivered: "Übergeben",
  cancelled: "Storniert",
};

export function calculateOrderTotal(
  vehiclePrice: number,
  handover: "pickup" | "delivery",
  express: boolean,
  fees: OrderFees = defaultShopSettings,
) {
  if (!Number.isSafeInteger(vehiclePrice) || vehiclePrice <= 0) {
    throw new RangeError(
      "Der Fahrzeugpreis muss eine positive ganze Diamantenzahl sein.",
    );
  }
  if (
    !Number.isSafeInteger(fees.deliveryFee) ||
    fees.deliveryFee < 0 ||
    !Number.isSafeInteger(fees.expressFee) ||
    fees.expressFee < 0
  ) {
    throw new RangeError("Gebühren müssen nichtnegative ganze Zahlen sein.");
  }
  return (
    vehiclePrice +
    (handover === "delivery" ? fees.deliveryFee : 0) +
    (express ? fees.expressFee : 0)
  );
}

export function canChangeVehiclePrice(
  actorRole: "customer" | "owner" | "staff",
  existingPrice: number,
  nextPrice: number,
) {
  return actorRole === "owner" || existingPrice === nextPrice;
}

export function isPurchaseReceiptEligible(order: {
  status: string;
  paymentStatus: string;
  handedOverAt: number | null;
}): order is {
  status: string;
  paymentStatus: string;
  handedOverAt: number;
} {
  return (
    order.status === "delivered" &&
    order.paymentStatus === "paid" &&
    typeof order.handedOverAt === "number" &&
    order.handedOverAt > 0
  );
}

export function canReserveVehicle(
  approved: boolean,
  availableUnits: number,
  reservedUnits: number,
) {
  return (
    approved &&
    Number.isSafeInteger(availableUnits) &&
    Number.isSafeInteger(reservedUnits) &&
    availableUnits >= 0 &&
    reservedUnits >= 0 &&
    reservedUnits < availableUnits
  );
}

export function canOfferVehicle(
  packEligible: boolean,
  serverInstallationConfirmed: boolean,
  approved: boolean,
  availableUnits: number,
  reservedUnits: number,
) {
  return (
    packEligible &&
    serverInstallationConfirmed &&
    canReserveVehicle(approved, availableUnits, reservedUnits)
  );
}

export function canSetAvailableUnits(
  availableUnits: number,
  reservedUnits: number,
) {
  return (
    Number.isSafeInteger(availableUnits) &&
    Number.isSafeInteger(reservedUnits) &&
    availableUnits >= reservedUnits &&
    reservedUnits >= 0
  );
}

export function canTransitionOrder(
  current: OrderStatus,
  next: OrderStatus,
  payment: PaymentStatus,
  minecraftVerified: boolean,
) {
  if (next === "cancelled") {
    return (
      payment === "unpaid" &&
      (current === "reserved" || current === "in_production")
    );
  }

  if (!minecraftVerified) return false;
  if (current === "reserved" && next === "in_production") return true;
  if (current === "in_production" && next === "ready_for_handover") return true;
  return (
    current === "ready_for_handover" &&
    next === "delivered" &&
    payment === "paid"
  );
}

export function canConfirmPayment(status: OrderStatus, payment: PaymentStatus) {
  return status !== "cancelled" && payment === "unpaid";
}
