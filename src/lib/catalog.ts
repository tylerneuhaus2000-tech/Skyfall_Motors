import packVehicleRows from "./pack-vehicle-data.json";

export type SurvivalCraftingStatus =
  | "confirmed"
  | "unconfirmed"
  | "unsupported";
export type VehiclePriceBasis = "master-list" | "class-model";

export type Vehicle = {
  id: string;
  name: string;
  manufacturer: string | null;
  packId: string;
  packName: string;
  gameVersion: "1.21.1";
  loader: "NeoForge";
  packVersion: string;
  sourceFileId: string;
  sourceAssetId: string;
  sourceUrl: string;
  sourceNote: string;
  vehicleClass: string;
  variantCount: number;
  priceDiamonds: number;
  priceBasis: VehiclePriceBasis;
  survivalCrafting: SurvivalCraftingStatus;
  verificationStatus: "verified";
  orderStatus: "not-open";
  orderEligible: boolean;
  ineligibilityReason: string | null;
  serverInstallationStatus: "not-checked";
  /** Rights status for an in-game or pack image; real-car references live separately. */
  imageStatus: "rights-open";
};

type PackVehicleRow = {
  packId: string;
  packName: string;
  packVersion: string;
  sourceFileId: string;
  sourceUrl: string;
  assetId: string;
  name: string;
  vehicleClass: string;
  variantCount: number;
  survivalCrafting: SurvivalCraftingStatus;
  orderEligible: boolean;
  ineligibilityReason: string | null;
};

const rawPackVehicleRows = packVehicleRows as PackVehicleRow[];
const repeatedPackModelKeys = new Set(
  rawPackVehicleRows
    .filter(
      (row) =>
        rawPackVehicleRows.filter(
          (other) => other.packId === row.packId && other.name === row.name,
        ).length > 1,
    )
    .map((row) => `${row.packId}:${row.name}`),
);

const skuOverrides: Record<
  string,
  { id: string; name: string; priceDiamonds: number }
> = {
  "ocp:merc230": { id: "ocp-merc", name: "Merc", priceDiamonds: 11 },
  "ocp:scout": { id: "ocp-scout", name: "Scout", priceDiamonds: 18 },
  "ocp:gmcbrig": {
    id: "ocp-gmc-brigadier",
    name: "GMC Brigadier",
    priceDiamonds: 38,
  },
  "ocp:quad": { id: "ocp-quad", name: "Quad", priceDiamonds: 8 },
  "oamp:escargot": {
    id: "oamp-escargot",
    name: "Escargot",
    priceDiamonds: 9,
  },
  "oamp:luxorama": {
    id: "oamp-luxorama",
    name: "Luxorama",
    priceDiamonds: 22,
  },
  "oamp:cagouille": {
    id: "oamp-cagouille",
    name: "Cagouille",
    priceDiamonds: 11,
  },
  "oamp:highwayman": {
    id: "oamp-highwayman",
    name: "Highwayman",
    priceDiamonds: 30,
  },
};

const historicalPrices: Record<string, number> = {
  "ocp:fordmustang69": 25,
  "oamp:camaro": 27,
  "oamp:stationmerc": 13,
  "craftspeed:e36": 12,
  "craftspeed:e30touring": 14,
  "craftspeed:e30": 36,
  "craftspeed:e46": 42,
  "craftspeed:m3gtr": 95,
  "craftspeed:m4coupe": 48,
  "craftspeed:e39": 45,
  "craftspeed:e63": 48,
  "craftspeed:e64": 52,
  "craftspeed:m8": 60,
  "craftspeed:z8": 55,
  "craftspeed:amggt": 66,
  "craftspeed:930": 62,
  "craftspeed:huracanevo": 85,
  "craftspeed:huracanspyder": 92,
  "craftspeed:elise": 33,
  "craftspeed:r34": 62,
  "craftspeed:evo9": 39,
  "craftspeed:s650": 55,
  "craftspeed:f40": 110,
  "svmp:valkyrie": 145,
  "svmp:360spider": 64,
  "svmp:360stradale": 78,
  "svmp:elise": 33,
  "svmp:sagaris": 52,
  "svmp:wiesmann": 65,
  "gt-craft:ferrari_fxxk": 155,
  "gt-craft:ferrari_fxxkevo": 165,
  "gt-craft:lamborghini_diablo_gtr": 120,
  "gt-craft:mclaren_f1lm": 160,
  "gt-craft:mercedes_clkgtr": 145,
  "gt-craft:saleen_s7": 105,
  "gt-craft:saleen_s7lm": 125,
  "gt-craft:jaguar_xj220": 92,
  "gt-craft:jaguar_xj220s": 105,
  "gt-craft:lexus_lfa": 85,
  "gt-craft:lexus_lfanur": 100,
  "gt-craft:nissan_r35_my17": 70,
  "gt-craft:nissan_r35_my17_nismo": 85,
  "gt-craft:mitsubishi_lancer_evo_vi": 39,
  "gt-craft:porsche_964rs": 58,
  "gt-craft:nissan_bnr32": 46,
  "gt-craft:nissan_bcnr33": 48,
  "gt-craft:nissan_bnr34": 62,
  "gt-craft:toyota_a80": 54,
  "gt-craft:toyota_ae86_trueno": 25,
  "gt-craft:mazda_fd3s_late": 42,
};

