import { describe, expect, it } from "vitest";
import {
  calculateOrderTotal,
  canConfirmPayment,
  canOfferVehicle,
  canReserveVehicle,
  canSetAvailableUnits,
  canTransitionOrder,
  resolveOrderUnitPrice,
} from "../src/lib/order-domain";

describe("serverseitige Bestellpreise", () => {
  it("verwendet den administrativ gepflegten serverseitigen Preis statt des Planpreises", () => {
    expect(resolveOrderUnitPrice(28, 41)).toBe(41);
    expect(resolveOrderUnitPrice(28)).toBe(28);
  });

  it.each([0, -1, 1.5, 100_001, Number.MAX_SAFE_INTEGER + 1])(
    "lehnt einen ungültigen Admin-Preis %s ab",
    (price) =>
      expect(() => resolveOrderUnitPrice(28, price)).toThrow(RangeError),
  );

  it.each([
    [11, "pickup", false, 11],
    [11, "delivery", false, 23],
    [11, "pickup", true, 19],
    [11, "delivery", true, 31],
  ] as const)(
    "berechnet Preis %i mit %s und express=%s als %i",
    (price, handover, express, expected) => {
      expect(calculateOrderTotal(price, handover, express)).toBe(expected);
    },
  );

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "lehnt ungültigen Fahrzeugpreis %s ab",
    (price) => {
      expect(() => calculateOrderTotal(price, "pickup", false)).toThrow(
        RangeError,
      );
    },
  );
});

describe("Bestandsreservierung", () => {
  it("reserviert nur freigegebene und nicht vollständig belegte Fahrzeuge", () => {
    expect(canReserveVehicle(true, 2, 1)).toBe(true);
    expect(canReserveVehicle(false, 2, 0)).toBe(false);
    expect(canReserveVehicle(true, 2, 2)).toBe(false);
  });

  it("akzeptiert keinen Bestand unter offenen Reservierungen", () => {
    expect(canSetAvailableUnits(2, 2)).toBe(true);
    expect(canSetAvailableUnits(1, 2)).toBe(false);
    expect(canSetAvailableUnits(2.5, 1)).toBe(false);
  });
});

describe("öffentliche Bestellfreigabe", () => {
  it("verlangt Packnachweis, Serverinstallation, Mitarbeiterfreigabe und freien Bestand", () => {
    expect(canOfferVehicle(true, true, true, 2, 1)).toBe(true);
    expect(canOfferVehicle(false, true, true, 2, 1)).toBe(false);
    expect(canOfferVehicle(true, false, true, 2, 1)).toBe(false);
    expect(canOfferVehicle(true, true, false, 2, 1)).toBe(false);
    expect(canOfferVehicle(true, true, true, 1, 1)).toBe(false);
  });
});

describe("Bestellstatus und Zahlung", () => {
  it("hält Fertigung bis zur Identitätsprüfung gesperrt", () => {
    expect(
      canTransitionOrder("reserved", "in_production", "unpaid", false),
    ).toBe(false);
    expect(
      canTransitionOrder("reserved", "in_production", "unpaid", true),
    ).toBe(true);
  });

  it("verlangt bestätigte Zahlung vor der Übergabe", () => {
    expect(
      canTransitionOrder("ready_for_handover", "delivered", "unpaid", true),
    ).toBe(false);
    expect(
      canTransitionOrder("ready_for_handover", "delivered", "paid", true),
    ).toBe(true);
  });

  it("bestätigt Zahlung höchstens einmal und nie nach Stornierung", () => {
    expect(canConfirmPayment("reserved", "unpaid")).toBe(true);
    expect(canConfirmPayment("reserved", "paid")).toBe(false);
    expect(canConfirmPayment("cancelled", "unpaid")).toBe(false);
  });

  it("gibt eine unbezahlte Reservierung beim Storno wieder frei", () => {
    expect(
      canTransitionOrder("in_production", "cancelled", "unpaid", false),
    ).toBe(true);
    expect(canTransitionOrder("in_production", "cancelled", "paid", true)).toBe(
      false,
    );
  });
});
