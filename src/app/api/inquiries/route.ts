import type { NextRequest } from "next/server";
import { requireApiAccount } from "@/lib/api-auth";
import {
  createCustomerInquiry,
  listCustomerInquiries,
} from "@/lib/inquiry-store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import { customerInquirySchema } from "@/lib/validation";

export async function GET() {
  try {
    const { services, account } = await requireApiAccount();
    const inquiries = await listCustomerInquiries(services.db, account.id);
    return Response.json(
      { inquiries },
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
    const parsed = customerInquirySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Betreff oder Nachricht ist ungültig." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "customer-inquiry",
      account.id,
      5,
      60 * 60_000,
    );
    await createCustomerInquiry(services.db, account, parsed.data);
    return Response.json(
      { ok: true },
      { status: 201, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
