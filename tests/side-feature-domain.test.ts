import { describe, expect, it } from "vitest";
import {
  addRecentlyViewedVehicle,
  canJoinVehicleWaitlist,
  canModeratePendingEntry,
  canTransitionWorkshopTicket,
  deliveryStepIndex,
  deriveCollectorBadges,
  deriveDriverProfileStats,
  generatePlateSuffix,
  getVehicleOfDay,
  hasDeliveredVehicleOrder,
  isVehiclePassEligible,
  nextTestDriveStatus,
  sanitizePlateSuffix,
  toggleComparedVehicle,
} from "../src/lib/side-feature-domain";
import {
  customerReviewSchema,
  lapEntrySchema,
  notificationReadSchema,
  testDriveRequestSchema,
  vehicleWaitlistSchema,
  wishlistActionSchema,
  workshopTicketSchema,
} from "../src/lib/validation";

describe("Fahrzeugvergleich und Verlauf", () => {
  it("begrenzt den Vergleich auf drei Fahrzeuge und erlaubt Entfernen", () => {
    const first = toggleComparedVehicle([], "a");
    const second = toggleComparedVehicle(first.ids, "b");
    const third = toggleComparedVehicle(second.ids, "c");
    expect(third.ids).toEqual(["a", "b", "c"]);
    expect(toggleComparedVehicle(third.ids, "d")).toEqual({
      ids: ["a", "b", "c"],
      error: "Du kannst höchstens drei Fahrzeuge vergleichen.",
    });
    expect(toggleComparedVehicle(third.ids, "b").ids).toEqual(["a", "c"]);
  });

  it("merkt zuletzt besuchte Fahrzeuge höchstens sechs Mal und ohne Duplikate", () => {
    expect(addRecentlyViewedVehicle(["a", "b", "c"], "b")).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(
      addRecentlyViewedVehicle(["a", "b", "c", "d", "e", "f"], "g"),
    ).toEqual(["g", "a", "b", "c", "d", "e"]);
  });
});

describe("neue Fahrzeug- und Fahrerfunktionen", () => {
  it("wechselt das Tageshighlight täglich und bleibt pro Tag stabil", () => {
    const entries = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const firstDay = new Date("2026-10-18T09:00:00Z");
    expect(getVehicleOfDay(entries, firstDay)).toEqual(
      getVehicleOfDay(entries, new Date("2026-10-18T23:00:00Z")),
    );
    expect(getVehicleOfDay(entries, firstDay)).not.toEqual(
      getVehicleOfDay(entries, new Date("2026-10-19T09:00:00Z")),
    );
    expect(getVehicleOfDay([], firstDay)).toBeNull();
  });

  it("erzeugt und bereinigt SKYFALL-Kennzeichen sicher", () => {
    expect(generatePlateSuffix(new Uint8Array([0, 1, 2, 3, 35, 36]))).toBe(
      "ABCD9A",
    );
    expect(sanitizePlateSuffix("sky-12 é!long999")).toBe("SKY12L");
    expect(() => generatePlateSuffix(new Uint8Array([1, 2]))).toThrow();
  });

  it("berechnet Fahrerbestzeiten nur aus gültigen Rundenzeiten", () => {
    const stats = deriveDriverProfileStats([
      { trackName: "Nordring", vehicleName: "Merc", timeMs: 61_200 },
      { trackName: "Nordring", vehicleName: "Scout", timeMs: 59_900 },
      { trackName: "Südkurs", vehicleName: "Quad", timeMs: 0 },
    ]);
    expect(stats).toEqual({
      approvedLapCount: 2,
      trackCount: 1,
      vehicleCount: 2,
      personalBests: [
        { trackName: "Nordring", vehicleName: "Scout", timeMs: 59_900 },
      ],
    });
  });

  it("öffnet die Warteliste nur für verifizierten und tatsächlich ausverkauften Bestand", () => {
    const soldOut = {
      orderEligible: true,
      approved: true,
      serverInstallationConfirmed: true,
      availableUnits: 1,
      reservedUnits: 1,
    };
    expect(canJoinVehicleWaitlist(soldOut)).toBe(true);
    expect(
      canJoinVehicleWaitlist({
        ...soldOut,
        serverInstallationConfirmed: false,
      }),
    ).toBe(false);
    expect(canJoinVehicleWaitlist({ ...soldOut, reservedUnits: 0 })).toBe(
      false,
    );
    expect(canJoinVehicleWaitlist({ ...soldOut, availableUnits: -1 })).toBe(
      false,
    );
    expect(
      vehicleWaitlistSchema.safeParse({
        action: "join",
        vehicleId: "vehicle-one",
      }).success,
    ).toBe(true);
    expect(
      vehicleWaitlistSchema.safeParse({
        action: "remove",
        vehicleId: "vehicle-one",
      }).success,
    ).toBe(false);
  });

  it("erzwingt einen nachvollziehbaren Werkstatt-Statusablauf", () => {
    expect(canTransitionWorkshopTicket("requested", "in_review")).toBe(true);
    expect(canTransitionWorkshopTicket("in_review", "waiting_for_parts")).toBe(
      true,
    );
    expect(canTransitionWorkshopTicket("waiting_for_parts", "ready")).toBe(
      true,
    );
    expect(canTransitionWorkshopTicket("ready", "completed")).toBe(true);
    expect(canTransitionWorkshopTicket("requested", "completed")).toBe(false);
    expect(canTransitionWorkshopTicket("completed", "in_review")).toBe(false);
    expect(
      workshopTicketSchema.safeParse({
        vehicleId: "vehicle-one",
        requestType: "repair",
        description: "Bremse prüfen",
      }).success,
    ).toBe(true);
    expect(
      workshopTicketSchema.safeParse({
        vehicleId: "vehicle-one",
        requestType: "repair",
        description: "kurz",
      }).success,
    ).toBe(false);
  });

  it("validiert nur Notification-IDs im internen Firestore-Format", () => {
    expect(
      notificationReadSchema.safeParse({
        notificationId: "0123456789abcdefghij",
      }).success,
    ).toBe(true);
    expect(
      notificationReadSchema.safeParse({ notificationId: "not-a-document" })
        .success,
    ).toBe(false);
  });
});

