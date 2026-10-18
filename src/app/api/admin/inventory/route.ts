import type { NextRequest } from "next/server";
import { requireApiPermission } from "@/lib/api-auth";
import { pauseInventorySales, updateInventory } from "@/lib/order-store";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import {
  inventoryBulkActionSchema,
  inventoryUpdateSchema,
} from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiPermission("inventory");
    const parsed = inventoryUpdateSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Freigabe oder Lagerbestand ist ungültig." },
        { status: 400 },
      );
    }
    await updateInventory(services.db, account, parsed.data);
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiPermission("inventory");
    const parsed = inventoryBulkActionSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Ausgewählte Fahrzeuge sind ungültig." },
        { status: 400 },
      );
    }
    await pauseInventorySales(services.db, account, parsed.data.vehicleIds);
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
