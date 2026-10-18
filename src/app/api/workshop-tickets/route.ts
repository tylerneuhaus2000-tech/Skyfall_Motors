import type { NextRequest } from "next/server";
import { requireApiAccount } from "@/lib/api-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { errorResponse, readJson, requireSameOrigin } from "@/lib/security";
import {
  createWorkshopTicket,
  listCustomerWorkshopTickets,
} from "@/lib/side-feature-store";
import { workshopTicketSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { services, account } = await requireApiAccount();
    const tickets = await listCustomerWorkshopTickets(services.db, account.id);
    return Response.json(
      { tickets },
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
    const parsed = workshopTicketSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return Response.json(
        { message: "Werkstattangabe ist ungültig." },
        { status: 400 },
      );
    }
    await enforceRateLimit(
      services.db,
      "workshop-ticket",
      account.id,
      3,
      60 * 60_000,
    );
    const result = await createWorkshopTicket(
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
