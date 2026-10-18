import { describe, expect, it } from "vitest";
import {
  adminOrderActionSchema,
  createOrderSchema,
  inventoryUpdateSchema,
  minecraftUsernameSchema,
  normalizeMinecraftUsername,
  passwordSchema,
  safeAccountReturnPath,
} from "../src/lib/validation";

describe("Minecraft-Konto-Eingaben", () => {
  it("akzeptiert Minecraft-Namen ohne E-Mail und normalisiert die Suche", () => {
    expect(minecraftUsernameSchema.safeParse("Skyfall_Racer").success).toBe(
      true,
    );
    expect(normalizeMinecraftUsername("Skyfall_Racer")).toBe("skyfall_racer");
  });

  it.each(["ab", "name with spaces", "name@example.com", "name-too-long-1234"])(
    "lehnt ungültigen Spielernamen %s ab",
    (username) =>
      expect(minecraftUsernameSchema.safeParse(username).success).toBe(false),
  );

  it("verlangt ein langes Passwort, ohne es zu trimmen oder umzuschreiben", () => {
    expect(passwordSchema.safeParse("  twelve chars  ").success).toBe(true);
    expect(passwordSchema.safeParse("short").success).toBe(false);
  });
});

describe("Bestell-Eingaben", () => {
  const validOrder = {
    vehicleId: "ocp-merc",
    idempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
    handover: "pickup",
    express: false,
    paymentMethod: "terminal",
  };

  it("akzeptiert nur erlaubte Übergabe-/Zahlungsoptionen und eine Idempotenz-ID", () => {
    expect(createOrderSchema.safeParse(validOrder).success).toBe(true);
    expect(
      createOrderSchema.safeParse({
        ...validOrder,
        paymentMethod: "credit-card",
      }).success,
    ).toBe(false);
    expect(
      createOrderSchema.safeParse({ ...validOrder, idempotencyKey: "x" })
        .success,
    ).toBe(false);
    expect(
      createOrderSchema.safeParse({ ...validOrder, totalPrice: 1 }).success,
    ).toBe(true);
  });
});

describe("Admin-Fahrzeugpreise", () => {
  const validInventoryUpdate = {
    vehicleId: "ocp-merc",
    approved: false,
    availableUnits: 0,
    priceDiamonds: 11,
    serverInstallationConfirmed: false,
  };

  it("akzeptiert endliche Diamantenpreise innerhalb der Admin-Grenze", () => {
    expect(inventoryUpdateSchema.safeParse(validInventoryUpdate).success).toBe(
      true,
    );
    expect(
      inventoryUpdateSchema.safeParse({
        ...validInventoryUpdate,
        priceDiamonds: 100_000,
      }).success,
    ).toBe(true);
  });

  it.each([0, -1, 1.5, 100_001, Number.MAX_SAFE_INTEGER + 1])(
    "weist ungültigen Admin-Preis %s zurück",
    (priceDiamonds) => {
      expect(
        inventoryUpdateSchema.safeParse({
          ...validInventoryUpdate,
          priceDiamonds,
        }).success,
      ).toBe(false);
    },
  );
});

describe("Anmelde-Rücksprung", () => {
  it("erlaubt interne Ziele und weist externe oder mehrdeutige URLs zurück", () => {
    expect(safeAccountReturnPath("/admin")).toBe("/admin");
    expect(safeAccountReturnPath("/bestellen/ocp-merc?step=confirm")).toBe(
      "/bestellen/ocp-merc?step=confirm",
    );
    expect(safeAccountReturnPath("//example.com")).toBe("/kundenbereich");
    expect(safeAccountReturnPath("/\\example.com")).toBe("/kundenbereich");
    expect(safeAccountReturnPath("javascript:alert(1)")).toBe("/kundenbereich");
  });
});

describe("Admin-Bestellaktionen", () => {
  it("akzeptiert automatisch erzeugte Firestore-Bestell-IDs", () => {
    const orderId = "aBcD0123eFgH4567iJkL";
    expect(
      adminOrderActionSchema.safeParse({
        action: "confirm_payment",
        orderId,
      }).success,
    ).toBe(true);
    expect(
      adminOrderActionSchema.safeParse({
        action: "set_status",
        orderId,
        status: "in_production",
      }).success,
    ).toBe(true);
  });

  it("weist ungültige Bestell-IDs zurück", () => {
    expect(
      adminOrderActionSchema.safeParse({
        action: "confirm_payment",
        orderId: "not-an-order-id",
      }).success,
    ).toBe(false);
  });
});
