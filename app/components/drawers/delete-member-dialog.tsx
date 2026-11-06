"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Member } from "../../lib/access";
import { Button } from "../ui/button";
import { Field, Input } from "../ui/form-fields";

export function DeleteMemberDialog({
  member,
  onClose,
  onDelete,
}: {
  member: Member;
  onClose: () => void;
  onDelete: (email: string) => Promise<string | null>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || confirmation.trim().toLowerCase() !== member.email) return;
    setPending(true);
    const result = await onDelete(confirmation);
    setPending(false);
    if (result) {
      setError(result);
      requestAnimationFrame(() => errorRef.current?.focus());
    } else onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-member-title"
      aria-describedby="delete-member-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-lg overflow-y-auto rounded-xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-[#1b22266b]"
    >
      <form onSubmit={submit} className="p-5 sm:p-7">
        <span className="text-[11px] font-bold tracking-wider text-red-700 uppercase">
          Permanent account removal
        </span>
        <h2 id="delete-member-title" className="mt-3 text-xl font-semibold">
          Delete {member.name}’s account?
        </h2>
        <p id="delete-member-description" className="mt-3 text-sm leading-6 text-muted">
          Their access has already been revoked. Deleting removes their sign-in account
          and reset links. Equipment, custody records, and recorded activity remain in the
          workspace.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          To return later, they will need a new invitation and account.
        </p>
        <div className="mt-5">
          <Field>
            <span>Type their email to confirm deletion</span>
            <strong className="block text-sm wrap-anywhere">{member.email}</strong>
            <Input
              type="email"
              name="confirmEmail"
              autoComplete="off"
              required
              value={confirmation}
              disabled={pending}
              onChange={(event) => {
                setConfirmation(event.target.value);
                setError("");
              }}
            />
          </Field>
        </div>
        {error && (
          <p
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={onClose}
            autoFocus
          >
            Keep account
          </Button>
          <button
            type="submit"
            disabled={pending || confirmation.trim().toLowerCase() !== member.email}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-red-700 bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            {pending ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
