import type { NextRequest } from "next/server";
import { requireApiPermission } from "@/lib/api-auth";
import { verifyCustomerIdentity } from "@/lib/order-store";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import { verifyCustomerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiPermission("customers");
    const parsed = verifyCustomerSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Kundenkonto ist ungültig." },
        { status: 400 },
      );
    }
    await verifyCustomerIdentity(services.db, account, parsed.data.userId);
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
