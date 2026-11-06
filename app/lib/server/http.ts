import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, requireSameOrigin } from "./security";
import { lockWorkspace, transaction, type Database } from "./db";
import { requireMember, SESSION_COOKIE } from "./accounts";
import type { Member } from "../access";

export async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  requireSameOrigin(request);
  if (Number(request.headers.get("content-length")) > 20000)
    throw new ApiError(413, "This request is too large.");
  // Bound the stream too; chunked requests need the same limit as Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Request data is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 20000) {
      await reader.cancel();
      throw new ApiError(413, "This request is too large.");
    }
    chunks.push(value);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "Send valid JSON data.");
  }
}

export async function authenticated<T>(
  work: (db: Database, member: Member) => Promise<T>,
  options: { admin?: boolean; write?: boolean } = {},
) {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  return transaction(async (db) => {
    if (options.write) await lockWorkspace(db);
    const member = await requireMember(db, session, options.admin);
    return work(db, member);
  });
}

export function reply(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function endpoint(work: () => Promise<Response>): Promise<Response> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof ApiError) {
      const response = reply({ ok: false, message: error.message }, error.status);
      if (error.status === 429) response.headers.set("Retry-After", "900");
      return response;
    }
    // Keep diagnostic types/codes, but never log database messages or query arguments.
    const code =
      error && typeof error === "object" && "code" in error ? error.code : undefined;
    console.error(
      "A backend request failed.",
      JSON.stringify({
        type: error instanceof Error ? error.name : "UnknownError",
        code:
          typeof code === "string" && /^[A-Z0-9_]{1,40}$/.test(code) ? code : undefined,
        argument:
          error instanceof Error && error.name === "PrismaClientValidationError"
            ? error.message.match(/Unknown argument `([A-Za-z][A-Za-z0-9_]{0,63})`/)?.[1]
            : undefined,
      }),
    );
    return reply(
      { ok: false, message: "The service is temporarily unavailable. Please try again." },
      503,
    );
  }
}
