"use client";

export function PrintReceiptButton() {
  return (
    <button
      className="button-secondary receipt-print-button"
      type="button"
      onClick={() => window.print()}
    >
      Beleg drucken / als PDF speichern
    </button>
  );
}
