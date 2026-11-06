"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import {
  submitAuthForm,
  validateAuthForm,
  type AuthErrors,
  type AuthMode,
  type AuthValues,
} from "../../lib/auth-forms";
import { cn } from "../../lib/cn";
import { Icon } from "../ui/icons";

const inputStyles = cn(
  "h-12 w-full min-w-0 rounded-lg border border-line bg-white px-3.5 text-base text-ink outline-none",
  "transition-shadow placeholder:text-[#98a4ab] focus:border-primary focus:ring-3 focus:ring-primary/10",
  "aria-invalid:border-[#b66852]",
);
const submitStyles = cn(
  "flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white",
  "transition-colors hover:bg-[#1c303b] disabled:cursor-wait disabled:opacity-60",
);
const linkStyles = cn(
  "inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline",
);

const copy: Record<AuthMode, { title: string; description: string; button: string }> = {
  "sign-in": {
    title: "Welcome back.",
    description: "Sign in with your work email to access the inventory workspace.",
    button: "Sign in",
  },
  "forgot-password": {
    title: "Forgot your password?",
    description: "Enter your work email and we’ll send you a link to reset it.",
    button: "Send reset link",
  },
  "reset-password": {
    title: "Choose a new password.",
    description: "Use a password you haven’t used for this account before.",
    button: "Save new password",
  },
  "accept-invitation": {
    title: "You’re invited.",
    description: "Set up your account to join the LSCCC inventory workspace.",
    button: "Create account",
  },
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  newPassword = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  newPassword?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={newPassword ? "new-password" : "current-password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(inputStyles, "pr-16")}
        />
        <button
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
          className="absolute inset-y-0 right-1 min-w-13 rounded-md px-2 text-xs font-semibold text-muted hover:text-primary"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs leading-5 text-[#a45142]">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [values, setValues] = useState<AuthValues>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const requiresToken = mode === "accept-invitation" || mode === "reset-password";
  const newPassword = requiresToken;
  const content = copy[mode];
  function set(field: keyof AuthValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const nextErrors = validateAuthForm(mode, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    setPending(true);
    setMessage("");
    const result = await submitAuthForm(mode, values, token);
    setPending(false);
    if (!result.ok) {
      setMessage(result.message);
      requestAnimationFrame(() => feedbackRef.current?.focus());
      return;
    }
    setValues((current) => ({ ...current, password: "", confirmPassword: "" }));
    if (mode === "sign-in") {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- A new session must discard the anonymous router cache.
      window.location.assign("/#overview");
    } else {
      setSuccess(true);
      requestAnimationFrame(() => feedbackRef.current?.focus());
    }
  }

  if (requiresToken && !token)
    return (
      <div className="space-y-5">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-muted">
          <Icon name="mail" size={16} />
          Account access
        </span>
        <h1 className="text-[30px] leading-tight font-semibold tracking-[-.04em]">
          {mode === "accept-invitation"
            ? "Open your invitation link."
            : "You’ll need a reset link."}
        </h1>
        <p className="text-sm leading-7 text-muted">
          {mode === "accept-invitation"
            ? "Use the link in your invitation email to set up your account. If you can’t find it, ask your workspace administrator to send a new invitation."
            : "Open the password reset link from your email, or request a new one below."}
        </p>
        {mode === "reset-password" && (
          <Link href="/forgot-password" className={submitStyles}>
            Request a reset link <Icon name="arrow" size={16} />
          </Link>
        )}
        <Link href="/sign-in" className={linkStyles}>
          <Icon name="arrow" size={16} className="rotate-180" />
          Back to sign in
        </Link>
      </div>
    );

  if (success)
    return (
      <div
        ref={feedbackRef}
        tabIndex={-1}
        className="space-y-5 outline-none"
        role="status"
      >
        <span className="grid size-11 place-items-center rounded-full bg-[#e4eee7] text-success">
          <Icon name="check" size={22} />
        </span>
        <h1 className="text-[30px] leading-tight font-semibold tracking-[-.04em]">
          {mode === "forgot-password"
            ? "Check your inbox."
            : mode === "accept-invitation"
              ? "Your account is ready."
              : "Password updated."}
        </h1>
        <p className="text-sm leading-7 text-muted">
          {mode === "forgot-password"
            ? "If there’s an account for this email, a password reset link is on its way. Check your spam folder too."
            : "You can now sign in to the inventory workspace with your work email and password."}
        </p>
        <Link href="/sign-in" className={submitStyles}>
          Back to sign in <Icon name="arrow" size={16} />
        </Link>
        {mode === "forgot-password" && (
          <button type="button" className={linkStyles} onClick={() => setSuccess(false)}>
            Use a different email
          </button>
        )}
      </div>
    );

  return (
    <div>
      {mode !== "sign-in" && (
        <Link href="/sign-in" className={cn(linkStyles, "mb-5")}>
          <Icon name="arrow" size={16} className="rotate-180" />
          Back to sign in
        </Link>
      )}
      <span className="mb-4 block text-[11px] font-semibold tracking-[.14em] text-muted uppercase">
        Staff access
      </span>
      <h1 className="text-[32px] leading-tight font-semibold tracking-[-.045em]">
        {content.title}
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted">{content.description}</p>
      <form
        ref={formRef}
        onSubmit={submit}
        noValidate
        aria-busy={pending}
        className="mt-8 space-y-5"
      >
        {mode === "accept-invitation" && (
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={inputStyles}
            />
            {errors.name && (
              <p id="name-error" className="text-xs leading-5 text-[#a45142]">
                {errors.name}
              </p>
            )}
          </div>
        )}
        {mode !== "reset-password" && (
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              placeholder="name@organisation.gov.ng"
              required
              value={values.email}
              onChange={(event) => set("email", event.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={inputStyles}
            />
            {errors.email && (
              <p id="email-error" className="text-xs leading-5 text-[#a45142]">
                {errors.email}
              </p>
            )}
          </div>
        )}
        {mode !== "forgot-password" && (
          <PasswordField
            id="password"
            label={newPassword ? "New password" : "Password"}
            value={values.password}
            onChange={(value) => set("password", value)}
            error={errors.password}
            newPassword={newPassword}
          />
        )}
        {newPassword && (
          <>
            <ul
              className="grid gap-1.5 text-xs text-muted"
              aria-label="Password requirements"
            >
              {[
                { label: "At least 12 characters", met: values.password.length >= 12 },
                {
                  label: "Includes a letter and a number",
                  met: /[a-z]/i.test(values.password) && /\d/.test(values.password),
                },
              ].map((rule) => (
                <li
                  key={rule.label}
                  className={cn("flex items-center gap-2", rule.met && "text-success")}
                >
                  <Icon name={rule.met ? "check" : "close"} size={13} />
                  {rule.label}
                </li>
              ))}
            </ul>
            <PasswordField
              id="confirmPassword"
              label="Confirm password"
              value={values.confirmPassword}
              onChange={(value) => set("confirmPassword", value)}
              error={errors.confirmPassword}
              newPassword
            />
          </>
        )}
        {mode === "sign-in" && (
          <div className="-mt-2 flex justify-end">
            <Link href="/forgot-password" className={linkStyles}>
              Forgot password?
            </Link>
          </div>
        )}
        {message && (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            role="alert"
            className="rounded-lg border border-[#e9cfc6] bg-[#fbf1ed] p-3 text-sm leading-6 text-[#9a503e] outline-none"
          >
            {message}
          </div>
        )}
        <button type="submit" className={submitStyles} disabled={pending}>
          {pending ? "Please wait…" : content.button}
          {!pending && <Icon name="arrow" size={16} />}
        </button>
      </form>
      <div className="mt-8 border-t border-line pt-5">
        <p className="text-xs leading-6 text-muted">
          {mode === "accept-invitation"
            ? "Your administrator manages your role and workspace access."
            : "Access is by invitation. Contact your workspace administrator if you need an account."}
        </p>
      </div>
    </div>
  );
}
