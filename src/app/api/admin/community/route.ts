import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  type AdminPermission,
  hasAdminPermission,
} from "@/lib/admin-permissions";
import { requireApiAccount } from "@/lib/api-auth";
import {
  errorResponse,
  HttpError,
  readJson,
  requireSameOrigin,
} from "@/lib/security";
import {
  applyTestDriveAction,
  markVehicleWaitlistContacted,
  moderateLapEntry,
  moderateVehicleReview,
  setWorkshopTicketStatus,
} from "@/lib/side-feature-store";
import {
  lapModerationSchema,
  reviewModerationSchema,
  testDriveAdminActionSchema,
  waitlistModerationSchema,
  workshopTicketAdminActionSchema,
} from "@/lib/validation";

const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("test_drive"), data: testDriveAdminActionSchema }),
  z.object({ type: z.literal("lap"), data: lapModerationSchema }),
  z.object({ type: z.literal("review"), data: reviewModerationSchema }),
  z.object({ type: z.literal("waitlist"), data: waitlistModerationSchema }),
  z.object({
    type: z.literal("workshop_ticket"),
    data: workshopTicketAdminActionSchema,
  }),
]);

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiAccount();
    const parsed = actionSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Moderationsaktion ist ungültig." },
        { status: 400 },
      );
    }
    const { type, data } = parsed.data;
    const permission: AdminPermission =
      type === "test_drive"
        ? "test_drives"
        : type === "lap"
          ? "races"
          : type === "review"
            ? "reviews"
            : type === "waitlist"
              ? "waitlist"
              : "workshop";
    if (!hasAdminPermission(account.role, account.staffRole, permission)) {
      throw new HttpError(
        "Für diese Moderationsaktion fehlen die erforderlichen Rechte.",
        403,
        "forbidden",
      );
    }
    if (type === "test_drive") {
      await applyTestDriveAction(services.db, account, data);
    } else if (type === "lap") {
      await moderateLapEntry(services.db, account, data);
    } else if (type === "review") {
      await moderateVehicleReview(services.db, account, data);
    } else if (type === "waitlist") {
      await markVehicleWaitlistContacted(services.db, account, data);
    } else {
      await setWorkshopTicketStatus(services.db, account, data);
    }
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
