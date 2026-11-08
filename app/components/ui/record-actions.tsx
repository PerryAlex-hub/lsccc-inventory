import type { RecordRequest, RecordTarget } from "../../lib/record-actions";

export function RecordActions({
  target,
  archived,
  onAction,
  disabled = false,
}: {
  target: RecordTarget;
  archived?: boolean;
  onAction: (request: RecordRequest) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={`Actions for ${target.id}`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        disabled={disabled}
        className="min-h-11 rounded-md px-2 text-xs font-semibold text-primary hover:bg-canvas disabled:opacity-50"
        onClick={() => onAction({ ...target, action: archived ? "restore" : "archive" })}
      >
        {archived ? "Restore" : "Archive"}
      </button>
      <button
        type="button"
        disabled={disabled}
        className="min-h-11 rounded-md px-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        onClick={() => onAction({ ...target, action: "delete" })}
      >
        Delete
      </button>
    </div>
  );
}
