import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const firebaseConfig = JSON.parse(
  readFileSync(resolve(projectRoot, "firebase.json"), "utf8"),
) as { firestore?: { rules?: string } };
const configuredRulesPath = firebaseConfig.firestore?.rules;
if (configuredRulesPath !== "firestore.rules") {
  throw new Error("firebase.json must point to this project's firestore.rules");
}
const rulesPath = resolve(projectRoot, configuredRulesPath);
const rules = readFileSync(rulesPath, "utf8");
const projectId = "demo-skyfall-motors";
const protectedCollections = [
  "users",
  "minecraftUsernames",
  "settings",
  "inventory",
  "orders",
  "orderNumbers",
  "orderIdempotency",
  "customerVehicleReservations",
  "authRateLimits",
  "auditLogs",
] as const;
const actors = [
  { name: "unauthenticated", type: "anonymous" },
  { name: "authenticated customer", type: "customer" },
  { name: "authenticated staff", type: "staff" },
] as const;

let testEnvironment: RulesTestEnvironment | undefined;

describe.skipIf(!process.env.FIRESTORE_EMULATOR_HOST)(
  "Firestore Rules Emulator deny-all verification",
  () => {
    beforeAll(async () => {
      expect(firebaseConfig.firestore?.rules).toBe("firestore.rules");
      expect(rulesPath).toBe(resolve(projectRoot, "firestore.rules"));

      testEnvironment = await initializeTestEnvironment({
        projectId,
        firestore: { rules },
      });

      await testEnvironment.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await Promise.all(
          protectedCollections.map((name) =>
            setDoc(doc(db, name, "security-probe"), {
              role: "staff",
              customerId: "another-customer",
              totalPrice: 42,
              paymentStatus: "unpaid",
              approved: false,
              probe: true,
            }),
          ),
        );
      });
    });

    afterAll(async () => {
      if (testEnvironment) {
        await testEnvironment.clearFirestore();
        await testEnvironment.cleanup();
      }
    });

    for (const actor of actors) {
      describe(actor.name, () => {
        it.each(protectedCollections)(
          "cannot get, list, create, update, or delete in %s",
          async (collectionName) => {
            if (!testEnvironment)
              throw new Error("Emulator was not initialized");
            const context =
              actor.type === "anonymous"
                ? testEnvironment.unauthenticatedContext()
                : testEnvironment.authenticatedContext(
                    `${actor.type}-probe`,
                    actor.type === "staff" ? { role: "staff" } : {},
                  );
            const db = context.firestore();
            const existingDocument = doc(db, collectionName, "security-probe");

            await assertFails(getDoc(existingDocument));
            await assertFails(getDocs(collection(db, collectionName)));
            await assertFails(
              setDoc(doc(db, collectionName, `${actor.type}-create-probe`), {
                role: "owner",
                customerId: "another-customer",
                totalPrice: 0,
                paymentStatus: "paid",
                approved: true,
              }),
            );
            await assertFails(
              updateDoc(existingDocument, {
                role: "owner",
                totalPrice: 0,
                paymentStatus: "paid",
                approved: true,
              }),
            );
            await assertFails(deleteDoc(existingDocument));
          },
        );
      });
    }
  },
);
