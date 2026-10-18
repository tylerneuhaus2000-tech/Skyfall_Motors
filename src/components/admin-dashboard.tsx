"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminActivityFeed } from "@/components/admin-activity-feed";
import { AdminAnnouncements } from "@/components/admin-announcements";
import { AdminInquiryPanel } from "@/components/admin-inquiry-panel";
import type { AdminActivityView } from "@/lib/admin-activity";
import {
  buildAdminSalesSeries,
  summarizeAdminOrders,
} from "@/lib/admin-analytics";
import type { AdminPermission, StaffRole } from "@/lib/admin-permissions";
import { buildAdminDailyTasks } from "@/lib/admin-tasks";
import type { AnnouncementView } from "@/lib/announcement-store";
import { formatDiamondPrice } from "@/lib/catalog";
import type { AdminInquiryView } from "@/lib/inquiry-store";
import { type OrderStatus, orderStatusLabels } from "@/lib/order-domain";
import type {
  InventoryView,
  OrderView,
  ShopSettingsView,
} from "@/lib/order-store";
import { getPremiumVehicle } from "@/lib/premium-catalog";
import { type ShopSettings, shopModeLabels } from "@/lib/shop-settings-domain";
import type { WorkshopTicketStatus } from "@/lib/side-feature-domain";
import type {
  LapEntryView,
  TestDriveRequestView,
  VehicleReviewView,
  VehicleWaitlistEntryView,
  WorkshopTicketView,
} from "@/lib/side-feature-store";

type AdminCustomer = {
  id: string;
  minecraftUsername: string;
  role: string;
  staffRole: StaffRole | null;
  minecraftVerified: boolean;
  accountStatus: string;
  createdAt: number;
};

type AdminInventory = InventoryView & {
  vehicleName: string;
  manufacturer: string;
  packName: string;
  priceBasis: string;
  vehicleClass: string;
};

type AdminDashboardProps = {
  accountId: string;
  accountName: string;
  todayKey: string;
  homepageHighlightVehicleId: string | null;
  shopSettings: ShopSettingsView;
  inquiries: AdminInquiryView[];
  announcements: AnnouncementView[];
  staffRole: StaffRole | null;
  permissions: AdminPermission[];
  orders: OrderView[];
  customers: AdminCustomer[];
  inventory: AdminInventory[];
  testDriveRequests: TestDriveRequestView[];
  lapEntries: LapEntryView[];
  reviews: VehicleReviewView[];
  waitlist: VehicleWaitlistEntryView[];
  workshopTickets: WorkshopTicketView[];
  auditActivities: AdminActivityView[];
};

