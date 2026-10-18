import { suggestClassPriceDiamonds, vehicles } from "./catalog";
import legacyRageRows from "./legacy-rage-data.json";
import wishlistRows from "./vehicle-wishlist.json";

export type CandidateStatus = "candidate" | "incompatible";
export type CandidatePriceBasis = "master-list" | "class-model";

export type VehicleCandidate = {
  id: string;
  name: string;
  manufacturer: string | null;
  packId: string;
  packName: string;
  packVersion: string | null;
  gameVersion: string | null;
  loader: string | null;
  vehicleClass: "Noch nicht bestätigt";
  priceDiamonds: number;
  priceBasis: CandidatePriceBasis;
  status: CandidateStatus;
  sourceUrl: string | null;
  sourceNote: string;
  orderEligible: false;
  imageStatus: "rights-open";
};

type OldCandidateStatus = "needs-review" | "blocked" | "approval-required";
type CandidateGroup = {
  packId: string;
  packName: string;
  status: OldCandidateStatus;
  entries: ReadonlyArray<readonly [model: string, price: number | null]>;
};

type WishlistRow = {
  group: string;
  name: string;
  requestedPriceDiamonds: number | null;
};

type LegacyRageRow = {
  packId: string;
  packName: string;
  packVersion: string;
  sourceFileId: string;
  sourceUrl: string;
  assetId: string;
  name: string;
  vehicleClass: string;
  variantCount: number;
  survivalCrafting: string;
  orderEligible: false;
  ineligibilityReason: string;
};

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function modelKey(value: string) {
  return slugify(value)
    .replace(/-genaue-variante-(?:offen|prufen)$/u, "")
    .replace(/-pack-modell-offen$/u, "");
}

function getManufacturer(name: string, group?: string) {
  const prefixes = [
    "Mercedes-AMG",
    "Mercedes-Benz",
    "Aston Martin",
    "Rolls-Royce",
    "AM General",
    "De Tomaso",
    "Koenigsegg",
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
    "Opel",
    "Caterham",
    "Ariel",
    "Cizeta",
    "Lancia",
    "Wiesmann",
    "GMC",
    "PZL",
    "Ikarus",
    "MAN",
    "Datsun",
    "Hyundai",
    "Kia",
    "Nismo",
    "Saleen",
  ];
  const found = prefixes.find((prefix) =>
    name.toLocaleLowerCase("en").startsWith(prefix.toLocaleLowerCase("en")),
  );
  if (found) return found;
  if (group === "Honda / Acura") return "Honda / Acura";
  if (group === "Chevrolet / Dodge") return null;
  return null;
}

function candidatePriceClass(model: string) {
  const value = model.toLocaleLowerCase("en");
  if (
    /(jesko|valkyrie|nevera|evija|fxx|f1 lm|la voiture noire|huayra|zonda|veneno|revuelto|918|chiron|bolide|regera)/u.test(
      value,
    )
  ) {
    return "Hypercar / Rennwagen";
  }
  if (/(bus|truck|transporter|van|pick-up|pickup|f-150)/u.test(value)) {
    return "Nutzfahrzeug";
  }
  if (
    /(x5|x6|g-class|g63|urus|land cruiser|raptor|bronco|cayenne)/u.test(value)
  ) {
    return "SUV / Geländewagen";
  }
  if (/(golf|civic|swift|beetle|miata|mx-5|a4|a6|passat|a3)/u.test(value)) {
    return "Kleinwagen";
  }
  if (
    /(m3|m4|m5|m8|amg|rs[3576]|r8|gt-r|gtr|911|gt3|gt2|corvette|mustang|ferrari|lamborghini|mclaren|porsche|silvia|skyline|supra|evo|sti|rx-7)/u.test(
      value,
    )
  ) {
    return "Sportwagen";
  }
  return "Personenwagen";
}

function normalizeCandidate(input: {
  id: string;
  name: string;
  packId: string;
  packName: string;
  packVersion?: string | null;
  gameVersion?: string | null;
  loader?: string | null;
  priceDiamonds: number | null;
  status?: CandidateStatus;
  sourceUrl?: string | null;
  sourceNote: string;
  manufacturer?: string | null;
}): VehicleCandidate {
  const priceDiamonds =
    input.priceDiamonds ??
    suggestClassPriceDiamonds(candidatePriceClass(input.name));
  return {
    id: input.id,
    name: input.name,
    manufacturer: input.manufacturer ?? getManufacturer(input.name),
    packId: input.packId,
    packName: input.packName,
    packVersion: input.packVersion ?? null,
    gameVersion: input.gameVersion ?? null,
    loader: input.loader ?? null,
    vehicleClass: "Noch nicht bestätigt",
    priceDiamonds,
    priceBasis: input.priceDiamonds === null ? "class-model" : "master-list",
    status: input.status ?? "candidate",
    sourceUrl: input.sourceUrl ?? null,
    sourceNote: input.sourceNote,
    orderEligible: false,
    imageStatus: "rights-open",
  };
}

