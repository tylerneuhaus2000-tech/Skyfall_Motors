import type { NextRequest } from "next/server";
import { requireApiAccount } from "@/lib/api-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import {
  createTestDriveRequest,
  listCustomerTestDriveRequests,
} from "@/lib/side-feature-store";
import { testDriveRequestSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { services, account } = await requireApiAccount();
    const requests = await listCustomerTestDriveRequests(
      services.db,
      account.id,
    );
    return Response.json(
      { requests },
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
    const parsed = testDriveRequestSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Testfahrtangaben sind ungültig." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "test-drive",
      account.id,
      3,
      60 * 60_000,
    );
    const result = await createTestDriveRequest(
      services.db,
      account,
      parsed.data,
    );
    return Response.json(result, {
      status: 201,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
