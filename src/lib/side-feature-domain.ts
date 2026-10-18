import type { OrderStatus } from "@/lib/order-domain";

export const deliverySteps: ReadonlyArray<{
  status: Exclude<OrderStatus, "cancelled">;
  label: string;
}> = [
  { status: "reserved", label: "Bestellung eingegangen" },
  { status: "in_production", label: "In Fertigung" },
  { status: "ready_for_handover", label: "Zur Übergabe bereit" },
  { status: "delivered", label: "Fahrzeug übergeben" },
];

export function getVehicleOfDay<T>(
  vehicles: readonly T[],
  now: Date,
): T | null {
  if (vehicles.length === 0) return null;
  const utcDay = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      86_400_000,
  );
  const index =
    ((utcDay % vehicles.length) + vehicles.length) % vehicles.length;
  return vehicles[index] ?? null;
}

const plateCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function sanitizePlateSuffix(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

export function generatePlateSuffix(randomBytes: Uint8Array) {
  if (randomBytes.length < 4) {
    throw new RangeError("Mindestens vier Zufallsbytes werden benötigt.");
  }
  return Array.from(randomBytes.slice(0, 6))
    .map((byte) => plateCharacters[byte % plateCharacters.length])
    .join("");
}

export type ApprovedDriverResult = {
  trackName: string;
  vehicleName: string;
  timeMs: number;
};

export function deriveDriverProfileStats(entries: ApprovedDriverResult[]) {
  const validEntries = entries.filter(
    (entry) => Number.isSafeInteger(entry.timeMs) && entry.timeMs > 0,
  );
  const personalBests = new Map<string, ApprovedDriverResult>();
  for (const entry of validEntries) {
    const current = personalBests.get(entry.trackName);
    if (!current || entry.timeMs < current.timeMs) {
      personalBests.set(entry.trackName, entry);
    }
  }
  return {
    approvedLapCount: validEntries.length,
    trackCount: new Set(validEntries.map((entry) => entry.trackName)).size,
    vehicleCount: new Set(validEntries.map((entry) => entry.vehicleName)).size,
    personalBests: Array.from(personalBests.entries())
      .map(([trackName, entry]) => ({
        trackName,
        vehicleName: entry.vehicleName,
        timeMs: entry.timeMs,
      }))
      .sort((left, right) =>
        left.trackName.localeCompare(right.trackName, "de"),
      ),
  };
}

export function canJoinVehicleWaitlist(inventory: {
  orderEligible: boolean;
  approved: boolean;
  serverInstallationConfirmed: boolean;
  availableUnits: number;
  reservedUnits: number;
}) {
  return (
    inventory.orderEligible &&
    inventory.approved &&
    inventory.serverInstallationConfirmed &&
    Number.isSafeInteger(inventory.availableUnits) &&
    Number.isSafeInteger(inventory.reservedUnits) &&
    inventory.availableUnits >= 0 &&
    inventory.reservedUnits >= 0 &&
    inventory.availableUnits <= inventory.reservedUnits
  );
}

export const workshopTicketStatuses = [
  "requested",
  "in_review",
  "waiting_for_parts",
  "ready",
  "completed",
  "declined",
] as const;

export type WorkshopTicketStatus = (typeof workshopTicketStatuses)[number];

export function canTransitionWorkshopTicket(
  current: WorkshopTicketStatus,
  next: WorkshopTicketStatus,
) {
  const transitions: Record<WorkshopTicketStatus, WorkshopTicketStatus[]> = {
    requested: ["in_review", "declined"],
    in_review: ["waiting_for_parts", "ready", "declined"],
    waiting_for_parts: ["ready", "declined"],
    ready: ["completed"],
    completed: [],
    declined: [],
  };
  return transitions[current].includes(next);
}

export function deliveryStepIndex(status: OrderStatus) {
  return status === "cancelled"
    ? -1
    : deliverySteps.findIndex((step) => step.status === status);
}

export function toggleComparedVehicle(ids: string[], vehicleId: string) {
  if (ids.includes(vehicleId)) {
    return { ids: ids.filter((id) => id !== vehicleId), error: null };
  }
  if (ids.length >= 3) {
    return { ids, error: "Du kannst höchstens drei Fahrzeuge vergleichen." };
  }
  return { ids: [...ids, vehicleId], error: null };
}

export function addRecentlyViewedVehicle(ids: string[], vehicleId: string) {
  return [vehicleId, ...ids.filter((id) => id !== vehicleId)].slice(0, 6);
}

export function isVehiclePassEligible(order: {
  status: OrderStatus;
  handedOverAt: number | null;
}) {
  return (
    order.status === "delivered" &&
    typeof order.handedOverAt === "number" &&
    order.handedOverAt > 0
  );
}

export function hasDeliveredVehicleOrder(
  orders: Array<{
    vehicleId: string;
    status: OrderStatus;
    handedOverAt: number | null;
  }>,
  vehicleId: string,
) {
  return orders.some(
    (order) => order.vehicleId === vehicleId && isVehiclePassEligible(order),
  );
}

export function nextTestDriveStatus(
  current: string,
  action: "approve" | "decline" | "complete",
) {
  if (current === "pending" && action === "approve") return "approved";
  if (current === "pending" && action === "decline") return "declined";
  if (current === "approved" && action === "complete") return "completed";
  return null;
}

export function canModeratePendingEntry(status: string) {
  return status === "pending";
}

export type BadgeOrder = {
  status: OrderStatus;
  vehicleId: string;
  packName: string;
  handedOverAt?: number | null;
};

export function deriveCollectorBadges(orders: BadgeOrder[]) {
  const delivered = orders.filter((order) =>
    isVehiclePassEligible({
      status: order.status,
      handedOverAt: order.handedOverAt ?? null,
    }),
  );
  const uniqueVehicles = new Set(delivered.map((order) => order.vehicleId));
  const uniquePacks = new Set(delivered.map((order) => order.packName));
  const badges: Array<{ id: string; title: string; description: string }> = [];

  if (delivered.length > 0) {
    badges.push({
      id: "first-handover",
      title: "Erstbesitz",
      description: "Mindestens ein tatsächlich übergebenes Fahrzeug.",
    });
  }
  if (uniqueVehicles.size >= 3) {
    badges.push({
      id: "collector-three",
      title: "Sammler",
      description: "Drei verschiedene übergebene Fahrzeuge.",
    });
  }
  if (uniquePacks.size >= 3) {
    badges.push({
      id: "pack-explorer",
      title: "Pack-Entdecker",
      description: "Fahrzeuge aus drei verschiedenen Content-Packs.",
    });
  }
  return badges;
}
