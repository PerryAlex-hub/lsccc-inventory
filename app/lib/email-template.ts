type AccountEmail = {
  invitation: boolean;
  actionUrl: string;
};

const logoUrl =
  "https://br-flat-fog-b57cug9w.storage.c-7.us-east-2.aws.neon.tech/lsccc-media/branding/lsccc-emblem-c3dfbe3aa4037681.jpg";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
}

export function accountEmailTemplate({ invitation, actionUrl }: AccountEmail) {
  const subject = invitation
    ? "Your invitation to LSCCC Inventory"
    : "Reset your LSCCC Inventory password";
  const heading = invitation
    ? "Join the inventory workspace."
    : "Let’s get you signed in again.";
  const introduction = invitation
    ? "You have been invited to the Lagos State Command &amp; Control Centre inventory workspace. Create your account to work with the centre’s equipment records."
    : "We received a request to reset the password for your LSCCC Inventory account. Choose a new password using the secure link below.";
  const button = invitation ? "Accept invitation" : "Reset password";
  const expiry = invitation ? "48 hours" : "30 minutes";
  const nextStep = invitation
    ? "Enter your name, choose a password, then sign in with the email address that received this invitation."
    : "Once your password is updated, sign in again. Your existing sessions will be signed out to keep your account secure.";
  const safety = invitation
    ? "Wasn’t expecting this invitation? You can ignore this email. If you need a fresh link, ask your workspace administrator to resend it."
    : "Didn’t request a password reset? You can ignore this email. Your password will stay the same.";
  const action = escapeHtml(actionUrl);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f2f5f4;color:#263b47;font-family:'Segoe UI',Tahoma,Verdana,sans-serif;-webkit-text-size-adjust:100%;">
    <div style="display:none;font-size:1px;line-height:1px;color:#f2f5f4;max-height:0;max-width:0;overflow:hidden;mso-hide:all;">${invitation ? "Your staff invitation is ready." : "A secure link to choose a new password."} This link expires in ${expiry}.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#f2f5f4;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border:1px solid #dce4e1;border-radius:12px;background-color:#ffffff;">
            <tr>
              <td style="padding:28px 24px 24px;border-bottom:1px solid #e1e6e9;">
                <img src="${logoUrl}" alt="Lagos State Command &amp; Control Centre emblem" width="64" height="60" style="display:block;width:64px;height:60px;margin:0 0 16px;border:0;" />
                <p style="margin:0 0 5px;font-size:28px;line-height:34px;font-weight:700;letter-spacing:-0.9px;color:#263b47;">LSCCC<span style="color:#6c8a76;">.</span></p>
                <p style="margin:0;font-size:11px;line-height:17px;font-weight:600;letter-spacing:1.3px;color:#65766d;">INVENTORY WORKSPACE</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 24px 28px;">
                <p style="margin:0 0 16px;font-size:11px;line-height:18px;font-weight:700;letter-spacing:1.3px;color:#527460;">${invitation ? "STAFF INVITATION" : "ACCOUNT SECURITY"}</p>
                <h1 style="margin:0 0 20px;max-width:430px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:39px;font-weight:400;letter-spacing:-0.7px;color:#263b47;">${heading}</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:25px;color:#52636d;">Hello,</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:25px;color:#52636d;">${introduction}</p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                  <tr>
                    <td bgcolor="#263b47" align="center" style="border-radius:6px;background-color:#263b47;mso-padding-alt:15px 24px;">
                      <a href="${action}" style="display:inline-block;padding:15px 24px;border:1px solid #263b47;border-radius:6px;background-color:#263b47;color:#ffffff;text-decoration:none;font-size:15px;line-height:20px;font-weight:600;mso-padding-alt:0;text-underline-color:#263b47;">${button}</a>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#edf3ef;border-left:3px solid #6c8a76;">
                  <tr>
                    <td style="padding:16px;">
                      <p style="margin:0 0 7px;font-size:13px;line-height:20px;font-weight:700;color:#365641;">Your link expires in ${expiry}.</p>
                      <p style="margin:0;font-size:13px;line-height:21px;color:#52675a;">${nextStep}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 8px;font-size:12px;line-height:20px;color:#728079;">If the button doesn’t open, copy this link into your browser:</p>
                <p style="margin:0;font-size:12px;line-height:20px;word-break:break-all;overflow-wrap:anywhere;"><a href="${action}" style="color:#365b47;text-decoration:underline;word-break:break-all;">${action}</a></p>
                <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #e1e6e9;font-size:12px;line-height:21px;color:#728079;">${safety} Don’t share this link with anyone.</p>
              </td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]-->
          <p style="margin:20px 12px 4px;font-size:12px;line-height:19px;font-weight:600;color:#52675a;">Lagos State Command &amp; Control Centre</p>
          <p style="margin:0 12px;font-size:11px;line-height:18px;color:#7a8780;">Equipment, custody and maintenance. Accounted for.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${subject}\n\nLagos State Command & Control Centre\nInventory workspace\n\nHello,\n\n${introduction.replaceAll("&amp;", "&")}\n\n${button}:\n${actionUrl}\n\nThis link expires in ${expiry}. ${nextStep}\n\n${safety} Don’t share this link with anyone.`;
  return { subject, html, text };
}
