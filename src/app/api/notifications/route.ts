import type { NextRequest } from "next/server";
import { requireApiAccount } from "@/lib/api-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import {
  listCustomerNotifications,
  markCustomerNotificationRead,
} from "@/lib/side-feature-store";
import { notificationReadSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { services, account } = await requireApiAccount();
    const notifications = await listCustomerNotifications(
      services.db,
      account.id,
    );
    return Response.json(
      { notifications },
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
    const parsed = notificationReadSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Benachrichtigungs-ID ist ungültig." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "notification-read",
      account.id,
      120,
      60 * 60_000,
    );
    await markCustomerNotificationRead(
      services.db,
      account.id,
      parsed.data.notificationId,
    );
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
