import type { NextRequest } from "next/server";
import { requireApiAccount } from "@/lib/api-auth";
import { getFirebaseServices } from "@/lib/firebase-admin";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import {
  createVehicleReview,
  listPublicVehicleReviews,
} from "@/lib/side-feature-store";
import { customerReviewSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const vehicleId = request.nextUrl.searchParams.get("vehicleId") ?? "";
    const services = getFirebaseServices();
    if (!services)
      return Response.json(
        { reviews: [] },
        { headers: { "Cache-Control": "public, max-age=30" } },
      );
    const reviews = await listPublicVehicleReviews(services.db, vehicleId);
    return Response.json(
      { reviews },
      { headers: { "Cache-Control": "public, max-age=30" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiAccount();
    const parsed = customerReviewSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Bewertung ist ungültig." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "vehicle-review",
      account.id,
      3,
      60 * 60_000,
    );
    const result = await createVehicleReview(services.db, account, parsed.data);
    return Response.json(result, {
      status: 201,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
