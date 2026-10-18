export const shopModes = [
  "open",
  "restricted",
  "closed",
  "maintenance",
] as const;

export type ShopMode = (typeof shopModes)[number];

export type ShopSettings = {
  mode: ShopMode;
  deliveryFee: number;
  expressFee: number;
};

export type OrderFees = Pick<ShopSettings, "deliveryFee" | "expressFee">;

export const defaultShopSettings: ShopSettings = {
  mode: "open",
  deliveryFee: 12,
  expressFee: 8,
};

export const shopModeLabels: Record<ShopMode, string> = {
  open: "Geöffnet",
  restricted: "Eingeschränkt",
  closed: "Geschlossen",
  maintenance: "Wartung",
};

export function isShopMode(value: unknown): value is ShopMode {
  return shopModes.includes(value as ShopMode);
}

export function shopOrderBlockReason(
  settings: ShopSettings,
  customerVerified: boolean,
  handover: "pickup" | "delivery",
  express: boolean,
) {
  if (settings.mode === "closed") return "shop_closed" as const;
  if (settings.mode === "maintenance") return "shop_maintenance" as const;
  if (settings.mode === "restricted") {
    if (!customerVerified) return "shop_verification_required" as const;
    if (handover !== "pickup" || express)
      return "shop_restricted_options" as const;
  }
  return null;
}
