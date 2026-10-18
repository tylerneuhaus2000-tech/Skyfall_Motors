import { describe, expect, it } from "vitest";
import {
  adminPermissions,
  hasAdminPermission,
  permissionsForAccount,
} from "../src/lib/admin-permissions";
import { buildAdminDailyTasks } from "../src/lib/admin-tasks";
import { csvCell, toCsv } from "../src/lib/csv";
import {
  calculateOrderTotal,
  canChangeVehiclePrice,
  isPurchaseReceiptEligible,
} from "../src/lib/order-domain";
import {
  defaultShopSettings,
  shopOrderBlockReason,
} from "../src/lib/shop-settings-domain";
import {
  adminInquiryUpdateSchema,
  announcementMutationSchema,
  customerInquirySchema,
  shopSettingsUpdateSchema,
} from "../src/lib/validation";

describe("Shop-Betrieb und verbindliche Gebühren", () => {
  it("berechnet die vom Shop gesetzten Gebühren statt statischer Werte", () => {
    expect(
      calculateOrderTotal(40, "delivery", true, {
        deliveryFee: 15,
        expressFee: 5,
      }),
    ).toBe(60);
    expect(calculateOrderTotal(40, "pickup", false)).toBe(40);
    expect(defaultShopSettings).toMatchObject({
      mode: "open",
      deliveryFee: 12,
      expressFee: 8,
    });
  });

  it("erzwingt geschlossene, Wartungs- und eingeschränkte Betriebsmodi", () => {
    expect(
      shopOrderBlockReason(
        { ...defaultShopSettings, mode: "closed" },
        true,
        "pickup",
        false,
      ),
    ).toBe("shop_closed");
    expect(
      shopOrderBlockReason(
        { ...defaultShopSettings, mode: "maintenance" },
        true,
        "pickup",
        false,
      ),
    ).toBe("shop_maintenance");
    const restricted = { ...defaultShopSettings, mode: "restricted" as const };
    expect(shopOrderBlockReason(restricted, false, "pickup", false)).toBe(
      "shop_verification_required",
    );
    expect(shopOrderBlockReason(restricted, true, "delivery", false)).toBe(
      "shop_restricted_options",
    );
    expect(shopOrderBlockReason(restricted, true, "pickup", true)).toBe(
      "shop_restricted_options",
    );
    expect(shopOrderBlockReason(restricted, true, "pickup", false)).toBeNull();
  });

  it("beschränkt Gebühren- und Fahrzeugpreisänderungen auf Owner", () => {
    expect(permissionsForAccount("owner", null)).toEqual(adminPermissions);
    expect(hasAdminPermission("staff", "salesperson", "settings")).toBe(false);
    expect(hasAdminPermission("staff", "salesperson", "inquiries")).toBe(true);
    expect(hasAdminPermission("staff", "mechanic", "inquiries")).toBe(false);
    expect(canChangeVehiclePrice("staff", 20, 20)).toBe(true);
    expect(canChangeVehiclePrice("staff", 20, 21)).toBe(false);
    expect(canChangeVehiclePrice("owner", 20, 21)).toBe(true);
  });

  it("validiert Gebühren, Betriebsmodus und schlägt bei ungültigen Werten fehl", () => {
    expect(
      shopSettingsUpdateSchema.safeParse({
        mode: "restricted",
        deliveryFee: 12,
        expressFee: 8,
      }).success,
    ).toBe(true);
    expect(
      shopSettingsUpdateSchema.safeParse({
        mode: "offline",
        deliveryFee: -1,
        expressFee: 8.5,
      }).success,
    ).toBe(false);
  });
});

describe("Dynamische Tagesaufgaben", () => {
  it("zeigt nur Aufgaben, die aus offenen Datensätzen folgen", () => {
    const tasks = buildAdminDailyTasks({
      orders: [
        { status: "reserved", paymentStatus: "unpaid" },
        { status: "delivered", paymentStatus: "paid" },
        { status: "cancelled", paymentStatus: "unpaid" },
      ],
      testDriveRequests: [{ status: "pending" }, { status: "approved" }],
      lapEntries: [{ status: "pending" }],
      reviews: [],
      waitlist: [{ status: "waiting" }, { status: "contacted" }],
      workshopTickets: [{ status: "requested" }, { status: "completed" }],
      inquiries: [{ status: "open" }],
    });
    expect(tasks).toEqual([
      {
        id: "open-orders",
        label: "Offene Bestellungen bearbeiten",
        count: 1,
        href: "#orders",
      },
      {
        id: "unpaid-orders",
        label: "Zahlungen manuell prüfen",
        count: 1,
        href: "#orders",
      },
      {
        id: "test-drives",
        label: "Testfahrt-Anfragen beantworten",
        count: 1,
        href: "#test-drives",
      },
      {
        id: "workshop",
        label: "Werkstatt-Tickets prüfen",
        count: 1,
        href: "#workshop",
      },
      {
        id: "laps",
        label: "Rundenzeiten moderieren",
        count: 1,
        href: "#races",
      },
      {
        id: "waitlist",
        label: "Wartelisten-Kunden kontaktieren",
        count: 1,
        href: "#waitlist",
      },
      {
        id: "inquiries",
        label: "Kundenanfragen bearbeiten",
        count: 1,
        href: "#inquiries",
      },
    ]);
    expect(
      buildAdminDailyTasks({
        orders: [],
        testDriveRequests: [],
        lapEntries: [],
        reviews: [],
        waitlist: [],
        workshopTickets: [],
        inquiries: [],
      }),
    ).toEqual([]);
  });
});

describe("Kundenservice, Ankündigungen und Export", () => {
  it("stellt Kaufbelege nur für bezahlte und bestätigte Übergaben bereit", () => {
    expect(
      isPurchaseReceiptEligible({
        status: "delivered",
        paymentStatus: "paid",
        handedOverAt: 1_800_000_000_000,
      }),
    ).toBe(true);
    expect(
      isPurchaseReceiptEligible({
        status: "delivered",
        paymentStatus: "unpaid",
        handedOverAt: 1_800_000_000_000,
      }),
    ).toBe(false);
    expect(
      isPurchaseReceiptEligible({
        status: "in_production",
        paymentStatus: "paid",
        handedOverAt: null,
      }),
    ).toBe(false);
  });

  it("validiert Kundenanfragen und Antworten ohne Offenlegung interner Notizen", () => {
    expect(
      customerInquirySchema.safeParse({
        subject: "Bestellung",
        message: "Ich habe eine Frage zu meinem Auftrag.",
      }).success,
    ).toBe(true);
    expect(
      adminInquiryUpdateSchema.safeParse({
        inquiryId: "abcdefghijklmnopqrst",
        status: "answered",
        staffReply: "Wir haben deinen Auftrag geprüft.",
        internalNote: "",
      }).success,
    ).toBe(true);
    expect(
      adminInquiryUpdateSchema.safeParse({
        inquiryId: "abcdefghijklmnopqrst",
        status: "answered",
        staffReply: "",
        internalNote: "Nur intern",
      }).success,
    ).toBe(false);
  });

  it("validiert Ankündigungen und neutralisiert Formeln in CSV-Zellen", () => {
    expect(
      announcementMutationSchema.safeParse({
        action: "create",
        title: "Werkstattpause",
        body: "Die Werkstatt bleibt heute geschlossen.",
        published: true,
      }).success,
    ).toBe(true);
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell("\t=1+1")).toBe('"\'\t=1+1"');
    expect(toCsv(["name"], [["Tyler"], ["=1+1"]])).toContain("'=1+1");
  });
});
