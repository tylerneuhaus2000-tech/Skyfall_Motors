import type { NextRequest } from "next/server";
import type { AdminActivityView } from "@/lib/admin-activity";
import { requireApiPermission } from "@/lib/api-auth";
import { errorResponse, HttpError } from "@/lib/security";

function millis(value: unknown) {
  if (value && typeof value === "object" && "toMillis" in value) {
    const toMillis = value.toMillis;
    if (typeof toMillis === "function") return toMillis.call(value);
  }
  return typeof value === "number" ? value : 0;
}

export async function GET(request: NextRequest) {
  try {
    const fetchSite = request.headers.get("sec-fetch-site");
    const origin = request.headers.get("origin");
    if (fetchSite === "cross-site") {
      throw new HttpError("Anfrage abgelehnt.", 403, "origin");
    }
    if (origin) {
      let sameOrigin = false;
      try {
        sameOrigin = new URL(origin).origin === new URL(request.url).origin;
      } catch {
        sameOrigin = false;
      }
      if (!sameOrigin) throw new HttpError("Anfrage abgelehnt.", 403, "origin");
    }

    const { services, account } = await requireApiPermission("audit");
    const query = services.db
      .collection("auditLogs")
      .orderBy("createdAt", "desc")
      .limit(20);
    const encoder = new TextEncoder();
    let unsubscribeAudit: (() => void) | undefined;
    let unsubscribeAccount: (() => void) | undefined;
    let leaseTimer: ReturnType<typeof setTimeout> | undefined;
    let closeStream: (() => void) | undefined;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let closed = false;
        const close = () => {
          if (closed) return;
          closed = true;
          unsubscribeAudit?.();
          unsubscribeAccount?.();
          if (leaseTimer) clearTimeout(leaseTimer);
          try {
            controller.close();
          } catch {
            // The browser may have closed the stream first.
          }
        };
        closeStream = close;
        request.signal.addEventListener("abort", close, { once: true });
        unsubscribeAccount = services.db
          .collection("users")
          .doc(account.id)
          .onSnapshot((snapshot) => {
            if (
              !snapshot.exists ||
              snapshot.get("accountStatus") !== "active" ||
              snapshot.get("role") !== "owner"
            ) {
              close();
            }
          }, close);
        unsubscribeAudit = query.onSnapshot(
          (snapshot) => {
            if (closed) return;
            const activities: AdminActivityView[] = snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                actorId: String(doc.get("actorId") ?? ""),
                action: String(doc.get("action") ?? "administrative_action"),
                targetId: String(doc.get("targetId") ?? ""),
                createdAt: millis(doc.get("createdAt")),
              }),
            );
            try {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(activities)}\n\n`),
              );
            } catch {
              close();
            }
          },
          () => {
            if (closed) return;
            try {
              controller.enqueue(
                encoder.encode("event: stream-error\ndata: {}\n\n"),
              );
            } catch {
              // Ignore writes after the browser has disconnected.
            }
            close();
          },
        );
        leaseTimer = setTimeout(close, 15 * 60_000);
        if (request.signal.aborted) close();
      },
      cancel() {
        closeStream?.();
      },
    });
    return new Response(stream, {
      headers: {
        "Cache-Control": "private, no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "Content-Type": "text/event-stream; charset=utf-8",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