const groups: CandidateGroup[] = [
  {
    packId: "craftspeed",
    packName: "Craftspeed",
    status: "needs-review",
    entries: [
      ["BMW 320i Coupé (E36)", 12],
      ["BMW 325i Touring (E30)", 14],
      ["BMW M3 (E30)", 36],
      ["BMW M3 (E46)", 42],
      ["BMW M3 GTR (E46)", 95],
      ["BMW M4 (F82)", 48],
      ["BMW M5 (E39)", 45],
      ["BMW M6 Coupé (E63)", 48],
      ["BMW M6 Convertible (E64)", 52],
      ["BMW M8 (E31), Modellbezeichnung prüfen", 60],
      ["BMW Z8 (E52)", 55],
      ["Mercedes-AMG GT", 66],
      ["Porsche 911 Turbo (930)", 62],
      ["Lamborghini Huracán EVO", 85],
      ["Lamborghini Huracán EVO Spyder", 92],
      ["Lotus Elise SC", 33],
      ["Nissan Skyline GT-R (R34)", 62],
      ["Mitsubishi Lancer Evolution IX", 39],
      ["Ford Mustang Dark Horse (S650)", 55],
      ["Mazda 3 MPS", null],
      ["Mazda 3 Sedan", null],
      ["Honda Civic EU7", null],
      ["Chevrolet Camaro SS 396", null],
      ["Chevrolet Corvette C6", null],
      ["Nissan Silvia S12", null],
      ["Nissan Skyline 2000 GT-R C110", null],
      ["Volkswagen Corrado", null],
      ["Volkswagen Passat R36", null],
      ["Volkswagen Passat W8", null],
      ["Volkswagen Golf R32", null],
      ["Mazda RX-7 FD", null],
      ["Toyota Sprinter Trueno AE86", null],
      ["Mazda MX-5 NA", null],
      ["Volvo 240 Turbo", null],
      ["Ford Mustang GT SN95", null],
    ],
  },
  {
    packId: "svmp",
    packName: "Sphase Vehicle Mashup Pack",
    status: "approval-required",
    entries: [
      ["Aston Martin Valkyrie", 145],
      ["Ferrari F40", 110],
      ["Ferrari 360 Spider", 64],
      ["Ferrari 360 Challenge Stradale", 78],
      ["Lotus Elise SC", 33],
      ["TVR Sagaris", 52],
      ["Wiesmann GT MF5", 65],
      ["Volvo 480", null],
      ["Renault Mégane", null],
      ["Suzuki Swift 1988", null],
      ["Opel Campo", null],
    ],
  },
  {
    packId: "gt-craft",
    packName: "GT CRAFT",
    status: "blocked",
    entries: [
      ["Mazda RX-7 FC3S", null],
      ["Mazda RX-7 FD3S", 42],
      ["Nissan 180SX Type X", null],
      ["Nissan Skyline GT-R BNR32", 46],
      ["Nissan Skyline GT-R BCNR33", 48],
      ["Nissan Skyline GT-R BNR34", 62],
      ["Nissan Silvia K's S13", null],
      ["Nissan Silvia K's S14", null],
      ["Nissan Silvia Spec-R S15", null],
      ["Subaru Impreza WRX STI GC8 Version VI", null],
      ["Toyota Supra RZ A80", 54],
      ["Toyota Sprinter Trueno AE86", 25],
      ["Ferrari FXX K", 155],
      ["Ferrari FXX K Evo", 165],
      ["Koenigsegg Jesko", 192],
      ["Lamborghini Diablo GTR", 120],
      ["McLaren F1 LM", 160],
      ["Mercedes-Benz CLK GTR", 145],
      ["Saleen S7", 105],
      ["Saleen S7 LM", 125],
      ["Jaguar XJ220", 92],
      ["Jaguar XJ220S", 105],
      ["Lexus LFA", 85],
      ["Lexus LFA Nürburgring Package", 100],
      ["Nissan GT-R R35", 70],
      ["Nissan GT-R NISMO R35", 85],
      ["Mitsubishi Lancer Evolution VI GSR", 39],
      ["Porsche 911 Carrera RS 3.8 (964)", 58],
    ],
  },
  {
    packId: "rage",
    packName: "R.A.G.E",
    status: "blocked",
    entries: [
      ["Porsche 911 Carrera Targa 1974", 45],
      ["Porsche 911 Turbo Slantnose 930", 75],
      ["Bugatti La Voiture Noire", 192],
      ["Volkswagen Golf GTI Mk1", 14],
      ["Volvo S60 Polestar", 36],
    ],
  },
  {
    packId: "ocp",
    packName: "Official Content Pack",
    status: "needs-review",
    entries: [["Ford Mustang, genaue Variante offen", 25]],
  },
  {
    packId: "oamp",
    packName: "Official Automobile Pack",
    status: "needs-review",
    entries: [
      ["Camaro, genaue Variante offen", 27],
      ["Merc Wagon, Pack-Modell offen", 13],
      ["Cog", 12],
    ],
  },
];

