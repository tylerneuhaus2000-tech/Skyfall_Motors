import type { NextRequest } from "next/server";
import { requireApiPermission } from "@/lib/api-auth";
import { applyOrderAction } from "@/lib/order-store";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import { adminOrderActionSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiPermission("orders");
    const parsed = adminOrderActionSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Bestellaktion ist ungültig." },
        { status: 400 },
      );
    }
    await applyOrderAction(services.db, account, parsed.data);
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
