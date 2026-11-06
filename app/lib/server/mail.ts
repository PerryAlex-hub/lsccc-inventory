import "server-only";
import { appOrigin } from "./security";
import { accountEmailTemplate } from "../email-template";

export function mailConfigured() {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL)
    throw new Error("Brevo email is not configured.");
  appOrigin();
}

export async function sendAccountEmail(
  email: string,
  rawToken: string,
  invitation: boolean,
) {
  mailConfigured();
  const url = new URL(invitation ? "/accept-invitation" : "/reset-password", appOrigin());
  url.searchParams.set("token", rawToken);
  const template = accountEmailTemplate({ invitation, actionUrl: url.toString() });
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || "LSCCC Inventory",
      },
      to: [{ email }],
      subject: template.subject,
      htmlContent: template.html,
      textContent: template.text,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new Error(`Brevo rejected an account email (${response.status}).`);
}
