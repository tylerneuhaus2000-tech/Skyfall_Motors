import type { NextRequest } from "next/server";
import { requireApiOwner, requireApiPermission } from "@/lib/api-auth";
import { toCsv } from "@/lib/csv";
import { listAdminInventory, listAdminOrders } from "@/lib/order-store";
import { errorResponse, HttpError } from "@/lib/security";

function csvResponse(filename: string, content: string) {
  return new Response(`\uFEFF${content}`, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site") {
      throw new HttpError("Anfrage abgelehnt.", 403, "origin");
    }
    const origin = request.headers.get("origin");
    if (origin) {
      let sameOrigin = false;
      try {
        sameOrigin = new URL(origin).origin === new URL(request.url).origin;
      } catch {
        sameOrigin = false;
      }
      if (!sameOrigin) throw new HttpError("Anfrage abgelehnt.", 403, "origin");
    }
    const type = request.nextUrl.searchParams.get("type");
    if (type === "orders") {
      const { services } = await requireApiPermission("orders");
      const orders = await listAdminOrders(services.db);
      return csvResponse(
        "skyfall-bestellungen.csv",
        toCsv(
          [
            "Bestellnummer",
            "Minecraft-Name",
            "Fahrzeug",
            "Fahrzeugpreis 💎",
            "Lieferung 💎",
            "Express 💎",
            "Gesamt 💎",
            "Bestellstatus",
            "Zahlungsstatus",
            "Zahlungsart",
            "Übergabeart",
            "Erstellt am",
            "Bezahlt am",
            "Übergeben am",
          ],
          orders.map((order) => [
            order.orderNumber,
            order.minecraftUsername,
            order.vehicleName,
            order.unitPrice,
            order.deliveryPrice,
            order.expressPrice,
            order.totalPrice,
            order.status,
            order.paymentStatus,
            order.paymentMethod,
            order.handover,
            new Date(order.createdAt).toISOString(),
            order.paidAt ? new Date(order.paidAt).toISOString() : "",
            order.handedOverAt
              ? new Date(order.handedOverAt).toISOString()
              : "",
          ]),
        ),
      );
    }

    if (type === "revenue") {
      const { services } = await requireApiOwner();
      const orders = await listAdminOrders(services.db);
      const sales = orders.filter(
        (order) =>
          order.paymentStatus === "paid" &&
          order.status === "delivered" &&
          typeof order.handedOverAt === "number" &&
          order.handedOverAt > 0,
      );
      return csvResponse(
        "skyfall-uebergebene-umsaetze.csv",
        toCsv(
          ["Bestellnummer", "Kunde", "Fahrzeug", "Diamanten", "Übergeben am"],
          sales.map((order) => [
            order.orderNumber,
            order.minecraftUsername,
            order.vehicleName,
            order.totalPrice,
            new Date(order.handedOverAt as number).toISOString(),
          ]),
        ),
      );
    }

    if (type === "inventory") {
      const { services } = await requireApiPermission("inventory");
      const inventory = await listAdminInventory(services.db);
      return csvResponse(
        "skyfall-fahrzeugbestaende.csv",
        toCsv(
          [
            "Fahrzeug-ID",
            "Hersteller",
            "Modell",
            "Content-Pack",
            "Klasse",
            "Preis 💎",
            "Bestand",
            "Bestandsdaten erfasst",
            "Reserviert",
            "Freigegeben",
            "Serverinstallation bestätigt",
            "Bestellbar",
          ],
          inventory.map((item) => [
            item.vehicleId,
            item.manufacturer,
            item.vehicleName,
            item.packName,
            item.vehicleClass,
            item.priceDiamonds,
            item.availableUnits,
            item.inventoryConfigured,
            item.reservedUnits,
            item.approved,
            item.serverInstallationConfirmed,
            item.canOrder,
          ]),
        ),
      );
    }

    throw new HttpError("Exporttyp ist ungültig.", 400, "invalid_export");
  } catch (error) {
    return errorResponse(error);
  }
}
