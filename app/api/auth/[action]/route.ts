import { cookies } from "next/headers";
import { endpoint, jsonBody, reply } from "@/app/lib/server/http";
import { database, transaction } from "@/app/lib/server/db";
import {
  acceptInvitation,
  rateLimit,
  resetPassword,
  SESSION_COOKIE,
  SESSION_SECONDS,
  signIn,
} from "@/app/lib/server/accounts";
import {
  ApiError,
  digest,
  emailAddress,
  passwordValue,
  text,
} from "@/app/lib/server/security";
import { createReset } from "@/app/lib/server/team";
import { mailConfigured, sendAccountEmail } from "@/app/lib/server/mail";

export async function POST(
  request: Request,
  context: RouteContext<"/api/auth/[action]">,
) {
  return endpoint(async () => {
    const { action } = await context.params;
    if (
      ![
        "sign-in",
        "sign-out",
        "forgot-password",
        "reset-password",
        "accept-invitation",
      ].includes(action)
    )
      throw new ApiError(404, "This action is unavailable.");
    const body = await jsonBody(request);
    const cookieStore = await cookies();
    if (action === "sign-out") {
      const session = cookieStore.get(SESSION_COOKIE)?.value;
      if (session)
        await database().session.deleteMany({ where: { tokenHash: digest(session) } });
      cookieStore.set(SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      });
      return reply({ ok: true });
    }
    // Vercel sets this trusted header. Local development shares a conservative bucket.
    const address = process.env.VERCEL
      ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown"
      : "local";
    await rateLimit(
      database(),
      `auth:${action}:ip:${address}`,
      action === "sign-in" ? 60 : 20,
      900,
    );
    if (
      action === "sign-in" ||
      action === "forgot-password" ||
      action === "accept-invitation"
    ) {
      const email = emailAddress(body.email);
      await rateLimit(
        database(),
        `auth:${action}:email:${email}`,
        action === "sign-in" ? 10 : 5,
        900,
      );
      if (action === "sign-in") {
        if (
          typeof body.password !== "string" ||
          !body.password ||
          body.password.length > 128
        )
          throw new ApiError(401, "The email or password is incorrect.");
        const session = await transaction((db) =>
          signIn(db, email, body.password as string),
        );
        cookieStore.set(SESSION_COOKIE, session, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: SESSION_SECONDS,
        });
      } else if (action === "accept-invitation") {
        await transaction((db) =>
          acceptInvitation(
            db,
            body.token,
            email,
            text(body.name, "full name", 120),
            passwordValue(body.password),
          ),
        );
      } else {
        mailConfigured();
        const reset = await transaction((db) => createReset(db, email));
        if (reset) {
          try {
            await sendAccountEmail(email, reset, false);
          } catch {
            console.error("A password reset email could not be delivered.");
          }
        }
        // Always return the same response, regardless of account existence or delivery.
      }
    } else if (action === "reset-password") {
      await transaction((db) =>
        resetPassword(db, body.token, passwordValue(body.password)),
      );
      cookieStore.set(SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    }
    return reply({ ok: true });
  });
}
