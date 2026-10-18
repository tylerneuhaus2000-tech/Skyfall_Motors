import type { NextRequest } from "next/server";
import { requireApiOwner } from "@/lib/api-auth";
import { updateStaffRole } from "@/lib/order-store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import { staffRoleUpdateSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { services, account } = await requireApiOwner();
    const parsed = staffRoleUpdateSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Mitarbeiterrolle ist ungültig." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "staff-role-update",
      account.id,
      20,
      60 * 60_000,
    );
    const result = await updateStaffRole(services.db, account, parsed.data);
    return Response.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
