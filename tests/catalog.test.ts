import { describe, expect, it } from "vitest";
import { vehicles } from "../src/lib/catalog";
import legacyRows from "../src/lib/legacy-rage-data.json";
import packRows from "../src/lib/pack-vehicle-data.json";
import {
  explicitWishlistCount,
  vehicleCandidates,
} from "../src/lib/vehicle-candidates";

describe("öffentlicher Fahrzeugkatalog", () => {
  it("enthält nur eindeutige Einträge aus belegten 1.21.1-NeoForge-Archiven", () => {
    const ids = vehicles.map((vehicle) => vehicle.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(vehicles).toHaveLength(229);
    expect(
      vehicles.every(
        (vehicle) =>
          vehicle.verificationStatus === "verified" &&
          vehicle.gameVersion === "1.21.1" &&
          vehicle.loader === "NeoForge" &&
          Boolean(vehicle.sourceFileId && vehicle.sourceUrl),
      ),
    ).toBe(true);
    expect(packRows).toHaveLength(229);
  });

  it("hält Rezeptnachweis, Packdatei, Serverinstallation und Bestellfreigabe getrennt", () => {
    expect(vehicles.filter((vehicle) => vehicle.orderEligible)).toHaveLength(
      111,
    );
    expect(
      vehicles.every((vehicle) => vehicle.orderStatus === "not-open"),
    ).toBe(true);
    expect(
      vehicles.every(
        (vehicle) => vehicle.serverInstallationStatus === "not-checked",
      ),
    ).toBe(true);
    expect(
      vehicles.every((vehicle) => vehicle.imageStatus === "rights-open"),
    ).toBe(true);
    expect(
      vehicles
        .filter((vehicle) => vehicle.packId === "gt-craft")
        .every((vehicle) => !vehicle.orderEligible),
    ).toBe(true);
    expect(
      vehicles
        .filter((vehicle) => vehicle.packId === "svmp")
        .every((vehicle) => !vehicle.orderEligible),
    ).toBe(true);
  });

  it("bewahrt alle acht bisherigen Produkt-IDs und Masterlistenpreise", () => {
    for (const [id, price] of [
      ["ocp-merc", 11],
      ["ocp-scout", 18],
      ["ocp-gmc-brigadier", 38],
      ["ocp-quad", 8],
      ["oamp-escargot", 9],
      ["oamp-luxorama", 22],
      ["oamp-cagouille", 11],
      ["oamp-highwayman", 30],
    ] as const) {
      expect(vehicles.find((vehicle) => vehicle.id === id)?.priceDiamonds).toBe(
        price,
      );
    }
  });

  it("macht doppelte Modellnamen durch die Quell-Asset-ID unterscheidbar", () => {
    const labels = vehicles.map(
      (vehicle) => `${vehicle.packId}:${vehicle.name}`,
    );
    expect(new Set(labels).size).toBe(labels.length);
    for (const vehicle of vehicles.filter((item) =>
      ["e30", "e30p"].includes(item.sourceAssetId),
    )) {
      expect(vehicle.name).toContain(`Asset ${vehicle.sourceAssetId}`);
    }
  });

  it("prüft eindeutige Pack-Asset-IDs und nachvollziehbare Katalogpreise", () => {
    const sourceKeys = vehicles.map(
      (vehicle) => `${vehicle.packId}:${vehicle.sourceAssetId}`,
    );
    expect(new Set(sourceKeys).size).toBe(sourceKeys.length);
    expect(
      vehicles.every(
        (vehicle) =>
          Number.isSafeInteger(vehicle.priceDiamonds) &&
          vehicle.priceDiamonds > 0 &&
          (vehicle.priceBasis === "master-list" ||
            vehicle.priceBasis === "class-model") &&
          vehicle.packName.length > 0 &&
          vehicle.sourceFileId.length > 0 &&
          vehicle.sourceUrl.startsWith("https://"),
      ),
    ).toBe(true);
    expect(
      vehicles.every((vehicle) =>
        vehicle.orderEligible ? vehicle.survivalCrafting === "confirmed" : true,
      ),
    ).toBe(true);
  });
});

describe("Kandidaten und Wunschliste", () => {
  it("führt alle 182 Wunschlisten-Einträge, ohne Kandidaten bestellbar zu machen", () => {
    expect(explicitWishlistCount).toBe(182);
    expect(vehicleCandidates.length).toBeGreaterThanOrEqual(182);
    expect(
      vehicleCandidates.every((candidate) => candidate.orderEligible === false),
    ).toBe(true);
    const allIds = [...vehicles, ...vehicleCandidates].map((item) => item.id);
    const duplicateIds = allIds.filter(
      (id, index) => allIds.indexOf(id) !== index,
    );
    expect(duplicateIds).toEqual([]);
  });

  it("kennzeichnet alle 31 alten R.A.G.E.-Dateimodelle als inkompatibel", () => {
    const rage = vehicleCandidates.filter(
      (candidate) => candidate.status === "incompatible",
    );
    expect(legacyRows).toHaveLength(31);
    expect(rage).toHaveLength(31);
    expect(
      rage.every(
        (candidate) =>
          candidate.gameVersion === "1.20.1" && candidate.loader === "Forge",
      ),
    ).toBe(true);
  });
});
