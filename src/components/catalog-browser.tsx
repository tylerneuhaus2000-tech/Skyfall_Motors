"use client";

import { useMemo, useState } from "react";
import { type CatalogCardItem, VehicleCard } from "@/components/vehicle-card";
import {
  CompareButton,
  ComparePanel,
  type LocalVehicleSummary,
  RecentlyViewedList,
  WishlistButton,
} from "@/components/vehicle-local-tools";
import { getPremiumVehicle, premiumVehicles } from "@/lib/premium-catalog";

type SortOrder = "featured" | "price-asc" | "price-desc" | "brand" | "name";
type Assortment = "all" | "premium" | "inquiry";
type CatalogStatus =
  | "all"
  | "available"
  | "verified"
  | "candidate"
  | "incompatible";
type PublicInventory = {
  approved: boolean;
  availableUnits: number;
  reservedUnits: number;
  priceDiamonds?: number;
  serverInstallationConfirmed: boolean;
};

const pageSize = 24;

export function CatalogBrowser({
  catalogItems,
  inventory = {},
  initialVehicleClass = "all",
  signedIn = false,
  wishlistVehicleIds = [],
}: {
  catalogItems: CatalogCardItem[];
  inventory?: Record<string, PublicInventory>;
  initialVehicleClass?: string;
  signedIn?: boolean;
  wishlistVehicleIds?: string[];
}) {
  const [query, setQuery] = useState("");
  const [manufacturer, setManufacturer] = useState("all");
  const [pack, setPack] = useState("all");
  const [vehicleClass, setVehicleClass] = useState(initialVehicleClass);
  const [assortment, setAssortment] = useState<Assortment>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [status, setStatus] = useState<CatalogStatus>("all");
  const [sort, setSort] = useState<SortOrder>("featured");
  const [page, setPage] = useState(1);
  const items = useMemo<CatalogCardItem[]>(() => catalogItems, [catalogItems]);
  const localVehicleSummaries = useMemo<LocalVehicleSummary[]>(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.name,
        manufacturer: item.manufacturer ?? undefined,
        packName: item.packName,
        vehicleClass: item.vehicleClass,
        gameVersion: item.gameVersion ?? "Nicht bestätigt",
        modloader: item.loader ?? "Nicht bestätigt",
        priceDiamonds: getPremiumVehicle(item.id)?.priceDiamonds,
        availability:
          "verificationStatus" in item &&
          item.orderEligible &&
          inventory[item.id]?.serverInstallationConfirmed &&
          inventory[item.id]?.approved &&
          inventory[item.id].availableUnits > inventory[item.id].reservedUnits
            ? "Bestellbar"
            : "Nicht bestellbar",
        orderEligible: "verificationStatus" in item && item.orderEligible,
      })),
    [inventory, items],
  );
  const packOptions = useMemo(
    () =>
      Array.from(
        new Map(items.map((item) => [item.packId, item.packName])),
      ).sort((a, b) => a[1].localeCompare(b[1], "de")),
    [items],
  );
  const manufacturerOptions = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((item) => item.manufacturer)
            .filter((name): name is string => Boolean(name)),
        ),
      ).sort((a, b) => a.localeCompare(b, "de")),
    [items],
  );
  const classOptions = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.vehicleClass))).sort((a, b) =>
        a.localeCompare(b, "de"),
      ),
    [items],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("de-DE");
    const result = items.filter((item) => {
      const itemInventory = inventory[item.id];
      const isVerified = "verificationStatus" in item;
      const isAvailable = Boolean(
        isVerified &&
          item.orderEligible &&
          itemInventory?.serverInstallationConfirmed &&
          itemInventory.approved &&
          itemInventory.availableUnits > itemInventory.reservedUnits,
      );
      const itemStatus = isVerified ? "verified" : item.status;
      const publicPrice = getPremiumVehicle(item.id)?.priceDiamonds;
      const isPremium = publicPrice !== undefined;
      const searchable =
        `${item.name} ${item.packName} ${item.manufacturer ?? ""} ${item.vehicleClass}`.toLocaleLowerCase(
          "de-DE",
        );
      return (
        (!needle || searchable.includes(needle)) &&
        (manufacturer === "all" || item.manufacturer === manufacturer) &&
        (pack === "all" || item.packId === pack) &&
        (vehicleClass === "all" || item.vehicleClass === vehicleClass) &&
        (assortment === "all" ||
          (assortment === "premium" ? isPremium : !isPremium)) &&
        (!minPrice ||
          (publicPrice !== undefined && publicPrice >= Number(minPrice))) &&
        (!maxPrice ||
          (publicPrice !== undefined && publicPrice <= Number(maxPrice))) &&
        (status === "all" ||
          (status === "available" ? isAvailable : itemStatus === status))
      );
    });
    const priceOf = (item: CatalogCardItem) =>
      getPremiumVehicle(item.id)?.priceDiamonds;
    if (sort === "featured") {
      const rank = new Map<string, number>(
        premiumVehicles.map((item, index) => [item.vehicleId, index]),
      );
      result.sort(
        (a, b) =>
          (rank.get(a.id) ?? 9999) - (rank.get(b.id) ?? 9999) ||
          a.name.localeCompare(b.name, "de"),
      );
    }
    if (sort === "price-asc")
      result.sort(
        (a, b) => (priceOf(a) ?? Infinity) - (priceOf(b) ?? Infinity),
      );
    if (sort === "price-desc")
      result.sort(
        (a, b) => (priceOf(b) ?? -Infinity) - (priceOf(a) ?? -Infinity),
      );
    if (sort === "name")
      result.sort((a, b) => a.name.localeCompare(b.name, "de"));
    if (sort === "brand")
      result.sort(
        (a, b) =>
          (a.manufacturer ?? "").localeCompare(b.manufacturer ?? "", "de") ||
          a.name.localeCompare(b.name, "de"),
      );
    return result;
  }, [
    assortment,
    items,
    inventory,
    manufacturer,
    maxPrice,
    minPrice,
    pack,
    query,
    sort,
    status,
    vehicleClass,
  ]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  function resetFilters() {
    setQuery("");
    setManufacturer("all");
    setPack("all");
    setVehicleClass("all");
    setAssortment("all");
    setMinPrice("");
    setMaxPrice("");
    setStatus("all");
    setSort("featured");
    setPage(1);
  }

  function update<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  const activeFilters: Array<{
    id: string;
    label: string;
    clear: () => void;
  }> = [];
  if (query.trim()) {
    activeFilters.push({
      id: "query",
      label: `Suche: ${query.trim()}`,
      clear: () => update(setQuery, ""),
    });
  }
  if (manufacturer !== "all") {
    activeFilters.push({
      id: "manufacturer",
      label: manufacturer,
      clear: () => update(setManufacturer, "all"),
    });
  }
  if (pack !== "all") {
    const packName = packOptions.find(([id]) => id === pack)?.[1] ?? pack;
    activeFilters.push({
      id: "pack",
      label: packName,
      clear: () => update(setPack, "all"),
    });
  }
  if (vehicleClass !== "all") {
    activeFilters.push({
      id: "class",
      label: vehicleClass,
      clear: () => update(setVehicleClass, "all"),
    });
  }
  if (assortment !== "all") {
    activeFilters.push({
      id: "assortment",
      label:
        assortment === "premium" ? "Premium-Sortiment" : "Preis auf Anfrage",
      clear: () => update(setAssortment, "all"),
    });
  }
  if (minPrice || maxPrice) {
    activeFilters.push({
      id: "price",
      label: `Diamanten: ${minPrice || "0"}–${maxPrice || "∞"}`,
      clear: () => {
        setMinPrice("");
        setMaxPrice("");
        setPage(1);
      },
    });
  }
  if (status !== "all") {
    const labels: Record<CatalogStatus, string> = {
      all: "",
      available: "Bestellbar",
      verified: "Packdatei belegt",
      candidate: "Kandidaten",
      incompatible: "Inkompatibel",
    };
    activeFilters.push({
      id: "status",
      label: labels[status],
      clear: () => update(setStatus, "all"),
    });
  }

  return (
    <div className="catalog-layout">
      <aside className="filter-panel" aria-labelledby="filter-heading">
        <details className="filter-disclosure" open>
          <summary id="filter-heading" className="filter-summary">
            <span>Fahrzeuge finden</span>
            <span className="filter-summary-action">Suche & Filter</span>
          </summary>
          <div className="filter-controls">
            <div className="filter-field">
              <label htmlFor="vehicle-search">
                Modell, Hersteller oder Pack
              </label>
              <input
                id="vehicle-search"
                type="search"
                value={query}
                onChange={(event) => update(setQuery, event.target.value)}
                placeholder="Zum Beispiel: Scout"
                autoComplete="off"
              />
            </div>
            <div className="filter-field">
              <label htmlFor="vehicle-manufacturer">Hersteller</label>
              <select
                id="vehicle-manufacturer"
                value={manufacturer}
                onChange={(event) =>
                  update(setManufacturer, event.target.value)
                }
              >
                <option value="all">Alle Hersteller</option>
                {manufacturerOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label htmlFor="vehicle-pack">Content-Pack</label>
              <select
                id="vehicle-pack"
                value={pack}
                onChange={(event) => update(setPack, event.target.value)}
              >
                <option value="all">Alle Packs</option>
                {packOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label htmlFor="vehicle-class">Fahrzeugklasse</label>
              <select
                id="vehicle-class"
                value={vehicleClass}
                onChange={(event) =>
                  update(setVehicleClass, event.target.value)
                }
              >
                <option value="all">Alle Klassen</option>
                {classOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label htmlFor="vehicle-assortment">Sortiment</label>
              <select
                id="vehicle-assortment"
                value={assortment}
                onChange={(event) =>
                  update(setAssortment, event.target.value as Assortment)
                }
              >
                <option value="all">Alle Fahrzeuge</option>
                <option value="premium">Premium-Sortiment</option>
                <option value="inquiry">Preis auf Anfrage</option>
              </select>
            </div>
            <div className="filter-field">
              <label htmlFor="vehicle-status">Verfügbarkeit</label>
              <select
                id="vehicle-status"
                value={status}
                onChange={(event) =>
                  update(setStatus, event.target.value as CatalogStatus)
                }
              >
                <option value="all">Alle Status</option>
                <option value="available">Bestellbar</option>
                <option value="verified">Packdatei gefunden</option>
                <option value="candidate">Kandidaten</option>
                <option value="incompatible">Zielversion inkompatibel</option>
              </select>
            </div>
            <div className="filter-field">
              <label htmlFor="vehicle-min-price">Preis ab (💎)</label>
              <input
                id="vehicle-min-price"
                type="number"
                min="0"
                max="100000"
                value={minPrice}
                onChange={(event) => update(setMinPrice, event.target.value)}
              />
            </div>
            <div className="filter-field">
              <label htmlFor="vehicle-max-price">Preis bis (💎)</label>
              <input
                id="vehicle-max-price"
                type="number"
                min="0"
                max="100000"
                value={maxPrice}
                onChange={(event) => update(setMaxPrice, event.target.value)}
              />
            </div>
            <div className="filter-field">
              <label htmlFor="vehicle-sort">Sortierung</label>
              <select
                id="vehicle-sort"
                value={sort}
                onChange={(event) =>
                  update(setSort, event.target.value as SortOrder)
                }
              >
                <option value="featured">Empfohlen</option>
                <option value="price-asc">Preis aufsteigend</option>
                <option value="price-desc">Preis absteigend</option>
                <option value="brand">Marke A–Z</option>
                <option value="name">Modell A–Z</option>
              </select>
            </div>
            <button
              className="filter-reset"
              type="button"
              onClick={resetFilters}
            >
              Filter zurücksetzen
            </button>
          </div>
        </details>
      </aside>

      <div className="catalog-results" aria-live="polite">
        <ComparePanel vehicles={localVehicleSummaries} />
        <RecentlyViewedList vehicles={localVehicleSummaries} />
        <div className="catalog-toolbar">
          <p className="result-count">
            <strong>{filtered.length}</strong> Katalogeinträge · Seite {page}{" "}
            von {pageCount}
          </p>
          <span className="coming-label">
            Packnachweis ist keine Serverfreigabe
          </span>
        </div>
        {activeFilters.length > 0 && (
          <fieldset className="active-filters">
            <legend>Aktive Filter</legend>
            {activeFilters.map((filter) => (
              <button
                className="filter-chip"
                key={filter.id}
                type="button"
                onClick={filter.clear}
              >
                {filter.label}
                <span aria-hidden="true">×</span>
              </button>
            ))}
            <button
              className="filter-clear-link"
              type="button"
              onClick={resetFilters}
            >
              Alle entfernen
            </button>
          </fieldset>
        )}
        {visibleItems.length ? (
          <div className="catalog-grid">
            {visibleItems.map((item) => (
              <VehicleCard
                key={item.id}
                vehicle={item}
                available={Boolean(
                  getPremiumVehicle(item.id) &&
                    inventory[item.id]?.serverInstallationConfirmed &&
                    inventory[item.id]?.approved &&
                    inventory[item.id].availableUnits >
                      inventory[item.id].reservedUnits,
                )}
                extraAction={
                  <div className="vehicle-local-actions">
                    <CompareButton vehicleId={item.id} />
                    {"verificationStatus" in item && (
                      <WishlistButton
                        vehicleId={item.id}
                        signedIn={signedIn}
                        initialSaved={wishlistVehicleIds.includes(item.id)}
                      />
                    )}
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div>
              <h2>Kein passendes Fahrzeug gefunden</h2>
              <p>Ändere den Suchbegriff oder setze einige Filter zurück.</p>
              <button
                className="button-secondary"
                type="button"
                onClick={resetFilters}
              >
                Filter zurücksetzen
              </button>
            </div>
          </div>
        )}
        {pageCount > 1 && (
          <nav className="catalog-pagination" aria-label="Katalogseiten">
            <button
              className="button-secondary"
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Zurück
            </button>
            <span>
              Seite {page} / {pageCount}
            </span>
            <button
              className="button-secondary"
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
            >
              Weiter
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
