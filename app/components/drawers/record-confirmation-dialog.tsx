"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { recordActionDescription, type RecordRequest } from "../../lib/record-actions";
import { Button } from "../ui/button";
import { Field, Input } from "../ui/form-fields";

export function RecordConfirmationDialog({
  request,
  onClose,
  onConfirm,
}: {
  request: RecordRequest;
  onClose: () => void;
  onConfirm: (request: RecordRequest) => Promise<string | null>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const deleting = request.action === "delete";
  const verb = deleting ? "Delete" : request.action === "archive" ? "Archive" : "Restore";

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current || (deleting && confirmation.trim() !== request.id)) return;
    submitting.current = true;
    setPending(true);
    try {
      const result = await onConfirm(request);
      if (result) {
        setError(result);
        requestAnimationFrame(() => errorRef.current?.focus());
      } else onClose();
    } catch {
      setError("This change could not be saved. Check your connection and try again.");
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="record-confirm-title"
      aria-describedby="record-confirm-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!submitting.current) onClose();
      }}
      onKeyDown={(event) => event.stopPropagation()}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-lg overflow-y-auto rounded-xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-[#1b22266b]"
    >
      <form onSubmit={submit} className="p-5 sm:p-7" aria-busy={pending}>
        <span
          className={`text-[11px] font-bold tracking-wider uppercase ${deleting ? "text-red-700" : "text-muted"}`}
        >
          {deleting ? "Permanent record removal" : "Manage record"}
        </span>
        <h2 id="record-confirm-title" className="mt-3 text-xl font-semibold">
          {verb} this record?
        </h2>
        <div className="mt-4 rounded-lg border border-line bg-canvas p-3">
          <p className="text-sm font-semibold wrap-anywhere">{request.label}</p>
          <p className="mt-1 text-xs wrap-anywhere text-muted">{request.id}</p>
        </div>
        <p id="record-confirm-description" className="mt-4 text-sm leading-6 text-muted">
          {recordActionDescription(request.collection, request.action)}
        </p>
        {deleting && (
          <div className="mt-5">
            <Field>
              <span>
                Type <strong>{request.id}</strong> to confirm deletion
              </span>
              <Input
                name="confirmRecord"
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
        )}
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
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={pending || (deleting && confirmation.trim() !== request.id)}
            className={
              deleting
                ? "min-h-11 border-red-700 bg-red-700 hover:border-red-800 hover:bg-red-800 disabled:opacity-50"
                : "min-h-11 disabled:opacity-50"
            }
          >
            {pending
              ? deleting
                ? "Deleting…"
                : request.action === "archive"
                  ? "Archiving…"
                  : "Restoring…"
              : `${verb} record`}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
