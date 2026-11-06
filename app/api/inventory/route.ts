import { authenticated, endpoint, jsonBody, reply } from "@/app/lib/server/http";
import { mutateInventory, readInventory } from "@/app/lib/server/inventory";

export async function GET() {
  return endpoint(async () =>
    reply(
      await authenticated(async (db, user) => ({ state: await readInventory(db), user })),
    ),
  );
}

export async function POST(request: Request) {
  return endpoint(async () => {
    const body = await jsonBody(request);
    const state = await authenticated(
      (db, member) =>
        mutateInventory(db, member, body, request.headers.get("Idempotency-Key")),
      { write: true },
    );
    return reply({ ok: true, state });
  });
}
