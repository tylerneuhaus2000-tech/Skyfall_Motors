import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { hashPassword, verifyPassword } from "../src/lib/passwords";

describe("Passwortspeicherung", () => {
  it("speichert keinen Klartext und nutzt pro Passwort einen zufälligen Salt", async () => {
    const first = await hashPassword("A secure test password 42");
    const second = await hashPassword("A secure test password 42");
    expect(first.passwordHash).not.toContain("A secure test password 42");
    expect(first.passwordSalt).not.toBe(second.passwordSalt);
    expect(first.passwordAlgorithm).toBe("scrypt-32768-8-1");
  });

  it("verifiziert nur das passende Passwort", async () => {
    const password = "A secure test password 42";
    const record = await hashPassword(password);
    await expect(
      verifyPassword(password, record.passwordHash, record.passwordSalt),
    ).resolves.toBe(true);
    await expect(
      verifyPassword(
        "a different password",
        record.passwordHash,
        record.passwordSalt,
      ),
    ).resolves.toBe(false);
  });
});
