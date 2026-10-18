import type { NextRequest } from "next/server";
import { requireApiAccount } from "@/lib/api-auth";
import { getFirebaseServices } from "@/lib/firebase-admin";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import { createLapEntry, listPublicLapEntries } from "@/lib/side-feature-store";
import { lapEntrySchema } from "@/lib/validation";

export async function GET() {
  try {
    const services = getFirebaseServices();
    if (!services)
      return Response.json(
        { entries: [] },
        { headers: { "Cache-Control": "public, max-age=30" } },
      );
    const entries = await listPublicLapEntries(services.db);
    return Response.json(
      { entries },
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
    const parsed = lapEntrySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Rundenzeit muss zwischen 0,1 und 3.600 Sekunden liegen." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "lap-entry",
      account.id,
      5,
      60 * 60_000,
    );
    const result = await createLapEntry(services.db, account, parsed.data);
    return Response.json(result, {
      status: 201,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
