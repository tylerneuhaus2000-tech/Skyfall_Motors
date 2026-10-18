import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const rules = readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8");
const firebaseConfig = JSON.parse(
  readFileSync(resolve(process.cwd(), "firebase.json"), "utf8"),
);

describe("Firestore-Clientzugriff", () => {
  it("bindet die deploybare Konfiguration an die deny-all-Regeln", () => {
    expect(firebaseConfig.firestore.rules).toBe("firestore.rules");
    expect(rules).toContain("rules_version = '2';");
    expect(rules).toMatch(/match \/\{document=\*\*\}/);
    expect(rules.match(/\ballow\b/g)).toHaveLength(1);
    expect(rules).toContain("allow read, write: if false;");
  });
});
