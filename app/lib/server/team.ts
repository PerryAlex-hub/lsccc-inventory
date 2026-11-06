import "server-only";
import type { Database } from "./db";
import type { Member, TeamRole } from "../access";
import { ApiError, digest, token } from "./security";
import { audit, memberSelection, roleValue, toMember } from "./accounts";

export async function readTeam(db: Database) {
  const members = await db.user.findMany({
    select: memberSelection,
    orderBy: { createdAt: "asc" },
  });
  const invitations = await db.invitation.findMany({
    where: { consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      expiresAt: true,
      deliveryStatus: true,
    },
  });
  return { members: members.map(toMember), invitations };
}

export async function createInvitation(
  db: Database,
  email: string,
  role: TeamRole,
  actorId: string | null,
) {
  if (await db.user.findUnique({ where: { email }, select: { id: true } }))
    throw new ApiError(
      409,
      "This person already has an account. Manage their access below.",
    );
  await db.invitation.updateMany({
    where: { email, consumedAt: null, expiresAt: { lte: new Date() } },
    data: { consumedAt: new Date() },
  });
  if (
    await db.invitation.findFirst({
      where: { email, consumedAt: null },
      select: { id: true },
    })
  )
    throw new ApiError(
      409,
      "An invitation already exists. Resend it from the team list.",
    );
  const rawToken = token();
  const invitation = await db.invitation.create({
    data: {
      email,
      role,
      tokenHash: digest(rawToken),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });
  await audit(db, actorId, "team.invite", invitation.id);
  return { id: invitation.id, email, rawToken };
}

export async function updateTeam(
  db: Database,
  actor: Member,
  body: Record<string, unknown>,
) {
  if (actor.role !== "Administrator")
    throw new ApiError(403, "Only administrators can manage team access.");
  if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id))
    throw new ApiError(400, "Select a team record.");
  if (body.target === "invitation") {
    const invitation = await db.invitation.findFirst({
      where: { id: body.id, consumedAt: null },
    });
    if (!invitation) throw new ApiError(404, "This invitation is no longer pending.");
    if (body.action === "cancel")
      await db.invitation.update({
        where: { id: body.id },
        data: { consumedAt: new Date() },
      });
    else if (body.action === "role")
      await db.invitation.update({
        where: { id: body.id },
        data: { role: roleValue(body.role) },
      });
    else if (body.action === "resend") {
      const rawToken = token();
      await db.invitation.update({
        where: { id: body.id },
        data: {
          tokenHash: digest(rawToken),
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
          deliveryStatus: "pending",
        },
      });
      await audit(db, actor.id, "team.resend", body.id);
      return { id: body.id, email: invitation.email, rawToken };
    } else throw new ApiError(400, "Choose a valid invitation action.");
  } else if (body.target === "member") {
    const member = await db.user.findUnique({
      where: { id: body.id },
      select: memberSelection,
    });
    if (!member) throw new ApiError(404, "This account could not be found.");
    const role = body.action === "role" ? roleValue(body.role) : member.role;
    const active =
      body.action === "disable" ? false : body.action === "enable" ? true : member.active;
    if (!["role", "disable", "enable", "delete"].includes(String(body.action)))
      throw new ApiError(400, "Choose a valid account action.");
    if (
      member.active &&
      member.role === "Administrator" &&
      (!active || role !== "Administrator" || body.action === "delete")
    ) {
      if ((await db.user.count({ where: { active: true, role: "Administrator" } })) <= 1)
        throw new ApiError(
          409,
          "Keep at least one active administrator. Invite or promote another person first.",
        );
    }
    if (
      member.id === actor.id &&
      (!active || role !== "Administrator" || body.action === "delete")
    )
      throw new ApiError(409, "Ask another administrator to change your access.");
    if (body.action === "delete") {
      if (member.active)
        throw new ApiError(
          409,
          "Revoke this user's access before deleting their account.",
        );
      if (
        typeof body.confirmEmail !== "string" ||
        body.confirmEmail.trim().toLowerCase() !== member.email
      )
        throw new ApiError(
          400,
          "Type the user's email address to confirm account deletion.",
        );
      // Keep attribution and durable stock request keys when the account is removed.
      await db.auditEvent.updateMany({
        where: { actorId: member.id, actorName: null },
        data: { actorName: member.name },
      });
      await db.invitation.updateMany({
        where: { email: member.email, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      await audit(db, actor.id, "team.member.delete", member.id);
      await db.user.delete({ where: { id: member.id } });
      return null;
    }
    await db.user.update({ where: { id: member.id }, data: { role, active } });
    if (!active) {
      await db.session.deleteMany({ where: { userId: member.id } });
      await db.passwordReset.deleteMany({ where: { userId: member.id } });
    }
  } else throw new ApiError(400, "Select an invitation or account.");
  await audit(db, actor.id, `team.${body.target}.${body.action}`, body.id);
  return null;
}

export async function createReset(db: Database, email: string) {
  const user = await db.user.findFirst({
    where: { email, active: true },
    select: { id: true },
  });
  if (!user) return null;
  const rawToken = token();
  await db.passwordReset.deleteMany({ where: { userId: user.id } });
  await db.passwordReset.create({
    data: {
      tokenHash: digest(rawToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
  return rawToken;
}
