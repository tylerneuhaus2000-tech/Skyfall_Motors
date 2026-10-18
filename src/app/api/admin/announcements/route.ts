import type { NextRequest } from "next/server";
import { saveAnnouncement } from "@/lib/announcement-store";
import { requireApiOwner } from "@/lib/api-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import { announcementMutationSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiOwner();
    const parsed = announcementMutationSchema.safeParse(
      await readJson(request),
    );
    if (!parsed.success) {
      return Response.json(
        { message: "Ankündigung ist ungültig." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "announcement-update",
      account.id,
      60,
      60 * 60_000,
    );
    await saveAnnouncement(services.db, account, parsed.data);
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
