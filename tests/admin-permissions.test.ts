import { describe, expect, it } from "vitest";
import {
  buildAdminSalesSeries,
  summarizeAdminOrders,
} from "../src/lib/admin-analytics";
import {
  adminPermissions,
  hasAdminPermission,
  permissionsForAccount,
} from "../src/lib/admin-permissions";
import {
  homepageHighlightSchema,
  inventoryBulkActionSchema,
  staffRoleUpdateSchema,
} from "../src/lib/validation";

describe("serverseitige Command-Center-Rollen", () => {
  it("gibt dem Inhaber alle Module und Kundenkonten keine Adminrechte", () => {
    expect(permissionsForAccount("owner", null)).toEqual(adminPermissions);
    expect(permissionsForAccount("customer", null)).toEqual([]);
  });

  it("begrenzt Verkauf, Werkstatt und Rennen auf ihre jeweiligen Bereiche", () => {
    expect(hasAdminPermission("staff", "salesperson", "orders")).toBe(true);
    expect(hasAdminPermission("staff", "salesperson", "inventory")).toBe(true);
    expect(hasAdminPermission("staff", "salesperson", "workshop")).toBe(false);
    expect(hasAdminPermission("staff", "salesperson", "races")).toBe(false);
    expect(hasAdminPermission("staff", "mechanic", "workshop")).toBe(true);
    expect(hasAdminPermission("staff", "mechanic", "orders")).toBe(false);
    expect(hasAdminPermission("staff", "race_director", "races")).toBe(true);
    expect(hasAdminPermission("staff", "race_director", "customers")).toBe(
      false,
    );
    expect(hasAdminPermission("staff", null, "orders")).toBe(false);
  });

  it("validiert Mitarbeiterzuweisungen und begrenzte Bestandsmassenaktionen", () => {
    expect(
      staffRoleUpdateSchema.safeParse({
        userId: "31cb74c6-54fc-49f5-ad4d-838682856901",
        staffRole: "mechanic",
      }).success,
    ).toBe(true);
    expect(
      staffRoleUpdateSchema.safeParse({
        userId: "31cb74c6-54fc-49f5-ad4d-838682856901",
        staffRole: "owner",
      }).success,
    ).toBe(false);
    expect(
      inventoryBulkActionSchema.safeParse({
        action: "pause_sales",
        vehicleIds: ["ocp-scout", "oamp-highwayman"],
      }).success,
    ).toBe(true);
    expect(
      inventoryBulkActionSchema.safeParse({
        action: "pause_sales",
        vehicleIds: ["ocp-scout", "ocp-scout"],
      }).success,
    ).toBe(false);
    expect(
      homepageHighlightSchema.safeParse({
        vehicleId: "ocp-scout",
        dateKey: "2026-10-18",
      }).success,
    ).toBe(true);
    expect(
      homepageHighlightSchema.safeParse({
        vehicleId: "ocp-scout",
        dateKey: "today",
      }).success,
    ).toBe(false);
  });
});

describe("Command-Center-Kennzahlen aus echten Bestellungen", () => {
  it("zählt Zahlungen, offene Aufträge und Bestseller nur nach gespeichertem Status", () => {
    const data = [
      {
        vehicleId: "car-a",
        vehicleName: "Car A",
        totalPrice: 20,
        handover: "delivery" as const,
        paymentStatus: "paid" as const,
        status: "delivered" as const,
        handedOverAt: 1_790_000_000_000,
      },
      {
        vehicleId: "car-a",
        vehicleName: "Car A",
        totalPrice: 12,
        handover: "pickup" as const,
        paymentStatus: "paid" as const,
        status: "reserved" as const,
        handedOverAt: null,
      },
      {
        vehicleId: "car-b",
        vehicleName: "Car B",
        totalPrice: 45,
        handover: "delivery" as const,
        paymentStatus: "unpaid" as const,
        status: "in_production" as const,
        handedOverAt: null,
      },
      {
        vehicleId: "car-c",
        vehicleName: "Car C",
        totalPrice: 15,
        handover: "pickup" as const,
        paymentStatus: "paid" as const,
        status: "cancelled" as const,
        handedOverAt: null,
      },
    ];
    expect(summarizeAdminOrders(data)).toEqual({
      openOrders: 2,
      unpaidOrders: 1,
      openDeliveryOrders: 1,
      confirmedDiamonds: 32,
      completedSales: 1,
      bestsellers: [{ vehicleId: "car-a", name: "Car A", count: 1 }],
    });
  });

  it("ordnet Verkäufe dem protokollierten Übergabetag zu", () => {
    const deliveredAt = Date.parse("2026-10-18T13:00:00Z");
    const rows = buildAdminSalesSeries(
      [
        {
          vehicleId: "car-a",
          vehicleName: "Car A",
          totalPrice: 28,
          handover: "pickup",
          paymentStatus: "paid",
          status: "delivered",
          handedOverAt: deliveredAt,
        },
        {
          vehicleId: "car-b",
          vehicleName: "Car B",
          totalPrice: 32,
          handover: "pickup",
          paymentStatus: "unpaid",
          status: "delivered",
          handedOverAt: deliveredAt,
        },
      ],
      7,
      new Date("2026-10-18T18:00:00Z"),
    );
    expect(rows).toHaveLength(7);
    expect(rows.at(-1)).toMatchObject({
      dateKey: "2026-10-18",
      orders: 1,
      diamonds: 28,
    });
    expect(rows.reduce((total, row) => total + row.orders, 0)).toBe(1);
  });
});
