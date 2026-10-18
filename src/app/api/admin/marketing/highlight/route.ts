import type { NextRequest } from "next/server";
import { requireApiOwner } from "@/lib/api-auth";
import { setHomepageHighlight } from "@/lib/order-store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import { homepageHighlightSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiOwner();
    const parsed = homepageHighlightSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Startseiten-Highlight ist ungültig." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "homepage-highlight",
      account.id,
      30,
      60 * 60_000,
    );
    await setHomepageHighlight(services.db, account, parsed.data);
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
