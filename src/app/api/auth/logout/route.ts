import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/account";
import { errorResponse, requireSameOrigin } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
