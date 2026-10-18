import { generateKeyPairSync, randomUUID } from "node:crypto";
import { type App, cert, deleteApp, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { PublicAccount } from "../src/lib/account";
import {
  createCustomerInquiry,
  listCustomerInquiries,
  updateCustomerInquiry,
} from "../src/lib/inquiry-store";
import { createOrder } from "../src/lib/order-store";

vi.mock("server-only", () => ({}));

const projectId = "demo-skyfall-motors";
const describeIfEmulator = process.env.FIRESTORE_EMULATOR_HOST
  ? describe
  : describe.skip;

describeIfEmulator(
  "Premiumpreise und Angebotsbestellungen (Firestore-Emulator)",
  () => {
    let app: App;
    let db: FirebaseFirestore.Firestore;
    let account: PublicAccount;

    beforeAll(() => {
      const { privateKey } = generateKeyPairSync("rsa", {
        modulusLength: 2048,
      });
      app = initializeApp(
        {
          projectId,
          credential: cert({
            projectId,
            clientEmail: "emulator-test@skyfall-motors.invalid",
            privateKey: privateKey
              .export({ type: "pkcs8", format: "pem" })
              .toString(),
          }),
        },
        `premium-order-tests-${randomUUID()}`,
      );
      db = getFirestore(app);
    });

    afterAll(async () => {
      if (app) await deleteApp(app);
    });

    beforeEach(async () => {
      account = {
        id: randomUUID(),
        minecraftUsername: "EmulatorUser",
        role: "customer",
        staffRole: null,
        minecraftVerified: true,
        createdAt: Date.now(),
      };
      await db.collection("users").doc(account.id).set({
        accountStatus: "active",
        minecraftUsername: account.minecraftUsername,
        minecraftVerified: true,
      });
      await db.collection("inventory").doc("craftspeed-m3gtr").set({
        approved: true,
        availableUnits: 1,
        reservedUnits: 0,
        priceDiamonds: 999_999,
        serverInstallationConfirmed: true,
      });
    });

    it("ignoriert manipulierte Inventarpreise und berechnet den offiziellen Premiumpreis plus Gebühren serverseitig", async () => {
      const result = await createOrder(db, account, {
        vehicleId: "craftspeed-m3gtr",
        idempotencyKey: randomUUID(),
        handover: "delivery",
        express: true,
        paymentMethod: "terminal",
      });
      const order = (
        await db
          .collection("orders")
          .where("orderNumber", "==", result.orderNumber)
          .get()
      ).docs[0];
      expect(order.get("unitPrice")).toBe(175);
      expect(order.get("deliveryPrice")).toBe(12);
      expect(order.get("expressPrice")).toBe(8);
      expect(order.get("totalPrice")).toBe(195);
    });

    it("lehnt ein Nicht-Premiumfahrzeug ohne angenommenes Adminangebot ab", async () => {
      await expect(
        createOrder(db, account, {
          vehicleId: "craftspeed-e46",
          idempotencyKey: randomUUID(),
          handover: "pickup",
          express: false,
          paymentMethod: "terminal",
        }),
      ).rejects.toMatchObject({ code: "vehicle_unavailable" });
    });

    it("wandelt ein explizit angenommenes Angebot atomar in eine reguläre Bestellung um", async () => {
      const vehicleId = "craftspeed-e46";
      await db.collection("inventory").doc(vehicleId).set({
        approved: true,
        availableUnits: 1,
        reservedUnits: 0,
        serverInstallationConfirmed: true,
      });
      const inquiryId = await createCustomerInquiry(db, account, {
        vehicleId,
        subject: "Fahrzeugangebot anfragen",
        message: "Bitte erstellt mir ein individuelles Angebot.",
      });
      const owner: PublicAccount = {
        ...account,
        id: randomUUID(),
        role: "owner",
        minecraftUsername: "OwnerTest",
      };
      await updateCustomerInquiry(db, owner, {
        inquiryId,
        status: "answered",
        staffReply: "Wir bieten das Fahrzeug für 73 Diamanten an.",
        internalNote: "Testangebot im Emulator.",
        offerPriceDiamonds: 73,
      });
      const customerInquiries = await listCustomerInquiries(db, account.id);
      expect(customerInquiries[0]?.vehicleName).toBe("BMW M3 (E46)");
      expect(customerInquiries[0]).not.toHaveProperty("internalNote");
      const inquiryRef = db.collection("customerInquiries").doc(inquiryId);
      expect((await inquiryRef.get()).get("offerStatus")).toBe("offered");
      const result = await createOrder(db, account, {
        vehicleId,
        idempotencyKey: randomUUID(),
        handover: "pickup",
        express: false,
        paymentMethod: "terminal",
        acceptedOfferId: inquiryId,
      });
      const order = (
        await db
          .collection("orders")
          .where("orderNumber", "==", result.orderNumber)
          .get()
      ).docs[0];
      expect(order.get("unitPrice")).toBe(73);
      expect((await inquiryRef.get()).get("offerStatus")).toBe("accepted");
      expect(
        (await db.collection("inventory").doc(vehicleId).get()).get(
          "reservedUnits",
        ),
      ).toBe(1);
    });

    it("verhindert, dass Kunden selbst ein administratives Angebot ändern", async () => {
      await expect(
        updateCustomerInquiry(db, account, {
          inquiryId: "abcdefghijklmnopqrst",
          status: "answered",
          staffReply: "Manipulierter Preis.",
          internalNote: "",
          offerPriceDiamonds: 1,
        }),
      ).rejects.toMatchObject({ code: "forbidden" });
    });

    it("verhindert, dass ein anderer Kunde fremdes Angebot annimmt", async () => {
      const vehicleId = "craftspeed-e46";
      const inquiryRef = db.collection("customerInquiries").doc();
      await inquiryRef.set({
        customerId: randomUUID(),
        vehicleId,
        offerPriceDiamonds: 73,
        offerStatus: "offered",
        status: "answered",
      });
      await expect(
        createOrder(db, account, {
          vehicleId,
          idempotencyKey: randomUUID(),
          handover: "pickup",
          express: false,
          paymentMethod: "terminal",
          acceptedOfferId: inquiryRef.id,
        }),
      ).rejects.toMatchObject({ code: "offer_unavailable" });
    });
  },
);
