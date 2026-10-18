import type { NextRequest } from "next/server";
import { requireApiAccount } from "@/lib/api-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import {
  changeVehicleWaitlist,
  listCustomerVehicleWaitlist,
} from "@/lib/side-feature-store";
import { vehicleWaitlistSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { services, account } = await requireApiAccount();
    const entries = await listCustomerVehicleWaitlist(services.db, account.id);
    return Response.json(
      { entries },
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
    const parsed = vehicleWaitlistSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Wartelistenangabe ist ungültig." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "vehicle-waitlist",
      account.id,
      10,
      60 * 60_000,
    );
    const result = await changeVehicleWaitlist(
      services.db,
      account,
      parsed.data,
    );
    return Response.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
