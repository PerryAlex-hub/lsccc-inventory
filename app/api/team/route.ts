import { authenticated, endpoint, jsonBody, reply } from "@/app/lib/server/http";
import { createInvitation, readTeam, updateTeam } from "@/app/lib/server/team";
import { database } from "@/app/lib/server/db";
import { rateLimit, roleValue } from "@/app/lib/server/accounts";
import { digest, emailAddress } from "@/app/lib/server/security";
import { mailConfigured, sendAccountEmail } from "@/app/lib/server/mail";

export async function GET() {
  return endpoint(async () =>
    reply(await authenticated((db) => readTeam(db), { admin: true })),
  );
}

export async function POST(request: Request) {
  return endpoint(async () => {
    const body = await jsonBody(request);
    const invitation = await authenticated(
      async (db, member) => {
        mailConfigured();
        await rateLimit(db, `invite:${member.id}`, 30, 3600);
        return createInvitation(
          db,
          emailAddress(body.email),
          roleValue(body.role),
          member.id,
        );
      },
      { admin: true, write: true },
    );
    const delivered = await deliver(invitation);
    return reply({
      ok: true,
      mailDelivery: delivered ? "sent" : "failed",
      ...(await authenticated((db) => readTeam(db), { admin: true })),
    });
  });
}

export async function PATCH(request: Request) {
  return endpoint(async () => {
    const body = await jsonBody(request);
    const invitation = await authenticated(
      async (db, member) => {
        if (body.action === "resend") {
          mailConfigured();
          await rateLimit(db, `resend:${member.id}`, 30, 3600);
        }
        return updateTeam(db, member, body);
      },
      { admin: true, write: true },
    );
    const delivered = invitation ? await deliver(invitation) : null;
    return reply({
      ok: true,
      ...(delivered === null ? {} : { mailDelivery: delivered ? "sent" : "failed" }),
      ...(await authenticated((db) => readTeam(db), { admin: true })),
    });
  });
}

async function deliver(invitation: { id: string; email: string; rawToken: string }) {
  try {
    await sendAccountEmail(invitation.email, invitation.rawToken, true);
    await database().invitation.updateMany({
      where: {
        id: invitation.id,
        tokenHash: digest(invitation.rawToken),
        consumedAt: null,
      },
      data: { deliveryStatus: "sent" },
    });
    return true;
  } catch {
    await database().invitation.updateMany({
      where: {
        id: invitation.id,
        tokenHash: digest(invitation.rawToken),
        consumedAt: null,
      },
      data: { deliveryStatus: "failed" },
    });
    return false;
    // The list exposes delivery failure and allows a fresh link to be sent.
  }
}
