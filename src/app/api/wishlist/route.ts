import type { NextRequest } from "next/server";
import { requireApiAccount } from "@/lib/api-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import { listWishlist, setWishlistItem } from "@/lib/side-feature-store";
import { wishlistActionSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { services, account } = await requireApiAccount();
    const vehicleIds = await listWishlist(services.db, account.id);
    return Response.json(
      { vehicleIds },
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
    const parsed = wishlistActionSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Wunschlisteingabe ist ungültig." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "wishlist-change",
      account.id,
      60,
      60 * 60_000,
    );
    const result = await setWishlistItem(services.db, account, parsed.data);
    return Response.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
