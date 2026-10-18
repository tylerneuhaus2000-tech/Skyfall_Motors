import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { vehicles } from "../src/lib/catalog";
import { premiumVehicles } from "../src/lib/premium-catalog";
import { vehicleReferencePhotos } from "../src/lib/vehicle-images";

describe("SKYFALL Premium-Sortiment", () => {
  it("führt genau die 16 eindeutigen, vorhandenen Fahrzeuge in Spezifikationsreihenfolge", () => {
    expect(premiumVehicles).toHaveLength(16);
    expect(premiumVehicles.map(({ priceDiamonds }) => priceDiamonds)).toEqual([
      175, 240, 320, 220, 145, 150, 130, 280, 115, 160, 95, 180, 105, 85, 110,
      125,
    ]);
    expect(
      new Set(premiumVehicles.map(({ vehicleId }) => vehicleId)).size,
    ).toBe(16);
    for (const item of premiumVehicles) {
      expect(
        vehicles.some(({ id }) => id === item.vehicleId),
        item.vehicleId,
      ).toBe(true);
      expect(Number.isSafeInteger(item.priceDiamonds)).toBe(true);
      expect(item.priceDiamonds).toBeGreaterThan(0);
    }
  });

  it("hat für jedes Premium-Fahrzeug ein lokales Bild und nachvollziehbare Quelle/Lizenz", () => {
    for (const { vehicleId } of premiumVehicles) {
      const photo = vehicleReferencePhotos[vehicleId];
      expect(photo, vehicleId).toBeDefined();
      expect(photo.src, vehicleId).toMatch(/\.webp$/);
      expect(existsSync(join(process.cwd(), "public", photo.src))).toBe(true);
      expect(photo.author.trim().length, vehicleId).toBeGreaterThan(0);
      expect(photo.sourceUrl, vehicleId).toMatch(/^https:\/\//);
      expect(photo.license.trim().length, vehicleId).toBeGreaterThan(0);
      expect(photo.licenseUrl, vehicleId).toMatch(/^https:\/\//);
    }
  });
});