const priceByClass: Record<string, number> = {
  Anhänger: 20,
  "Hypercar / Rennwagen": 145,
  Kleinwagen: 18,
  Luftfahrzeug: 125,
  Militärfahrzeug: 100,
  Nutzfahrzeug: 45,
  Personenwagen: 28,
  Quad: 8,
  Rennwagen: 75,
  Sportwagen: 55,
  "SUV / Geländewagen": 45,
};

const manufacturerPrefixes = [
  "Mercedes-AMG",
  "Mercedes-Benz",
  "Aston Martin",
  "AM General",
  "De Tomaso",
  "Koenigsegg",
  "Rolls-Royce",
  "Volkswagen",
  "Chevrolet",
  "Lamborghini",
  "Mitsubishi",
  "Subaru",
  "Nissan",
  "Toyota",
  "Ferrari",
  "Porsche",
  "McLaren",
  "Mercedes",
  "BMW",
  "Audi",
  "Honda",
  "Acura",
  "Mazda",
  "Ford",
  "Dodge",
  "Bugatti",
  "Pagani",
  "Rimac",
  "Lotus",
  "Lexus",
  "Jaguar",
  "Bentley",
  "Volvo",
  "Renault",
  "Suzuki",
  "Caterham",
  "Ariel",
  "Cizeta",
  "Lancia",
  "Wiesmann",
  "GMC",
  "PZL",
  "Ikarus",
  "MAN",
  "Opel",
  "Datsun",
  "Hyundai",
  "Kia",
  "Nismo",
  "Saleen",
];

function getManufacturer(name: string) {
  return (
    manufacturerPrefixes.find((prefix) =>
      name.toLocaleLowerCase("en").startsWith(prefix.toLocaleLowerCase("en")),
    ) ?? null
  );
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function suggestClassPriceDiamonds(vehicleClass: string) {
  return priceByClass[vehicleClass] ?? 35;
}

function toVehicle(row: PackVehicleRow): Vehicle {
  const sourceKey = `${row.packId}:${row.assetId}`;
  const override = skuOverrides[sourceKey];
  const historicalPrice = historicalPrices[sourceKey];
  const priceDiamonds =
    override?.priceDiamonds ??
    historicalPrice ??
    suggestClassPriceDiamonds(row.vehicleClass);

  return {
    id: override?.id ?? `${row.packId}-${slugify(row.assetId)}`,
    name:
      override?.name ??
      (repeatedPackModelKeys.has(`${row.packId}:${row.name}`)
        ? `${row.name} · Asset ${row.assetId}`
        : row.name),
    manufacturer: getManufacturer(override?.name ?? row.name),
    packId: row.packId,
    packName: row.packName,
    gameVersion: "1.21.1",
    loader: "NeoForge",
    packVersion: row.packVersion,
    sourceFileId: row.sourceFileId,
    sourceAssetId: row.assetId,
    sourceUrl: row.sourceUrl,
    sourceNote:
      `Im offiziellen ${row.packName}-Archiv ${row.packVersion} unter ` +
      `jsondefs/vehicles/${row.assetId}.json nachgewiesen.`,
    vehicleClass: row.vehicleClass,
    variantCount: row.variantCount,
    priceDiamonds,
    priceBasis: override || historicalPrice ? "master-list" : "class-model",
    survivalCrafting: row.survivalCrafting,
    verificationStatus: "verified",
    orderStatus: "not-open",
    orderEligible: row.orderEligible,
    ineligibilityReason: row.ineligibilityReason,
    serverInstallationStatus: "not-checked",
    imageStatus: "rights-open",
  };
}

const pinnedIds = [
  "ocp-merc",
  "ocp-scout",
  "ocp-gmc-brigadier",
  "ocp-quad",
  "oamp-escargot",
  "oamp-luxorama",
  "oamp-cagouille",
  "oamp-highwayman",
];
const pinnedRank = new Map(pinnedIds.map((id, index) => [id, index]));

export const vehicles: Vehicle[] = rawPackVehicleRows
  .map(toVehicle)
  .sort((left, right) => {
    const leftRank = pinnedRank.get(left.id);
    const rightRank = pinnedRank.get(right.id);
    if (leftRank !== undefined || rightRank !== undefined) {
      return (
        (leftRank ?? Number.MAX_SAFE_INTEGER) -
        (rightRank ?? Number.MAX_SAFE_INTEGER)
      );
    }
    return (
      left.packName.localeCompare(right.packName, "de") ||
      left.name.localeCompare(right.name, "de")
    );
  });

export function findVehicle(id: string) {
  return vehicles.find((vehicle) => vehicle.id === id);
}

export function formatDiamondPrice(price: number) {
  return new Intl.NumberFormat("de-DE").format(price);
}
