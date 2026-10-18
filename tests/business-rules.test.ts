import { describe, expect, it } from "vitest";
import {
  calculateMarketplaceSplit,
  getRentalPrice,
} from "../src/lib/business-rules";

describe("Gebrauchtwagen-Provision", () => {
  it("rundet zehn Prozent auf volle Diamanten auf", () => {
    expect(calculateMarketplaceSplit(75)).toEqual({
      salePriceDiamonds: 75,
      commissionDiamonds: 8,
      sellerReceivesDiamonds: 67,
    });
  });

  it("berechnet mindestens einen Diamanten Provision", () => {
    expect(calculateMarketplaceSplit(1).commissionDiamonds).toBe(1);
  });

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "lehnt ungültigen Preis %s ab",
    (price) => {
      expect(() => calculateMarketplaceSplit(price)).toThrow(RangeError);
    },
  );
});

describe("Mietpreise", () => {
  it.each([
    [10, 3],
    [20, 5],
    [30, 7],
  ])("berechnet %i Minuten für %i Diamanten", (minutes, price) => {
    expect(getRentalPrice(minutes)).toBe(price);
  });

  it("lehnt nicht angebotene Mietzeiten ab", () => {
    expect(() => getRentalPrice(15)).toThrow(RangeError);
  });
});