describe("Besitz, Lieferstatus und Sammler-Abzeichen", () => {
  it("zeigt den Liefertracker anhand des gespeicherten Bestellstatus", () => {
    expect(deliveryStepIndex("reserved")).toBe(0);
    expect(deliveryStepIndex("in_production")).toBe(1);
    expect(deliveryStepIndex("ready_for_handover")).toBe(2);
    expect(deliveryStepIndex("delivered")).toBe(3);
    expect(deliveryStepIndex("cancelled")).toBe(-1);
  });

  it("stellt Fahrzeugpässe nur für echte Übergaben aus", () => {
    expect(
      isVehiclePassEligible({ status: "delivered", handedOverAt: 123 }),
    ).toBe(true);
    expect(
      isVehiclePassEligible({
        status: "ready_for_handover",
        handedOverAt: null,
      }),
    ).toBe(false);
    expect(
      isVehiclePassEligible({ status: "delivered", handedOverAt: null }),
    ).toBe(false);
    expect(
      isVehiclePassEligible({ status: "delivered", handedOverAt: 0 }),
    ).toBe(false);
    expect(
      hasDeliveredVehicleOrder(
        [
          { vehicleId: "car-a", status: "reserved", handedOverAt: null },
          { vehicleId: "car-b", status: "delivered", handedOverAt: 123 },
        ],
        "car-b",
      ),
    ).toBe(true);
    expect(
      hasDeliveredVehicleOrder(
        [{ vehicleId: "car-a", status: "reserved", handedOverAt: null }],
        "car-a",
      ),
    ).toBe(false);
  });

  it("vergibt Sammler-Abzeichen aus verschiedenen bestätigten Übergaben", () => {
    const pending = deriveCollectorBadges([
      {
        vehicleId: "a",
        status: "reserved",
        packName: "Pack A",
        handedOverAt: null,
      },
    ]);
    expect(pending).toEqual([]);
    const badges = deriveCollectorBadges([
      {
        vehicleId: "a",
        status: "delivered",
        packName: "Pack A",
        handedOverAt: 10,
      },
      {
        vehicleId: "b",
        status: "delivered",
        packName: "Pack B",
        handedOverAt: 20,
      },
      {
        vehicleId: "c",
        status: "delivered",
        packName: "Pack C",
        handedOverAt: 30,
      },
    ]);
    expect(badges.map((badge) => badge.id)).toEqual([
      "first-handover",
      "collector-three",
      "pack-explorer",
    ]);
  });
});

describe("manuelle Anfragen und Moderation", () => {
  it("erlaubt nur gültige Testfahrt- und Kundenbewertungen", () => {
    expect(
      testDriveRequestSchema.safeParse({ vehicleId: "vehicle-one" }).success,
    ).toBe(true);
    expect(testDriveRequestSchema.safeParse({ vehicleId: "x" }).success).toBe(
      false,
    );
    expect(
      customerReviewSchema.safeParse({
        vehicleId: "vehicle-one",
        rating: 5,
        comment: "Fahrzeug wurde übergeben.",
      }).success,
    ).toBe(true);
    expect(
      customerReviewSchema.safeParse({
        vehicleId: "vehicle-one",
        rating: 6,
        comment: "Ungültige Bewertung",
      }).success,
    ).toBe(false);
  });

  it("erlaubt Testfahrtstatus nur nach manueller Freigabe und einmalige Moderation", () => {
    expect(nextTestDriveStatus("pending", "approve")).toBe("approved");
    expect(nextTestDriveStatus("pending", "decline")).toBe("declined");
    expect(nextTestDriveStatus("approved", "complete")).toBe("completed");
    expect(nextTestDriveStatus("pending", "complete")).toBeNull();
    expect(canModeratePendingEntry("pending")).toBe(true);
    expect(canModeratePendingEntry("approved")).toBe(false);
  });

  it("validiert manuelle Rundenzeit- und Wunschlisteneingaben", () => {
    expect(
      lapEntrySchema.safeParse({
        vehicleId: "vehicle-one",
        trackName: "Server-Ring",
        timeMs: 58_234,
      }).success,
    ).toBe(true);
    expect(
      lapEntrySchema.safeParse({
        vehicleId: "vehicle-one",
        trackName: "x",
        timeMs: 58_234,
      }).success,
    ).toBe(false);
    expect(
      wishlistActionSchema.safeParse({
        action: "add",
        vehicleId: "vehicle-one",
      }).success,
    ).toBe(true);
    expect(
      wishlistActionSchema.safeParse({
        action: "admin",
        vehicleId: "vehicle-one",
      }).success,
    ).toBe(false);
  });
});
