import { Suspense } from "react";
import type { AuthMode } from "../../lib/auth-forms";
import { AuthForm } from "./auth-form";

export function AuthScreen({ mode }: { mode: AuthMode }) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-5" role="status">
          <span className="sr-only">Loading account access…</span>
          <div className="h-9 w-3/4 rounded bg-line" />
          <div className="h-12 rounded bg-line" />
          <div className="h-12 rounded bg-line" />
        </div>
      }
    >
      <AuthForm mode={mode} />
    </Suspense>
  );
}
