import "server-only";

import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return Response.json(
      { message: error.message, code: error.code },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { message: "Der Vorgang ist fehlgeschlagen. Bitte versuche es erneut." },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );
}

export function requireSameOrigin(request: NextRequest) {
  const originHeader = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site" || !originHeader) {
    throw new HttpError(
      "Die Anfrage wurde aus Sicherheitsgründen abgelehnt.",
      403,
      "origin",
    );
  }

  let expectedOrigin: string;
  try {
    expectedOrigin = process.env.APP_ORIGIN
      ? new URL(process.env.APP_ORIGIN).origin
      : process.env.NODE_ENV === "production"
        ? ""
        : new URL(request.url).origin;
  } catch {
    expectedOrigin = "";
  }

  let receivedOrigin = "";
  try {
    receivedOrigin = new URL(originHeader).origin;
  } catch {
    receivedOrigin = "";
  }
  if (!expectedOrigin || receivedOrigin !== expectedOrigin) {
    throw new HttpError(
      "Die Anfrage wurde aus Sicherheitsgründen abgelehnt.",
      403,
      "origin",
    );
  }
}

export async function readJson(request: Request) {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/json")
  ) {
    throw new HttpError("Ungültiges Anfrageformat.", 415, "content_type");
  }

  try {
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > 16_384) {
      throw new HttpError("Die Anfrage ist zu groß.", 413, "body_too_large");
    }
    const reader = request.body?.getReader();
    if (!reader)
      throw new HttpError(
        "Die Eingabe konnte nicht gelesen werden.",
        400,
        "invalid_json",
      );
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > 16_384) {
        await reader.cancel();
        throw new HttpError("Die Anfrage ist zu groß.", 413, "body_too_large");
      }
      chunks.push(value);
    }
    const body = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(body)) as unknown;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      "Die Eingabe konnte nicht gelesen werden.",
      400,
      "invalid_json",
    );
  }
}

export function requestIpKey(request: NextRequest) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function privateDocumentKey(namespace: string, value: string) {
  const secret = process.env.APP_SECRET;
  if (!secret || secret.length < 32) {
    throw new HttpError(
      "Die sichere Anwendungskonfiguration fehlt.",
      503,
      "not_configured",
    );
  }
  return createHmac("sha256", secret)
    .update(`${namespace}\0${value}`)
    .digest("hex");
}
