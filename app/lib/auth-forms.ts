export type AuthMode =
  "sign-in" | "forgot-password" | "reset-password" | "accept-invitation";
export type AuthValues = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
};
export type AuthErrors = Partial<Record<keyof AuthValues, string>>;

export function validateAuthForm(mode: AuthMode, values: AuthValues): AuthErrors {
  const errors: AuthErrors = {};
  if (
    mode !== "reset-password" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  )
    errors.email = "Enter your work email address.";
  if (mode === "accept-invitation" && !values.name.trim())
    errors.name = "Enter your full name.";
  if (mode === "sign-in" && !values.password) errors.password = "Enter your password.";
  if (mode === "reset-password" || mode === "accept-invitation") {
    if (
      values.password.length < 12 ||
      !/[a-z]/i.test(values.password) ||
      !/\d/.test(values.password)
    )
      errors.password = "Use at least 12 characters, including a letter and a number.";
    if (!values.confirmPassword) errors.confirmPassword = "Enter your password again.";
    else if (values.confirmPassword !== values.password)
      errors.confirmPassword = "The passwords do not match.";
  }
  return errors;
}

type AuthResult = { ok: true } | { ok: false; message: string };

// The UI expects these same-origin endpoints to be supplied by the authentication
// service. An unavailable service never creates a session or reports success.
export async function submitAuthForm(
  mode: AuthMode,
  values: AuthValues,
  token?: string,
): Promise<AuthResult> {
  try {
    const payload =
      mode === "forgot-password"
        ? { email: values.email.trim() }
        : mode === "sign-in"
          ? { email: values.email.trim(), password: values.password }
          : mode === "reset-password"
            ? { token, password: values.password }
            : {
                token,
                email: values.email.trim(),
                name: values.name.trim(),
                password: values.password,
              };
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 404 || response.status === 503)
      return {
        ok: false,
        message:
          "Account access is currently unavailable. Please contact your workspace administrator.",
      };
    const result: unknown = await response.json();
    if (
      response.ok &&
      typeof result === "object" &&
      result !== null &&
      "ok" in result &&
      result.ok === true
    )
      return { ok: true };
    if (response.status === 401)
      return {
        ok: false,
        message: "The email or password is incorrect. Check your details and try again.",
      };
    if (response.status === 410)
      return {
        ok: false,
        message:
          "This link has expired. Request a new link or contact your administrator.",
      };
    return { ok: false, message: "We couldn’t complete this request. Please try again." };
  } catch {
    return {
      ok: false,
      message: "We couldn’t connect. Check your connection and try again.",
    };
  }
}
