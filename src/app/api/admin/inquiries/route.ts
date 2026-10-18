import type { NextRequest } from "next/server";
import { requireApiPermission } from "@/lib/api-auth";
import { updateCustomerInquiry } from "@/lib/inquiry-store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import { adminInquiryUpdateSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiPermission("inquiries");
    const parsed = adminInquiryUpdateSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Anfrageänderung ist ungültig." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "admin-inquiry-update",
      account.id,
      60,
      60 * 60_000,
    );
    await updateCustomerInquiry(services.db, account, parsed.data);
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