const packPageById: Record<string, string> = {
  craftspeed:
    "https://www.curseforge.com/minecraft/mc-mods/immersive-vehicles-craftspeed",
  "gt-craft": "https://www.curseforge.com/minecraft/mc-mods/gt-craft-iv-mts",
  oamp: "https://www.curseforge.com/minecraft/mc-mods/mts-iv-official-automobile-pack",
  ocp: "https://modrinth.com/mod/immersive-vehicles-official-content-pack",
  rage: "https://www.curseforge.com/minecraft/mc-mods/immersive-vehicles-blocky-rage",
  svmp: "https://www.curseforge.com/minecraft/mc-mods/iv-mts-sphase-vehicle-mashup-pack-svmp",
};

const targetKeys = new Set(vehicles.map((vehicle) => modelKey(vehicle.name)));
const legacyRows = legacyRageRows as LegacyRageRow[];
const legacyKeys = new Set(legacyRows.map((row) => modelKey(row.name)));

const historicalCandidates = groups.flatMap((group) =>
  group.entries
    .filter(([name]) => {
      const key = modelKey(name);
      return !vehicles.some(
        (vehicle) =>
          vehicle.packId === group.packId && modelKey(vehicle.name) === key,
      );
    })
    .map(([name, priceDiamonds]) =>
      normalizeCandidate({
        id: `candidate-${group.packId}-${slugify(name)}`,
        name,
        packId: group.packId,
        packName: group.packName,
        packVersion: null,
        priceDiamonds,
        sourceUrl: packPageById[group.packId] ?? null,
        sourceNote:
          group.status === "approval-required"
            ? "Historischer Pack-Kandidat; öffentliche Nutzung braucht eine Freigabe des Autors."
            : group.status === "blocked"
              ? "Historischer Wunschlisteneintrag; Zielversion oder Verkaufsweg ist noch nicht bestätigt."
              : "Aus der früheren SKYFALL-Planliste; Modellvariante noch abzugleichen.",
      }),
    ),
);

const legacyIncompatible = legacyRows.map((row) =>
  normalizeCandidate({
    id: `rage-v23-${slugify(row.assetId)}`,
    name: row.name,
    packId: row.packId,
    packName: row.packName,
    packVersion: row.packVersion,
    gameVersion: "1.20.1",
    loader: "Forge",
    priceDiamonds: null,
    status: "incompatible",
    sourceUrl: row.sourceUrl,
    sourceNote: row.ineligibilityReason,
  }),
);

const explicitWishlist = (wishlistRows as WishlistRow[])
  .filter((row) => {
    const key = modelKey(row.name);
    return (
      !targetKeys.has(key) &&
      !legacyKeys.has(key) &&
      !historicalCandidates.some(
        (candidate) => modelKey(candidate.name) === key,
      )
    );
  })
  .map((row) =>
    normalizeCandidate({
      id: `wishlist-${slugify(row.name)}`,
      name: row.name,
      manufacturer: getManufacturer(row.name, row.group),
      packId: "unassigned",
      packName: "Packzuordnung offen",
      priceDiamonds: row.requestedPriceDiamonds,
      sourceNote:
        "Aus der SKYFALL-Wunschliste; Pack, exakte Variante und Kompatibilität sind noch nicht nachgewiesen.",
    }),
  );

const candidates = [
  ...legacyIncompatible,
  ...historicalCandidates,
  ...explicitWishlist,
];
const candidateIds = new Set<string>();

export const vehicleCandidates: VehicleCandidate[] = candidates.filter(
  (candidate) => {
    if (candidateIds.has(candidate.id)) return false;
    candidateIds.add(candidate.id);
    return true;
  },
);

export function findVehicleCandidate(id: string) {
  return vehicleCandidates.find((candidate) => candidate.id === id);
}

export const explicitWishlistCount = (wishlistRows as WishlistRow[]).length;