export function AdminDashboard({
  accountId,
  accountName,
  todayKey,
  homepageHighlightVehicleId,
  shopSettings,
  inquiries,
  announcements,
  staffRole,
  permissions,
  orders,
  customers,
  inventory,
  testDriveRequests,
  lapEntries,
  reviews,
  waitlist,
  workshopTickets,
  auditActivities,
}: AdminDashboardProps) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [inventoryQuery, setInventoryQuery] = useState("");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState("all");
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [customerQuery, setCustomerQuery] = useState("");
  const [salesRange, setSalesRange] = useState<7 | 30 | 90>(7);
  const [highlightVehicleId, setHighlightVehicleId] = useState(
    homepageHighlightVehicleId ?? "",
  );
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [customerRoleChoices, setCustomerRoleChoices] = useState<
    Record<string, StaffRole | "customer" | "unassigned">
  >({});
  useEffect(() => {
    setHighlightVehicleId(homepageHighlightVehicleId ?? "");
  }, [homepageHighlightVehicleId]);
  const visibleInventory = inventory.filter(
    (item) =>
      `${item.vehicleName} ${item.manufacturer} ${item.packName} ${item.vehicleClass}`
        .toLocaleLowerCase("de-DE")
        .includes(inventoryQuery.trim().toLocaleLowerCase("de-DE")) &&
      (inventoryStatusFilter === "all" ||
        (inventoryStatusFilter === "orderable" && item.canOrder) ||
        (inventoryStatusFilter === "blocked" && !item.canOrder) ||
        (inventoryStatusFilter === "not-approved" && !item.approved)),
  );
  const verifiedByCustomerId = new Map(
    customers.map((customer) => [customer.id, customer.minecraftVerified]),
  );
  const can = (permission: AdminPermission) => permissions.includes(permission);
  const analytics = summarizeAdminOrders(orders);
  const salesSeries = buildAdminSalesSeries(orders, salesRange, new Date());
  const maximumDailyDiamonds = Math.max(
    1,
    ...salesSeries.map((row) => row.diamonds),
  );
  const allVisibleInventorySelected =
    visibleInventory.length > 0 &&
    visibleInventory.every((item) =>
      selectedVehicleIds.includes(item.vehicleId),
    );
  const visibleOrders = orders.filter((order) => {
    const query = orderQuery.trim().toLocaleLowerCase("de-DE");
    const matchesQuery =
      !query ||
      `${order.orderNumber} ${order.minecraftUsername} ${order.vehicleName}`
        .toLocaleLowerCase("de-DE")
        .includes(query);
    return (
      matchesQuery &&
      (orderStatusFilter === "all" || order.status === orderStatusFilter)
    );
  });
  const visibleCustomers = customers.filter((customer) => {
    const query = customerQuery.trim().toLocaleLowerCase("de-DE");
    return (
      !query ||
      `${customer.minecraftUsername} ${customer.role} ${customer.staffRole ?? ""}`
        .toLocaleLowerCase("de-DE")
        .includes(query)
    );
  });
  const staffCustomerIds = new Set(customers.map((customer) => customer.id));
  const staffActors = customers.map((customer) => ({
    id: customer.id,
    name: customer.minecraftUsername,
  }));
  const recentAdminActivities = auditActivities.filter((activity) =>
    staffCustomerIds.has(activity.actorId),
  );
  const dailyTasks = buildAdminDailyTasks({
    orders,
    testDriveRequests,
    lapEntries,
    reviews,
    waitlist,
    workshopTickets,
    inquiries,
  });
  const navItems: Array<{
    permission: AdminPermission;
    href: string;
    label: string;
  }> = [
    { permission: "overview", href: "#overview", label: "Übersicht" },
    { permission: "inventory", href: "#vehicles", label: "Fahrzeuge" },
    { permission: "orders", href: "#orders", label: "Bestellungen" },
    { permission: "customers", href: "#customers", label: "Kunden" },
    { permission: "inquiries", href: "#inquiries", label: "Anfragen" },
    { permission: "marketing", href: "#marketing", label: "Marketing" },
    { permission: "test_drives", href: "#test-drives", label: "Testfahrten" },
    { permission: "workshop", href: "#workshop", label: "Werkstatt" },
    { permission: "reviews", href: "#reviews", label: "Bewertungen" },
    { permission: "waitlist", href: "#waitlist", label: "Warteliste" },
    { permission: "races", href: "#races", label: "Race Center" },
    { permission: "team", href: "#team", label: "Mitarbeiter" },
    { permission: "settings", href: "#settings", label: "Shop-Betrieb" },
  ];

  async function mutate(
    key: string,
    endpoint: string,
    body: unknown,
    success: string,
    method: "POST" | "PUT" = "POST",
  ) {
    setBusy(key);
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok)
        throw new Error(result?.message ?? "Änderung fehlgeschlagen.");
      if (key === "inventory-bulk") setSelectedVehicleIds([]);
      setMessage(success);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Änderung fehlgeschlagen.",
      );
    } finally {
      setBusy("");
    }
  }

  function toggleVisibleInventorySelection() {
    if (allVisibleInventorySelected) {
      setSelectedVehicleIds((current) =>
        current.filter(
          (id) => !visibleInventory.some((item) => item.vehicleId === id),
        ),
      );
      return;
    }
    const next = new Set([
      ...selectedVehicleIds,
      ...visibleInventory.map((item) => item.vehicleId),
    ]);
    if (next.size > 50) {
      setMessage("Die Sammelaktion ist auf 50 Fahrzeuge begrenzt.");
      return;
    }
    setMessage("");
    setSelectedVehicleIds(Array.from(next));
  }

  function setInventorySelected(vehicleId: string, selected: boolean) {
    if (!selected) {
      setSelectedVehicleIds((current) =>
        current.filter((id) => id !== vehicleId),
      );
      return;
    }
    if (selectedVehicleIds.length >= 50) {
      setMessage("Die Sammelaktion ist auf 50 Fahrzeuge begrenzt.");
      return;
    }
    setMessage("");
    setSelectedVehicleIds((current) =>
      current.includes(vehicleId) ? current : [...current, vehicleId],
    );
  }

  return (
    <div className="command-layout">
      <aside className="command-sidebar" aria-label="Admin Navigation">
        <a
          className="command-brand"
          href="/admin"
          aria-label="SKYFALL Command Center"
        >
          <span>SKYFALL</span>
          <small>MOTORS · COMMAND</small>
        </a>
        <nav className="command-nav" aria-label="Verwaltungsbereiche">
          {navItems
            .filter((item) => can(item.permission))
            .map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
        </nav>
        <div className="command-account">
          <span>Angemeldet als</span>
          <strong>{accountName}</strong>
          <small>{staffRole ? staffRoleLabels[staffRole] : "Inhaber"}</small>
        </div>
      </aside>
      <div className="command-main">
        <header className="command-heading">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Geschützter Mitarbeiterbereich
            </span>
            <h1>Command Center</h1>
            <p>
              Bestand, Aufträge und Kundenservice — nur mit echten
              Vorgangsdaten.
            </p>
          </div>
          <span className="command-role-badge">
            {staffRole ? staffRoleLabels[staffRole] : "Owner"}
          </span>
        </header>
        <div className="admin-stack">
          <section
            id="overview"
            className="admin-overview"
            aria-labelledby="admin-overview-title"
          >
            <div className="admin-overview-title">
              <div>
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> Live aus Firestore
                </span>
                <h2 id="admin-overview-title">Betriebsübersicht</h2>
              </div>
              <span className="admin-count">
                {can("orders")
                  ? `${orders.length} Bestellungen geladen`
                  : can("workshop")
                    ? `${workshopTickets.length} Werkstatt-Tickets geladen`
                    : can("races")
                      ? `${lapEntries.length} Rundenzeiten geladen`
                      : "Betriebsdaten geladen"}
              </span>
            </div>
            <section
              className="admin-summary-grid"
              aria-label="Echte Kennzahlen"
            >
              {can("orders") && (
                <MetricCard
                  label="Offene Bestellungen"
                  value={analytics.openOrders}
                />
              )}
              {can("orders") && (
                <MetricCard
                  label="Offene Zahlungen"
                  value={analytics.unpaidOrders}
                />
              )}
              {can("orders") && (
                <MetricCard
                  label="Lieferaufträge"
                  value={analytics.openDeliveryOrders}
                />
              )}
              {can("orders") && (
                <MetricCard
                  label="Bestätigt bezahlt"
                  value={`${formatDiamondPrice(analytics.confirmedDiamonds)} 💎`}
                />
              )}
              {can("workshop") && (
                <MetricCard
                  label="Werkstatt offen"
                  value={
                    workshopTickets.filter(
                      (ticket) =>
                        !["completed", "declined"].includes(ticket.status),
                    ).length
                  }
                />
              )}
              {can("test_drives") && (
                <MetricCard
                  label="Testfahrten offen"
                  value={
                    testDriveRequests.filter(
                      (request) => request.status === "pending",
                    ).length
                  }
                />
              )}
            </section>
            <section
              className="command-export-row"
              aria-labelledby="csv-export-title"
            >
              <span id="csv-export-title">CSV-Exporte</span>
              {can("orders") && (
                <a
                  className="button-secondary"
                  href="/api/admin/export?type=orders"
                >
                  Bestellungen · CSV
                </a>
              )}
              {can("settings") && (
                <a
                  className="button-secondary"
                  href="/api/admin/export?type=revenue"
                >
                  Übergabeumsätze · CSV
                </a>
              )}
              {can("inventory") && (
                <a
                  className="button-secondary"
                  href="/api/admin/export?type=inventory"
                >
                  Fahrzeugbestand · CSV
                </a>
              )}
            </section>
            {message && (
              <p className="form-message form-message-status" role="status">
                {message}
              </p>
            )}
            <section
              className="command-panel command-tasks-panel"
              aria-labelledby="daily-tasks-title"
            >
              <div className="command-panel-heading">
                <div>
                  <span className="eyebrow">Aus aktuellen Vorgängen</span>
                  <h3 id="daily-tasks-title">Heute zu erledigen</h3>
                </div>
                <span className="admin-count">
                  {dailyTasks.length} Aufgaben
                </span>
              </div>
              {dailyTasks.length ? (
                <ul className="command-task-list">
                  {dailyTasks.map((task) => (
                    <li key={task.id}>
                      <a href={task.href}>
                        <span>{task.label}</span>
                        <b>{task.count}</b>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">
                  Keine offenen Bestellungen, Zahlungen oder Anfragen.
                </p>
              )}
            </section>
            {can("audit") && (
              <div className="command-analytics-grid">
                <section className="command-panel command-sales-panel">
                  <div className="command-panel-heading">
                    <div>
                      <span className="eyebrow">Abgeschlossene Übergaben</span>
                      <h3>Verkäufe nach Zeitraum</h3>
                    </div>
                    <label className="command-range-label">
                      <span>Zeitraum</span>
                      <select
                        value={salesRange}
                        onChange={(event) =>
                          setSalesRange(
                            Number(event.target.value) as 7 | 30 | 90,
                          )
                        }
                      >
                        <option value={7}>7 Tage</option>
                        <option value={30}>30 Tage</option>
                        <option value={90}>90 Tage</option>
                      </select>
                    </label>
                  </div>
                  {analytics.completedSales === 0 ? (
                    <p className="empty-state">
                      Noch keine bestätigten Fahrzeugübergaben im geladenen
                      Auftragsbestand.
                    </p>
                  ) : (
                    <>
                      <div
                        className="command-sales-chart"
                        role="img"
                        aria-label={`Diamanten aus bestätigten Fahrzeugübergaben in den letzten ${salesRange} Tagen`}
                      >
                        {salesSeries.map((row, index) => {
                          const showLabel =
                            salesRange === 7 ||
                            index % (salesRange === 30 ? 5 : 15) === 0;
                          const height = row.diamonds
                            ? Math.max(
                                5,
                                (row.diamonds / maximumDailyDiamonds) * 100,
                              )
                            : 0;
                          return (
                            <div
                              className="command-sales-column"
                              key={row.dateKey}
                              title={`${row.label}: ${row.orders} Übergaben · ${formatDiamondPrice(row.diamonds)} 💎`}
                            >
                              <span className="command-sales-value">
                                {row.diamonds
                                  ? formatDiamondPrice(row.diamonds)
                                  : ""}
                              </span>
                              <span
                                className="command-sales-bar"
                                style={{ height: `${height}%` }}
                              />
                              <span className="command-sales-label">
                                {showLabel ? row.label : ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="admin-help">
                        Gezählt werden nur bezahlte und als übergeben
                        protokollierte Bestellungen. Es gibt keine automatische
                        Diamantenerfassung.
                      </p>
                    </>
                  )}
                </section>
                <section className="command-panel">
                  <div className="command-panel-heading">
                    <div>
                      <span className="eyebrow">Tatsächliche Übergaben</span>
                      <h3>Beliebteste Fahrzeuge</h3>
                    </div>
                  </div>
                  {analytics.bestsellers.length ? (
                    <ol className="command-bestsellers">
                      {analytics.bestsellers.map((vehicle, index) => (
                        <li key={vehicle.vehicleId}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>{vehicle.name}</strong>
                          <b>{vehicle.count}×</b>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="empty-state">
                      Noch keine bezahlten und übergebenen Fahrzeuge.
                    </p>
                  )}
                </section>
                <AdminActivityFeed
                  initialActivities={recentAdminActivities}
                  staffActors={staffActors}
                />
              </div>
            )}
          </section>
          {can("orders") && (
            <section id="orders" className="account-card admin-section">
              <div className="account-card-heading">
                <div>
                  <span className="eyebrow">
                    <span className="eyebrow-dot" /> Auftragsverwaltung
                  </span>
                  <h2>Bestellungen</h2>
                </div>
                <span className="admin-count">
                  {visibleOrders.length} von {orders.length}
                </span>
              </div>
              <div className="command-filter-row">
                <label>
                  <span>Bestellungen suchen</span>
                  <input
                    type="search"
                    value={orderQuery}
                    onChange={(event) => setOrderQuery(event.target.value)}
                    placeholder="Auftrag, Kunde oder Fahrzeug"
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(event) =>
                      setOrderStatusFilter(event.target.value)
                    }
                  >
                    <option value="all">Alle Status</option>
                    <option value="reserved">Eingegangen</option>
                    <option value="in_production">In Fertigung</option>
                    <option value="ready_for_handover">
                      Zur Übergabe bereit
                    </option>
                    <option value="delivered">Übergeben</option>
                    <option value="cancelled">Storniert</option>
                  </select>
                </label>
              </div>
              {visibleOrders.length ? (
                <div className="admin-order-list">
                  {visibleOrders.map((order) => (
                    <AdminOrderCard
                      key={order.id}
                      order={order}
                      minecraftVerified={
                        verifiedByCustomerId.get(order.customerId) === true
                      }
                      busy={busy}
                      onAction={(body, success) =>
                        mutate(
                          `order:${order.id}`,
                          "/api/admin/orders",
                          body,
                          success,
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="empty-state">
                  Keine Bestellungen für diese Suche und Filter.
                </p>
              )}
            </section>
          )}

          {can("customers") && (
            <section id="customers" className="account-card admin-section">
              <div className="account-card-heading">
                <div>
                  <span className="eyebrow">
                    <span className="eyebrow-dot" /> Kundenkonten
                  </span>
                  <h2>Minecraft-Identität prüfen</h2>
                </div>
                <span className="admin-count">
                  {visibleCustomers.length} von {customers.length}
                </span>
              </div>
              <p className="admin-help">
                Vor der Bestätigung den Spielernamen persönlich im
                Minecraft-Server prüfen. Es findet keine automatische
                UUID-Prüfung statt.
              </p>
              <div className="command-filter-row">
                <label>
                  <span>Kunden suchen</span>
                  <input
                    type="search"
                    value={customerQuery}
                    onChange={(event) => setCustomerQuery(event.target.value)}
                    placeholder="Minecraft-Name oder Rolle"
                  />
                </label>
              </div>
              {visibleCustomers.length ? (
                <div className="customer-list">
                  {visibleCustomers.map((customer) => (
                    <div className="customer-row" key={customer.id}>
                      <div>
                        <strong>{customer.minecraftUsername}</strong>
                        <span>
                          {customer.role === "owner"
                            ? "Inhaber"
                            : customer.role === "staff"
                              ? customer.staffRole
                                ? staffRoleLabels[customer.staffRole]
                                : "Mitarbeiter · Rolle fehlt"
                              : "Kunde"}{" "}
                          · seit{" "}
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString(
                                "de-DE",
                              )
                            : "—"}
                        </span>
                        <span>
                          Kontostatus:{" "}
                          {customer.accountStatus === "active"
                            ? "Aktiv"
                            : "Gesperrt"}{" "}
                          · Bestellungen:{" "}
                          {
                            orders.filter(
                              (order) => order.customerId === customer.id,
                            ).length
                          }
                        </span>
                      </div>
                      <div className="command-customer-actions">
                        {customer.minecraftVerified ? (
                          <span className="status-pill status-paid">
                            Identität bestätigt
                          </span>
                        ) : (
                          <button
                            className="button-secondary"
                            type="button"
                            disabled={busy === `customer:${customer.id}`}
                            onClick={() =>
                              mutate(
                                `customer:${customer.id}`,
                                "/api/admin/customers/verify",
                                { userId: customer.id },
                                "Minecraft-Identität bestätigt.",
                              )
                            }
                          >
                            {busy === `customer:${customer.id}`
                              ? "Prüfe …"
                              : "Im Spiel geprüft"}
                          </button>
                        )}
                        <details className="admin-customer-history">
                          <summary>Bestellhistorie & Garage</summary>
                          {(() => {
                            const customerOrders = orders.filter(
                              (order) => order.customerId === customer.id,
                            );
                            const garageOrders = customerOrders.filter(
                              (order) =>
                                order.status === "delivered" &&
                                order.handedOverAt,
                            );
                            return (
                              <>
                                <h3>Garage · bestätigte Übergaben</h3>
                                {garageOrders.length ? (
                                  <ul>
                                    {garageOrders.map((order) => (
                                      <li key={`garage:${order.id}`}>
                                        <span>
                                          <strong>{order.vehicleName}</strong>
                                          <small>
                                            Übergeben am{" "}
                                            {order.handedOverAt
                                              ? new Date(
                                                  order.handedOverAt,
                                                ).toLocaleDateString("de-DE")
                                              : "—"}
                                          </small>
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="admin-help">
                                    Keine bestätigten Fahrzeugübergaben.
                                  </p>
                                )}
                                <h3>Bestellhistorie</h3>
                                {customerOrders.length ? (
                                  <ul>
                                    {customerOrders.map((order) => (
                                      <li key={order.id}>
                                        <span>
                                          <strong>{order.vehicleName}</strong>
                                          <small>
                                            {order.orderNumber} ·{" "}
                                            {orderStatusLabels[order.status]} ·{" "}
                                            {order.paymentStatus === "paid"
                                              ? "Zahlung bestätigt"
                                              : "Zahlung offen"}
                                          </small>
                                        </span>
                                        <b>
                                          {formatDiamondPrice(order.totalPrice)}{" "}
                                          💎
                                        </b>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="admin-help">
                                    Keine Bestellungen gespeichert.
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">
                  Keine Kundenkonten für diese Suche.
                </p>
              )}
            </section>
          )}

          {can("inventory") && (
            <section id="vehicles" className="account-card admin-section">
              <div className="account-card-heading">
                <div>
                  <span className="eyebrow">
                    <span className="eyebrow-dot" /> Verkauf und Bestand
                  </span>
                  <h2>Fahrzeuge freigeben</h2>
                </div>
              </div>
              <p className="admin-help">
                Bestätige die Installation auf dem Zielserver. Packdaten und
                Hersteller stammen aus den geprüften Katalogquellen. Preise und
                Bestand werden serverseitig gepflegt.
              </p>
              <div className="command-filter-row inventory-admin-filters">
                <label>
                  <span>Katalog durchsuchen</span>
                  <input
                    id="inventory-search"
                    type="search"
                    value={inventoryQuery}
                    onChange={(event) => setInventoryQuery(event.target.value)}
                    placeholder="Modell, Pack, Klasse oder Hersteller"
                  />
                </label>
                <label>
                  <span>Verkaufsstatus</span>
                  <select
                    id="inventory-status-filter"
                    value={inventoryStatusFilter}
                    onChange={(event) =>
                      setInventoryStatusFilter(event.target.value)
                    }
                  >
                    <option value="all">Alle Fahrzeuge</option>
                    <option value="orderable">Jetzt bestellbar</option>
                    <option value="not-approved">Nicht freigegeben</option>
                    <option value="blocked">Gesperrt oder ungeprüft</option>
                  </select>
                </label>
              </div>
              <div className="command-bulk-toolbar">
                <button
                  className="filter-clear-link"
                  type="button"
                  onClick={toggleVisibleInventorySelection}
                >
                  {allVisibleInventorySelected
                    ? "Sichtbare Auswahl aufheben"
                    : "Sichtbare auswählen"}
                </button>
                <span>{selectedVehicleIds.length}/50 ausgewählt</span>
                <button
                  className="button-quiet-danger"
                  type="button"
                  disabled={
                    !selectedVehicleIds.length || busy === "inventory-bulk"
                  }
                  onClick={() => {
                    if (
                      !window.confirm(
                        `Bestellfreigabe für ${selectedVehicleIds.length} markierte Fahrzeuge pausieren? Bestand und laufende Bestellungen bleiben erhalten.`,
                      )
                    )
                      return;
                    void mutate(
                      "inventory-bulk",
                      "/api/admin/inventory",
                      { action: "pause_sales", vehicleIds: selectedVehicleIds },
                      "Bestellfreigaben für die Auswahl pausiert.",
                      "PUT",
                    );
                  }}
                >
                  {busy === "inventory-bulk"
                    ? "Pausiert …"
                    : "Verkauf für Auswahl pausieren"}
                </button>
              </div>
              <div className="inventory-list">
                <p className="admin-help">
                  {visibleInventory.length} von {inventory.length} Fahrzeugen
                </p>
                {visibleInventory.map((item) => (
                  <InventoryEditor
                    key={item.vehicleId}
                    item={item}
                    canEditPrices={staffRole === null}
                    selected={selectedVehicleIds.includes(item.vehicleId)}
                    onSelectionChange={(selected) =>
                      setInventorySelected(item.vehicleId, selected)
                    }
                    busy={busy === `inventory:${item.vehicleId}`}
                    onSave={(body) =>
                      mutate(
                        `inventory:${item.vehicleId}`,
                        "/api/admin/inventory",
                        body,
                        `${item.vehicleName}: Freigabe und Bestand gespeichert.`,
                      )
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {can("inquiries") && <AdminInquiryPanel inquiries={inquiries} />}

          {can("marketing") && (
            <section id="marketing" className="account-card admin-section">
              <div className="account-card-heading">
                <div>
                  <span className="eyebrow">
                    <span className="eyebrow-dot" /> Marketing
                  </span>
                  <h2>Fahrzeug des Tages</h2>
                </div>
                <span className="admin-count">
                  {new Date(`${todayKey}T00:00:00.000Z`).toLocaleDateString(
                    "de-DE",
                    { timeZone: "UTC" },
                  )}
                </span>
              </div>
              <p className="admin-help">
                Wähle ein für Bestellungen freigegebenes Katalogmodell für
                heute. Ohne Auswahl rotiert das Highlight automatisch. Eine
                Serverfreigabe oder Lagerverfügbarkeit wird dadurch nicht
                verändert.
              </p>
              <div className="command-marketing-editor">
                <label>
                  <span>Modell für die Startseite</span>
                  <select
                    value={highlightVehicleId}
                    onChange={(event) =>
                      setHighlightVehicleId(event.target.value)
                    }
                  >
                    <option value="">Automatische Tagesrotation</option>
                    {inventory
                      .filter((item) => item.orderEligible)
                      .map((item) => (
                        <option value={item.vehicleId} key={item.vehicleId}>
                          {item.vehicleName} · {item.packName}
                          {item.canOrder
                            ? " · bestellbar"
                            : " · nicht bestellbar"}
                        </option>
                      ))}
                  </select>
                </label>
                <button
                  className="button-primary"
                  type="button"
                  disabled={
                    !highlightVehicleId || busy === "homepage-highlight"
                  }
                  onClick={() =>
                    void mutate(
                      "homepage-highlight",
                      "/api/admin/marketing/highlight",
                      { vehicleId: highlightVehicleId, dateKey: todayKey },
                      "Startseiten-Highlight für heute gespeichert.",
                    )
                  }
                >
                  {busy === "homepage-highlight"
                    ? "Speichert …"
                    : "Für heute hervorheben"}
                </button>
                {homepageHighlightVehicleId && (
                  <button
                    className="button-secondary"
                    type="button"
                    disabled={busy === "homepage-highlight"}
                    onClick={() =>
                      void mutate(
                        "homepage-highlight",
                        "/api/admin/marketing/highlight",
                        { vehicleId: "", dateKey: todayKey },
                        "Tagesrotation wieder aktiviert.",
                      )
                    }
                  >
                    Automatische Rotation nutzen
                  </button>
                )}
              </div>
              {highlightVehicleId && !homepageHighlightVehicleId && (
                <p className="admin-help">Auswahl noch nicht gespeichert.</p>
              )}
              <AdminAnnouncements initialAnnouncements={announcements} />
            </section>
          )}

          {can("settings") && (
            <ShopSettingsSection
              initial={shopSettings}
              busy={busy === "shop-settings"}
              onSave={(settings) =>
                mutate(
                  "shop-settings",
                  "/api/admin/settings",
                  settings,
                  "Shop-Betrieb und Gebühren gespeichert.",
                )
              }
            />
          )}

          <CommunityModeration
            permissions={permissions}
            testDriveRequests={testDriveRequests}
            lapEntries={lapEntries}
            reviews={reviews}
            waitlist={waitlist}
            workshopTickets={workshopTickets}
            busy={busy}
            onAction={(key, body, success) =>
              mutate(key, "/api/admin/community", body, success)
            }
          />
          {can("team") && (
            <TeamManagementSection
              customers={customers}
              accountId={accountId}
              busy={busy}
              choices={customerRoleChoices}
              onChoiceChange={(userId, role) =>
                setCustomerRoleChoices((current) => ({
                  ...current,
                  [userId]: role,
                }))
              }
              onSave={(customer, staffRole) =>
                mutate(
                  `team:${customer.id}`,
                  "/api/admin/team",
                  { userId: customer.id, staffRole },
                  `${customer.minecraftUsername}: Rolle aktualisiert.`,
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TeamManagementSection({
  customers,
  accountId,
  busy,
  choices,
  onChoiceChange,
  onSave,
}: {
  customers: AdminCustomer[];
  accountId: string;
  busy: string;
  choices: Record<string, StaffRole | "customer" | "unassigned">;
  onChoiceChange: (
    userId: string,
    role: StaffRole | "customer" | "unassigned",
  ) => void;
  onSave: (customer: AdminCustomer, role: StaffRole | null) => void;
}) {
  const candidates = customers.filter((customer) => customer.role !== "owner");
  return (
    <section
      id="team"
      className="account-card admin-section command-team-section"
    >
      <div className="account-card-heading">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Owner-Zugriff
          </span>
          <h2>Mitarbeiterrollen</h2>
        </div>
        <span className="admin-count">
          {customers.filter((customer) => customer.role === "staff").length}{" "}
          freigegeben
        </span>
      </div>
      <p className="admin-help">
        Nur der Inhaber kann verifizierten Kunden eine Mitarbeiterrolle geben.
        Owner-Rollen sind unveränderbar und die eigene Rolle kann nicht geändert
        werden.
      </p>
      {candidates.length ? (
        <div className="customer-list">
          {candidates.map((customer) => {
            const currentRole =
              customer.role === "staff"
                ? (customer.staffRole ?? "unassigned")
                : "customer";
            const choice = choices[customer.id] ?? currentRole;
            const isCurrentAccount = customer.id === accountId;
            return (
              <div className="customer-row" key={`team:${customer.id}`}>
                <div>
                  <strong>{customer.minecraftUsername}</strong>
                  <span>
                    {customer.minecraftVerified
                      ? "Minecraft-Identität bestätigt"
                      : "Identität noch nicht bestätigt"}
                  </span>
                </div>
                <div className="command-team-actions">
                  <label>
                    <span>Mitarbeiterrolle</span>
                    <select
                      value={choice}
                      disabled={!customer.minecraftVerified || isCurrentAccount}
                      onChange={(event) =>
                        onChoiceChange(
                          customer.id,
                          event.target.value as
                            | StaffRole
                            | "customer"
                            | "unassigned",
                        )
                      }
                    >
                      <option value="customer">Kein Mitarbeiterzugriff</option>
                      {currentRole === "unassigned" && (
                        <option value="unassigned" disabled>
                          Keine gültige Rolle zugewiesen
                        </option>
                      )}
                      <option value="salesperson">Salesperson</option>
                      <option value="mechanic">Mechanic</option>
                      <option value="race_director">Race Director</option>
                    </select>
                  </label>
                  <button
                    className="button-secondary"
                    type="button"
                    disabled={
                      busy === `team:${customer.id}` ||
                      !customer.minecraftVerified ||
                      isCurrentAccount ||
                      choice === currentRole
                    }
                    onClick={() =>
                      onSave(
                        customer,
                        choice === "customer" || choice === "unassigned"
                          ? null
                          : choice,
                      )
                    }
                  >
                    {busy === `team:${customer.id}`
                      ? "Speichert …"
                      : "Rolle speichern"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="empty-state">Es gibt noch keine weiteren Kundenkonten.</p>
      )}
    </section>
  );
}

function ShopSettingsSection({
  initial,
  busy,
  onSave,
}: {
  initial: ShopSettingsView;
  busy: boolean;
  onSave: (settings: ShopSettings) => void;
}) {
  const [mode, setMode] = useState(initial.mode);
  const [deliveryFee, setDeliveryFee] = useState(initial.deliveryFee);
  const [expressFee, setExpressFee] = useState(initial.expressFee);

  useEffect(() => {
    setMode(initial.mode);
    setDeliveryFee(initial.deliveryFee);
    setExpressFee(initial.expressFee);
  }, [initial]);

  const modeHelp = {
    open: "Neue Bestellungen folgen den normalen Freigabe- und Bestandsregeln.",
    restricted:
      "Nur verifizierte Minecraft-Konten dürfen bestellen; nur Abholung ohne Express ist verfügbar.",
    closed:
      "Stoppt nur neue Bestellungen. Gespeicherte Bestellungen bleiben verwaltbar.",
    maintenance:
      "Zeigt Wartung an und stoppt nur neue Bestellungen. Gespeicherte Bestellungen bleiben verwaltbar.",
  }[mode];

  return (
    <section id="settings" className="account-card admin-section">
      <div className="account-card-heading">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Nur Owner
          </span>
          <h2>Shop-Betrieb und Preise</h2>
        </div>
        <span className="status-pill">{shopModeLabels[mode]}</span>
      </div>
      <p className="admin-help">
        Diese Einstellungen werden beim Erstellen jeder Bestellung auf dem
        Server geprüft. Bereits gespeicherte Aufträge bleiben bearbeitbar.
      </p>
      <form
        className="command-settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ mode, deliveryFee, expressFee });
        }}
      >
        <label>
          <span>Betriebsmodus</span>
          <select
            value={mode}
            disabled={busy}
            onChange={(event) =>
              setMode(event.target.value as ShopSettings["mode"])
            }
          >
            <option value="open">Geöffnet</option>
            <option value="restricted">Eingeschränkt</option>
            <option value="closed">Geschlossen</option>
            <option value="maintenance">Wartung</option>
          </select>
          <small>{modeHelp}</small>
        </label>
        <label>
          <span>Liefergebühr · 💎</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100_000}
            step={1}
            value={deliveryFee}
            disabled={busy}
            onChange={(event) => setDeliveryFee(event.target.valueAsNumber)}
          />
        </label>
        <label>
          <span>Expressgebühr · 💎</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100_000}
            step={1}
            value={expressFee}
            disabled={busy}
            onChange={(event) => setExpressFee(event.target.valueAsNumber)}
          />
        </label>
        <button className="button-primary" type="submit" disabled={busy}>
          {busy ? "Speichert …" : "Einstellungen speichern"}
        </button>
      </form>
    </section>
  );
}

const staffRoleLabels: Record<StaffRole, string> = {
  salesperson: "Salesperson",
  mechanic: "Mechanic",
  race_director: "Race Director",
};

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="command-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CommunityModeration({
  permissions,
  testDriveRequests,
  lapEntries,
  reviews,
  waitlist,
  workshopTickets,
  busy,
  onAction,
}: {
  permissions: AdminPermission[];
  testDriveRequests: TestDriveRequestView[];
  lapEntries: LapEntryView[];
  reviews: VehicleReviewView[];
  waitlist: VehicleWaitlistEntryView[];
  workshopTickets: WorkshopTicketView[];
  busy: string;
  onAction: (key: string, body: unknown, success: string) => void;
}) {
  const can = (permission: AdminPermission) => permissions.includes(permission);
  return (
    <>
      {can("test_drives") && (
        <section id="test-drives" className="account-card admin-section">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Manuelle Freigabe
              </span>
              <h2>Testfahrt-Anfragen</h2>
            </div>
            <span className="admin-count">
              {testDriveRequests.length} Einträge
            </span>
          </div>
          {testDriveRequests.length ? (
            <div className="admin-order-list">
              {testDriveRequests.map((request) => (
                <article className="admin-order-card" key={request.id}>
                  <div className="admin-order-heading">
                    <div>
                      <h3>{request.vehicleName}</h3>
                      <p>
                        {request.minecraftUsername}
                        {request.preferredWindow
                          ? ` · Wunschzeit: ${request.preferredWindow}`
                          : ""}
                      </p>
                    </div>
                    <span className="status-pill">
                      {testDriveLabels[request.status]}
                    </span>
                  </div>
                  <div className="admin-order-actions">
                    {request.status === "pending" && (
                      <>
                        <button
                          className="button-secondary"
                          type="button"
                          disabled={busy === `drive:${request.id}`}
                          onClick={() =>
                            onAction(
                              `drive:${request.id}`,
                              {
                                type: "test_drive",
                                data: {
                                  requestId: request.id,
                                  action: "approve",
                                },
                              },
                              "Testfahrt-Anfrage freigegeben.",
                            )
                          }
                        >
                          Manuell freigeben
                        </button>
                        <button
                          className="button-quiet-danger"
                          type="button"
                          disabled={busy === `drive:${request.id}`}
                          onClick={() =>
                            onAction(
                              `drive:${request.id}`,
                              {
                                type: "test_drive",
                                data: {
                                  requestId: request.id,
                                  action: "decline",
                                },
                              },
                              "Testfahrt-Anfrage abgelehnt.",
                            )
                          }
                        >
                          Ablehnen
                        </button>
                      </>
                    )}
                    {request.status === "approved" && (
                      <button
                        className="button-secondary"
                        type="button"
                        disabled={busy === `drive:${request.id}`}
                        onClick={() =>
                          onAction(
                            `drive:${request.id}`,
                            {
                              type: "test_drive",
                              data: {
                                requestId: request.id,
                                action: "complete",
                              },
                            },
                            "Testfahrt als durchgeführt markiert.",
                          )
                        }
                      >
                        Durchgeführt
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">Noch keine Testfahrt-Anfragen.</p>
          )}
        </section>
      )}

      {can("races") && (
        <section id="races" className="account-card admin-section">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Manuelle Zeitprüfung
              </span>
              <h2>Rundenzeiten</h2>
            </div>
            <span className="admin-count">
              {lapEntries.filter((entry) => entry.status === "pending").length}{" "}
              offen
            </span>
          </div>
          <p className="admin-help">
            Zeiten wurden von Kunden manuell eingetragen. Es gibt keine
            automatische Minecraft-Zeitmessung.
          </p>
          {lapEntries.filter((entry) => entry.status === "pending").length ? (
            <div className="admin-order-list">
              {lapEntries
                .filter((entry) => entry.status === "pending")
                .map((entry) => (
                  <article className="admin-order-card" key={entry.id}>
                    <div className="admin-order-heading">
                      <div>
                        <h3>{entry.trackName}</h3>
                        <p>
                          {entry.minecraftUsername} · {entry.vehicleName} ·{" "}
                          {(entry.timeMs / 1000).toFixed(3)} s
                        </p>
                      </div>
                      <span className="status-pill">In Prüfung</span>
                    </div>
                    <div className="admin-order-actions">
                      <button
                        className="button-secondary"
                        type="button"
                        disabled={busy === `lap:${entry.id}`}
                        onClick={() =>
                          onAction(
                            `lap:${entry.id}`,
                            {
                              type: "lap",
                              data: { entryId: entry.id, action: "approve" },
                            },
                            "Rundenzeit veröffentlicht.",
                          )
                        }
                      >
                        Zeit freigeben
                      </button>
                      <button
                        className="button-quiet-danger"
                        type="button"
                        disabled={busy === `lap:${entry.id}`}
                        onClick={() =>
                          onAction(
                            `lap:${entry.id}`,
                            {
                              type: "lap",
                              data: { entryId: entry.id, action: "reject" },
                            },
                            "Rundenzeit abgelehnt.",
                          )
                        }
                      >
                        Ablehnen
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          ) : (
            <p className="empty-state">
              Keine Rundenzeiten warten auf Prüfung.
            </p>
          )}
        </section>
      )}

      {can("reviews") && (
        <section id="reviews" className="account-card admin-section">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Moderation
              </span>
              <h2>Kundenbewertungen</h2>
            </div>
            <span className="admin-count">
              {reviews.filter((review) => review.status === "pending").length}{" "}
              offen
            </span>
          </div>
          {reviews.filter((review) => review.status === "pending").length ? (
            <div className="admin-order-list">
              {reviews
                .filter((review) => review.status === "pending")
                .map((review) => (
                  <article className="admin-order-card" key={review.id}>
                    <div className="admin-order-heading">
                      <div>
                        <h3>
                          {review.vehicleName} · {review.rating}/5
                        </h3>
                        <p>
                          {review.minecraftUsername} · {review.comment}
                        </p>
                      </div>
                      <span className="status-pill">In Prüfung</span>
                    </div>
                    <div className="admin-order-actions">
                      <button
                        className="button-secondary"
                        type="button"
                        disabled={busy === `review:${review.id}`}
                        onClick={() =>
                          onAction(
                            `review:${review.id}`,
                            {
                              type: "review",
                              data: { reviewId: review.id, action: "approve" },
                            },
                            "Bewertung veröffentlicht.",
                          )
                        }
                      >
                        Veröffentlichen
                      </button>
                      <button
                        className="button-quiet-danger"
                        type="button"
                        disabled={busy === `review:${review.id}`}
                        onClick={() =>
                          onAction(
                            `review:${review.id}`,
                            {
                              type: "review",
                              data: { reviewId: review.id, action: "reject" },
                            },
                            "Bewertung abgelehnt.",
                          )
                        }
                      >
                        Ablehnen
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          ) : (
            <p className="empty-state">Keine Bewertungen warten auf Prüfung.</p>
          )}
        </section>
      )}

      {can("waitlist") && (
        <section id="waitlist" className="account-card admin-section">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Kundenservice
              </span>
              <h2>Fahrzeug-Warteliste</h2>
            </div>
            <span className="admin-count">
              {waitlist.filter((entry) => entry.status === "waiting").length}{" "}
              offen
            </span>
          </div>
          <p className="admin-help">
            Nach einer Kontaktaufnahme außerhalb der Website kannst du den
            Eintrag dokumentieren. Es wird keine Nachricht automatisch
            versendet.
          </p>
          {waitlist.length ? (
            <div className="admin-order-list">
              {waitlist.map((entry) => (
                <article className="admin-order-card" key={entry.id}>
                  <div className="admin-order-heading">
                    <div>
                      <h3>{entry.vehicleName}</h3>
                      <p>{entry.minecraftUsername}</p>
                    </div>
                    <span className="status-pill">
                      {entry.status === "contacted" ? "Kontaktiert" : "Wartet"}
                    </span>
                  </div>
                  {entry.status === "waiting" && (
                    <div className="admin-order-actions">
                      <button
                        className="button-secondary"
                        type="button"
                        disabled={busy === `waitlist:${entry.id}`}
                        onClick={() =>
                          onAction(
                            `waitlist:${entry.id}`,
                            {
                              type: "waitlist",
                              data: {
                                waitlistId: entry.id,
                                action: "mark_contacted",
                              },
                            },
                            "Wartelisteneintrag als kontaktiert markiert.",
                          )
                        }
                      >
                        Als kontaktiert markieren
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">Noch keine Wartelisten-Einträge.</p>
          )}
        </section>
      )}

      {can("workshop") && (
        <section id="workshop" className="account-card admin-section">
          <div className="account-card-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Serviceverwaltung
              </span>
              <h2>Werkstatt-Tickets</h2>
            </div>
            <span className="admin-count">
              {
                workshopTickets.filter(
                  (ticket) => ticket.status === "requested",
                ).length
              }{" "}
              offen
            </span>
          </div>
          {workshopTickets.length ? (
            <div className="admin-order-list">
              {workshopTickets.map((ticket) => (
                <article className="admin-order-card" key={ticket.id}>
                  <div className="admin-order-heading">
                    <div>
                      <h3>
                        {(ticket.requestType === "repair"
                          ? "Reparatur"
                          : "Tuning") +
                          " · " +
                          ticket.vehicleName}
                      </h3>
                      <p>
                        {ticket.minecraftUsername} · {ticket.orderNumber}
                      </p>
                      <p>{ticket.description}</p>
                    </div>
                    <span className="status-pill">
                      {workshopTicketLabels[ticket.status]}
                    </span>
                  </div>
                  <div className="admin-order-actions">
                    {workshopTicketActions[ticket.status].map((action) => (
                      <button
                        className={
                          action.status === "declined"
                            ? "button-quiet-danger"
                            : "button-secondary"
                        }
                        type="button"
                        key={action.status}
                        disabled={busy === `workshop:${ticket.id}`}
                        onClick={() =>
                          onAction(
                            `workshop:${ticket.id}`,
                            {
                              type: "workshop_ticket",
                              data: {
                                ticketId: ticket.id,
                                status: action.status,
                              },
                            },
                            "Werkstatt-Ticket: " +
                              workshopTicketLabels[action.status] +
                              ".",
                          )
                        }
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">Noch keine Werkstatt-Tickets.</p>
          )}
        </section>
      )}
    </>
  );
}

const testDriveLabels: Record<TestDriveRequestView["status"], string> = {
  pending: "Wartet auf Freigabe",
  approved: "Manuell freigegeben",
  declined: "Abgelehnt",
  completed: "Durchgeführt",
};

const workshopTicketLabels: Record<WorkshopTicketView["status"], string> = {
  requested: "Eingegangen",
  in_review: "Wird geprüft",
  waiting_for_parts: "Wartet auf Teile",
  ready: "Arbeit abgeschlossen",
  completed: "Abgeschlossen",
  declined: "Abgelehnt",
};

const workshopTicketActions: Record<
  WorkshopTicketStatus,
  Array<{ status: WorkshopTicketStatus; label: string }>
> = {
  requested: [
    { status: "in_review", label: "Prüfung beginnen" },
    { status: "declined", label: "Ablehnen" },
  ],
  in_review: [
    { status: "waiting_for_parts", label: "Wartet auf Teile" },
    { status: "ready", label: "Arbeit abgeschlossen" },
    { status: "declined", label: "Ablehnen" },
  ],
  waiting_for_parts: [
    { status: "ready", label: "Arbeit abgeschlossen" },
    { status: "declined", label: "Ablehnen" },
  ],
  ready: [{ status: "completed", label: "Ticket schließen" }],
  completed: [],
  declined: [],
};

function AdminOrderCard({
  order,
  minecraftVerified,
  busy,
  onAction,
}: {
  order: OrderView;
  minecraftVerified: boolean;
  busy: string;
  onAction: (body: unknown, success: string) => void;
}) {
  const currentBusy = Boolean(busy);
  const requestStatus = (status: OrderStatus) =>
    onAction(
      { action: "set_status", orderId: order.id, status },
      `${order.orderNumber}: ${orderStatusLabels[status]}.`,
    );

  return (
    <article className="admin-order-card">
      <div className="admin-order-heading">
        <div>
          <span className="order-number">{order.orderNumber}</span>
          <h3>{order.vehicleName}</h3>
          <p>
            {order.packName} · {order.minecraftUsername}
          </p>
        </div>
        <strong className="order-total">
          {formatDiamondPrice(order.totalPrice)} 💎
        </strong>
      </div>
      <div className="admin-order-facts">
        <span className="status-pill">{orderStatusLabels[order.status]}</span>
        <span
          className={
            order.paymentStatus === "paid"
              ? "status-pill status-paid"
              : "status-pill status-unpaid"
          }
        >
          {order.paymentStatus === "paid"
            ? "Zahlung bestätigt"
            : "Zahlung offen"}
        </span>
        <span>Fahrzeug {formatDiamondPrice(order.unitPrice)} 💎</span>
        <span>
          {order.paymentMethod === "terminal"
            ? "Vorauszahlung am Terminal"
            : "Zahlung bei Übergabe"}
        </span>
        <span>
          {order.handover === "pickup"
            ? "Abholung kostenlos"
            : `Lieferung +${formatDiamondPrice(order.deliveryPrice)} 💎`}
        </span>
        <span>
          {order.express
            ? `Express +${formatDiamondPrice(order.expressPrice)} 💎`
            : "Standard"}
        </span>
      </div>
      {!minecraftVerified && order.status !== "cancelled" && (
        <p className="notice notice-pending">
          <strong>Minecraft-Name noch nicht bestätigt.</strong>
          <span>
            Bestellung{" "}
            {order.status === "reserved"
              ? "kann erst nach Identitätsprüfung in Fertigung gehen"
              : "wurde vor der Prüfung angelegt"}
            . Prüfe das Kundenkonto im Abschnitt darunter.
          </span>
        </p>
      )}
      <div className="admin-order-actions">
        {order.paymentStatus === "unpaid" && order.status !== "cancelled" && (
          <button
            className="button-secondary"
            type="button"
            disabled={currentBusy || !minecraftVerified}
            onClick={() =>
              onAction(
                { action: "confirm_payment", orderId: order.id },
                `${order.orderNumber}: Zahlung bestätigt.`,
              )
            }
          >
            Zahlung manuell bestätigen
          </button>
        )}
        {order.status === "reserved" && (
          <button
            className="button-secondary"
            type="button"
            disabled={currentBusy || !minecraftVerified}
            onClick={() => requestStatus("in_production")}
          >
            Fertigung starten
          </button>
        )}
        {order.status === "in_production" && (
          <button
            className="button-secondary"
            type="button"
            disabled={currentBusy || !minecraftVerified}
            onClick={() => requestStatus("ready_for_handover")}
          >
            Zur Übergabe freigeben
          </button>
        )}
        {order.status === "ready_for_handover" && (
          <button
            className="button-primary"
            type="button"
            disabled={
              currentBusy ||
              order.paymentStatus !== "paid" ||
              !minecraftVerified
            }
            onClick={() => requestStatus("delivered")}
          >
            Fahrzeug übergeben
          </button>
        )}
        {(order.status === "reserved" || order.status === "in_production") &&
          order.paymentStatus === "unpaid" && (
            <button
              className="button-quiet-danger"
              type="button"
              disabled={currentBusy}
              onClick={() => requestStatus("cancelled")}
            >
              Stornieren und Bestand freigeben
            </button>
          )}
      </div>
    </article>
  );
}

function InventoryEditor({
  item,
  canEditPrices,
  busy,
  selected,
  onSelectionChange,
  onSave,
}: {
  item: AdminInventory;
  canEditPrices: boolean;
  busy: boolean;
  selected: boolean;
  onSelectionChange: (selected: boolean) => void;
  onSave: (body: unknown) => void;
}) {
  const [approved, setApproved] = useState(item.approved);
  const [availableUnits, setAvailableUnits] = useState(
    item.inventoryConfigured ? String(item.availableUnits) : "",
  );
  const [priceDiamonds, setPriceDiamonds] = useState(
    String(item.priceDiamonds),
  );
  const [serverInstallationConfirmed, setServerInstallationConfirmed] =
    useState(item.serverInstallationConfirmed);
  useEffect(() => {
    setApproved(item.approved);
    setAvailableUnits(
      item.inventoryConfigured ? String(item.availableUnits) : "",
    );
    setPriceDiamonds(String(item.priceDiamonds));
    setServerInstallationConfirmed(item.serverInstallationConfirmed);
  }, [
    item.approved,
    item.availableUnits,
    item.inventoryConfigured,
    item.priceDiamonds,
    item.serverInstallationConfirmed,
  ]);

  return (
    <form
      className="inventory-row"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          vehicleId: item.vehicleId,
          approved,
          availableUnits: Number(availableUnits),
          priceDiamonds: Number(priceDiamonds),
          serverInstallationConfirmed,
        });
      }}
    >
      <div className="inventory-title">
        <label className="inventory-select">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelectionChange(event.target.checked)}
          />
          <span>Für Massenaktion markieren</span>
        </label>
        <strong>{item.vehicleName}</strong>
        <span>
          {item.manufacturer} · {item.packName} · {item.vehicleClass} ·{" "}
          {item.priceBasis === "master-list" ? "Masterpreis" : "Preisvorschlag"}
        </span>
        {!item.inventoryConfigured && (
          <small className="inventory-unconfigured">
            Lagerdaten noch nicht eingetragen. Erst den bestätigten Bestand
            erfassen.
          </small>
        )}
      </div>
      <label className="inventory-count-field">
        <span>
          {getPremiumVehicle(item.vehicleId)
            ? "Premium-Festpreis 💎"
            : "Preis 💎"}
        </span>
        <input
          type="number"
          min="1"
          max="100000"
          step="1"
          value={priceDiamonds}
          disabled={
            !canEditPrices || Boolean(getPremiumVehicle(item.vehicleId))
          }
          onChange={(event) => setPriceDiamonds(event.target.value)}
          required
        />
        {getPremiumVehicle(item.vehicleId) ? (
          <small>Durch Sortiment festgelegt.</small>
        ) : (
          !canEditPrices && <small>Preisänderungen nur durch Owner.</small>
        )}
      </label>
      <label className="inventory-count-field">
        <span>Bestand</span>
        <input
          type="number"
          min="0"
          max="1000"
          step="1"
          value={availableUnits}
          onChange={(event) => setAvailableUnits(event.target.value)}
          required
        />
      </label>
      <span className="inventory-reserved">
        {item.reservedUnits} reserviert
      </span>
      <label className="inventory-approval">
        <input
          type="checkbox"
          checked={serverInstallationConfirmed}
          disabled={!item.orderEligible}
          onChange={(event) => {
            setServerInstallationConfirmed(event.target.checked);
            if (!event.target.checked) setApproved(false);
          }}
        />
        <span>
          {item.orderEligible
            ? "Zielserver getestet"
            : (item.ineligibilityReason ?? "Nicht bestellbar")}
        </span>
      </label>
      <label className="inventory-approval">
        <input
          type="checkbox"
          checked={approved}
          disabled={!item.orderEligible || !serverInstallationConfirmed}
          onChange={(event) => setApproved(event.target.checked)}
        />
        <span>Freigeben</span>
      </label>
      <button className="button-secondary" type="submit" disabled={busy}>
        {busy ? "Speichere …" : "Speichern"}
      </button>
    </form>
  );
}
