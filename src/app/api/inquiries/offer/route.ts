import type { NextRequest } from "next/server";
import { requireApiAccount } from "@/lib/api-auth";
import { declineCustomerOffer } from "@/lib/inquiry-store";
import { createOrder } from "@/lib/order-store";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import { customerOfferResponseSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiAccount();
    const parsed = customerOfferResponseSchema.safeParse(
      await readJson(request),
    );
    if (!parsed.success)
      return Response.json(
        { message: "Angebotsantwort ist ungültig." },
        { status: 400 },
      );
    if (parsed.data.action === "decline") {
      await declineCustomerOffer(
        services.db,
        account.id,
        parsed.data.inquiryId,
      );
      return Response.json(
        { ok: true },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }
    const inquiry = await services.db
      .collection("customerInquiries")
      .doc(parsed.data.inquiryId)
      .get();
    if (
      !inquiry.exists ||
      inquiry.get("customerId") !== account.id ||
      inquiry.get("offerStatus") !== "offered"
    ) {
      return Response.json(
        { message: "Dieses Angebot ist nicht mehr gültig." },
        { status: 409 },
      );
    }
    const vehicleId = inquiry.get("vehicleId");
    if (typeof vehicleId !== "string")
      return Response.json(
        { message: "Zum Angebot fehlt ein Fahrzeug." },
        { status: 409 },
      );
    const result = await createOrder(services.db, account, {
      vehicleId,
      idempotencyKey: parsed.data.idempotencyKey,
      handover: "pickup",
      express: false,
      paymentMethod: "terminal",
      acceptedOfferId: parsed.data.inquiryId,
    });
    return Response.json(result, {
      status: result.reused ? 200 : 201,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
