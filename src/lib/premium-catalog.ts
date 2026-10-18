export const premiumVehicles = [
  { vehicleId: "craftspeed-m3gtr", priceDiamonds: 175 },
  { vehicleId: "craftspeed-huracanevo", priceDiamonds: 240 },
  { vehicleId: "svmp-valkyrie", priceDiamonds: 320 },
  { vehicleId: "craftspeed-360", priceDiamonds: 220 },
  { vehicleId: "craftspeed-r34", priceDiamonds: 145 },
  { vehicleId: "craftspeed-930", priceDiamonds: 150 },
  { vehicleId: "craftspeed-s650", priceDiamonds: 130 },
  { vehicleId: "svmp-evija", priceDiamonds: 280 },
  { vehicleId: "craftspeed-e39", priceDiamonds: 115 },
  { vehicleId: "svmp-pantera", priceDiamonds: 160 },
  { vehicleId: "craftspeed-evo9", priceDiamonds: 95 },
  { vehicleId: "svmp-wiesmann", priceDiamonds: 180 },
  { vehicleId: "craftspeed-e30", priceDiamonds: 105 },
  { vehicleId: "gt-craft-nissan-180sx", priceDiamonds: 85 },
  { vehicleId: "gt-craft-mazda-fd3s-late", priceDiamonds: 110 },
  { vehicleId: "gt-craft-toyota-a80", priceDiamonds: 125 },
] as const;

export type PremiumVehicleId = (typeof premiumVehicles)[number]["vehicleId"];
const premiumById = new Map(
  premiumVehicles.map((item, index) => [
    item.vehicleId,
    { ...item, rank: index + 1 },
  ]),
);

export function getPremiumVehicle(vehicleId: string) {
  return premiumById.get(vehicleId as PremiumVehicleId);
}
