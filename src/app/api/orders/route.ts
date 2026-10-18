import type { NextRequest } from "next/server";
import { requireApiAccount } from "@/lib/api-auth";
import { createOrder, listOrdersForCustomer } from "@/lib/order-store";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import { createOrderSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { services, account } = await requireApiAccount();
    const orders = await listOrdersForCustomer(services.db, account.id);
    return Response.json(
      { orders },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiAccount();
    const parsed = createOrderSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        {
          message: parsed.error.issues[0]?.message ?? "Bestellangaben prüfen.",
        },
        { status: 400 },
      );
    }
    const result = await createOrder(services.db, account, parsed.data);
    return Response.json(result, {
      status: result.reused ? 200 : 201,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
