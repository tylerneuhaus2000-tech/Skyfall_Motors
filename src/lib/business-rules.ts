export type MarketplaceSplit = {
  salePriceDiamonds: number;
  commissionDiamonds: number;
  sellerReceivesDiamonds: number;
};

export function calculateMarketplaceSplit(
  salePriceDiamonds: number,
): MarketplaceSplit {
  if (!Number.isSafeInteger(salePriceDiamonds) || salePriceDiamonds <= 0) {
    throw new RangeError(
      "Der Verkaufspreis muss eine positive ganze Diamantenzahl sein.",
    );
  }

  const commissionDiamonds = Math.ceil(salePriceDiamonds * 0.1);
  return {
    salePriceDiamonds,
    commissionDiamonds,
    sellerReceivesDiamonds: salePriceDiamonds - commissionDiamonds,
  };
}

const rentalPrices: Readonly<Record<number, number>> = { 10: 3, 20: 5, 30: 7 };

export function getRentalPrice(durationMinutes: number) {
  const price = rentalPrices[durationMinutes];
  if (price === undefined) {
    throw new RangeError(
      "Es sind nur Mietzeiten von 10, 20 oder 30 Minuten verfügbar.",
    );
  }
  return price;
}
