import "server-only";
import type { Database } from "./db";
import { lockWorkspace } from "./db";
import type { Member, TeamRole } from "../access";
import {
  ApiError,
  digest,
  hashPassword,
  token,
  tokenHash,
  verifyPassword,
} from "./security";

export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-lsccc-session" : "lsccc-session";
export const SESSION_SECONDS = 60 * 60 * 12;
export const memberSelection = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
} as const;

export function roleValue(value: unknown): TeamRole {
  if (value !== "Administrator" && value !== "Inventory officer")
    throw new ApiError(400, "Choose a valid role.");
  return value;
}

export function toMember(user: Omit<Member, "role"> & { role: string }): Member {
  return { ...user, role: roleValue(user.role) };
}

export async function currentMember(
  db: Database,
  session?: string,
): Promise<Member | null> {
  if (!session || !/^[\w-]{43}$/.test(session)) return null;
  const record = await db.session.findUnique({
    where: { tokenHash: digest(session) },
    select: { expiresAt: true, user: { select: memberSelection } },
  });
  if (!record || record.expiresAt <= new Date() || !record.user.active) return null;
  return toMember(record.user);
}

export async function requireMember(db: Database, session?: string, admin = false) {
  const member = await currentMember(db, session);
  if (!member) throw new ApiError(401, "Your session has expired. Sign in again.");
  if (admin && member.role !== "Administrator")
    throw new ApiError(403, "Only administrators can manage team access.");
  return member;
}

export async function audit(
  db: Database,
  actorId: string | null,
  action: string,
  recordId?: string,
) {
  const actor = actorId
    ? await db.user.findUnique({ where: { id: actorId }, select: { name: true } })
    : null;
  await db.auditEvent.create({
    data: { actorId, actorName: actor?.name ?? null, action, recordId: recordId || null },
  });
}

export async function rateLimit(
  db: Database,
  key: string,
  limit: number,
  seconds: number,
) {
  const hashed = digest(key);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + seconds * 1000);
  // The conditional reset and atomic increment are safe across independent requests.
  await db.rateLimit.updateMany({
    where: { key: hashed, expiresAt: { lte: now } },
    data: { attempts: 0, expiresAt },
  });
  const record = await db.rateLimit.upsert({
    where: { key: hashed },
    create: { key: hashed, attempts: 1, expiresAt },
    update: { attempts: { increment: 1 } },
  });
  if (record.attempts > limit)
    throw new ApiError(429, "Too many attempts. Please try again later.");
}

export async function signIn(db: Database, email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  const valid = await verifyPassword(password, user?.passwordHash);
  if (!user?.active || !valid)
    throw new ApiError(401, "The email or password is incorrect.");
  const session = token();
  const now = new Date();
  await db.session.deleteMany({ where: { userId: user.id, expiresAt: { lte: now } } });
  await db.session.create({
    data: {
      tokenHash: digest(session),
      userId: user.id,
      expiresAt: new Date(now.getTime() + SESSION_SECONDS * 1000),
    },
  });
  await audit(db, user.id, "auth.sign-in");
  return session;
}

export async function acceptInvitation(
  db: Database,
  rawToken: unknown,
  email: string,
  name: string,
  password: string,
) {
  const hashed = tokenHash(rawToken);
  await lockWorkspace(db);
  const invitation = await db.invitation.findFirst({
    where: { tokenHash: hashed, email, consumedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!invitation) throw new ApiError(410, "This invitation is invalid or has expired.");
  if (await db.user.findUnique({ where: { email }, select: { id: true } }))
    throw new ApiError(409, "An account already exists. Sign in or reset your password.");
  const consumed = await db.invitation.updateMany({
    where: {
      id: invitation.id,
      tokenHash: hashed,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { consumedAt: new Date() },
  });
  if (!consumed.count)
    throw new ApiError(410, "This invitation is invalid or has expired.");
  const user = await db.user.create({
    data: {
      email,
      name,
      role: roleValue(invitation.role),
      passwordHash: await hashPassword(password),
    },
  });
  await audit(db, user.id, "auth.accept-invitation", invitation.id);
}

export async function resetPassword(db: Database, rawToken: unknown, password: string) {
  const hashed = tokenHash(rawToken);
  const reset = await db.passwordReset.findUnique({
    where: { tokenHash: hashed },
    include: { user: { select: { active: true } } },
  });
  if (!reset || reset.expiresAt <= new Date() || !reset.user.active)
    throw new ApiError(410, "This reset link is invalid or has expired.");
  const consumed = await db.passwordReset.deleteMany({
    where: { tokenHash: hashed, expiresAt: { gt: new Date() } },
  });
  if (!consumed.count) throw new ApiError(410, "This reset link has already been used.");
  const updated = await db.user.updateMany({
    where: { id: reset.userId, active: true },
    data: { passwordHash: await hashPassword(password) },
  });
  if (!updated.count)
    throw new ApiError(410, "This reset link is invalid or has expired.");
  await db.session.deleteMany({ where: { userId: reset.userId } });
  await db.passwordReset.deleteMany({ where: { userId: reset.userId } });
  await audit(db, reset.userId, "auth.reset-password");
}
